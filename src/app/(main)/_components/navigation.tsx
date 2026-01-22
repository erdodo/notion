"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, Search, Settings, Trash, MenuIcon, ChevronsLeft, Upload, Star, Globe, Clock, Users } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSearch } from "@/hooks/use-search"
import { useSettings } from "@/hooks/use-settings"
import { useSession } from "next-auth/react"
import { getSidebarDocuments, createDocument, getArchivedDocuments, getSharedDocuments } from "../_actions/documents"
import { getFavorites, getRecentPages, getPublishedPages } from "../_actions/navigation"
import { createDatabase as createDatabaseAction } from "../_actions/database"
import { useSidebar } from "@/hooks/use-sidebar"
import { useDocumentsStore } from "@/store/use-documents-store"
import { useSocket } from "@/components/providers/socket-provider"
import { SortableDocumentList } from "./sortable-document-list"
import { SidebarSection } from "./sidebar-section"
import { ItemSkeleton } from "./item-skeleton"
import { TrashBox } from "@/components/trash-box"
import { ImportModal } from "@/components/modals/import-modal"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"

interface Document {
  id: string
  title: string
  icon?: string | null
  parentDocument?: string | null
  isArchived: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    children: number
  }
}

export const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const search = useSearch()
  const settings = useSettings()
  const { isCollapsed, toggle, collapse, expand } = useSidebar()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const {
    documents,
    setDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    setTrashPages,
    trashPages,
    archiveDocument,
    recentPages,
    setRecentPages,
    favoritePages,
    setFavoritePages,
    publishedPages,
    setPublishedPages,
    sharedPages,
    setSharedPages
  } = useDocumentsStore()
  const { socket } = useSocket()

  const isResizingRef = useRef(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResetting, setIsResetting] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const resetWidth = useCallback(() => {
    if (sidebarRef.current) {
      expand()
      setIsResetting(true)

      sidebarRef.current.style.width = isMobile ? "100%" : "240px"

      setTimeout(() => {
        setIsResetting(false)
      }, 300)
    }
  }, [isMobile, expand])

  const handleCollapse = useCallback(() => {
    if (sidebarRef.current) {
      collapse()
      setIsResetting(true)

      sidebarRef.current.style.width = "0"

      setTimeout(() => {
        setIsResetting(false)
      }, 300)
    }
  }, [collapse])

  useEffect(() => {
    if (isMobile) {
      handleCollapse()
    } else {
      resetWidth()
    }
  }, [isMobile, handleCollapse, resetWidth])

  useEffect(() => {
    if (isMobile) {
      handleCollapse()
    }
  }, [pathname, isMobile, handleCollapse])

  // Sync width with store state changes if externally toggled
  useEffect(() => {
    if (isCollapsed && sidebarRef.current && sidebarRef.current.style.width !== "0px") {
      handleCollapse()
    } else if (!isCollapsed && sidebarRef.current && sidebarRef.current.style.width === "0px") {
      resetWidth()
    }
  }, [isCollapsed, handleCollapse, resetWidth])

  // Socket Listeners for Sidebar Data Freshness
  // We need to listen to generic updates and possibly re-fetch specific lists if we want 100% accuracy
  // OR we rely on generic doc:update to patch specific lists (which store.updateDocument does)
  // But adding/removing from favorites/recent requires specific events or manual fetch on change.
  // For now, let's stick to base document events.
  useEffect(() => {
    if (!socket) return

    socket.on("doc:create", (payload) => {
      // Server emits { document, userId }
      if (payload?.document) {
        addDocument(payload.document)
        // Also add to recent pages since we just created/opened it
        setRecentPages([payload.document, ...recentPages.slice(0, 9)])
      }
    })

    socket.on("doc:update", (payload) => {
      // Server emits { id, updates, userId }
      if (payload?.id && payload?.updates) {
        updateDocument(payload.id, payload.updates)
        if (payload.updates.isArchived === true) {
          archiveDocument(payload.id)
        }
      }
    })

    socket.on("doc:delete", (payload) => {
      // Server emits { id, userId }
      if (payload?.id) {
        removeDocument(payload.id)
      }
    })

    socket.on("doc:archive", (payload) => {
      // Server emits { id, userId }
      if (payload?.id) {
        archiveDocument(payload.id)
      }
    })

    return () => {
      socket.off("doc:create")
      socket.off("doc:update")
      socket.off("doc:delete")
      socket.off("doc:archive")
    }
  }, [socket, addDocument, updateDocument, removeDocument, archiveDocument])

  // Initial Load of All Data
  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [docs, archived, recent, favorites, published, shared] = await Promise.all([
        getSidebarDocuments(),
        getArchivedDocuments(),
        getRecentPages(),
        getFavorites(),
        getPublishedPages(),
        getSharedDocuments()
      ])

      setDocuments(docs)
      setRecentPages(recent)
      setFavoritePages(favorites)
      setPublishedPages(published)
      setSharedPages(shared)
      setTrashPages(archived)

    } catch (error) {
      console.error("Error loading sidebar data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()

    // Listen for custom events that might trigger re-fetch of specific lists (like favorites)
    const handleFavoriteChange = () => {
      getFavorites().then(setFavoritePages)
    }
    document.addEventListener('favorite-changed', handleFavoriteChange)
    return () => document.removeEventListener('favorite-changed', handleFavoriteChange)
  }, [])

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault()
    event.stopPropagation()

    isResizingRef.current = true
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return

    let newWidth = event.clientX

    if (newWidth < 240) newWidth = 240
    if (newWidth > 480) newWidth = 480

    if (sidebarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`
    }
  }

  const handleMouseUp = () => {
    isResizingRef.current = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const document = await createDocument("Untitled")
      // No need to loadDocuments, optimistic update or socket will handle it?
      // Actually create returns the doc, we can add it directly.
      // But socket might also send it back? 
      // Current implementation broadcasts doc:create, so we might get duplicate if we also add here.
      // But we are the creator, so maybe we should add immediately for speed.
      // Store `addDocument` usually brings to top.
      // Let's rely on socket or `loadDocuments` if we want to be sure.
      // For now, let's re-fetch to be safe or just push.
      router.push(`/documents/${document.id}`)
    } catch (error) {
      console.error("Error creating document:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-10",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between gap-x-2 mb-4">
              <div className="flex items-center gap-x-1 flex-1">
                <span className="text-sm font-medium">
                  {session?.user?.name?.split(' ')[0] || "Guest"}'s Notion
                </span>
                <NotificationsDropdown />
              </div>

              <button
                onClick={handleCollapse}
                type="button"
                className={cn(
                  "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 group-hover/sidebar:opacity-100 transition opacity-100"
                )}
              >
                <ChevronsLeft className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={search.onOpen}
                className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                <span>New Page</span>
              </button>
            </div>

            <hr className="my-2" />

            <div className="mt-4">
              {/* Favorites */}
              <SidebarSection
                label="Favorites"
                icon={Star}
                data={favoritePages}
              />

              {/* Published */}
              <SidebarSection
                label="Published"
                icon={Globe}
                data={publishedPages}
              />

              {/* Recent */}
              <SidebarSection
                label="Recent"
                icon={Clock}
                data={recentPages}
              />

              {/* Shared */}
              <SidebarSection
                label="Shared"
                icon={Users}
                data={sharedPages}
              />

              <hr className="my-2" />

              <p className="text-xs text-muted-foreground px-2 mb-2 pt-4">
                Private
              </p>

              {isLoading && (
                <div className="space-y-1">
                  <ItemSkeleton />
                  <ItemSkeleton />
                  <ItemSkeleton />
                </div>
              )}

              {!isLoading && (
                <SortableDocumentList
                  documents={documents}
                  parentId={null}
                  level={0}
                />
              )}
            </div>
          </div>

          <div className="p-3 border-t bg-secondary/50">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm text-muted-foreground"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm text-muted-foreground"
                >
                  <Trash className="h-4 w-4" />
                  <span>Trash</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-72"
                side={isMobile ? "bottom" : "right"}
              >
                <TrashBox documents={trashPages} />
              </PopoverContent>
            </Popover>
            <button
              onClick={settings.onOpen}
              className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm text-muted-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>

      {isMobile && !isCollapsed && (
        <div
          onClick={handleCollapse}
          className="fixed inset-0 z-40 bg-black/50"
        />
      )}

      {(
        <div className="absolute top-0 left-0 z-50">
          {isCollapsed && (
            <button
              onClick={resetWidth}
              className="h-10 w-10 flex items-center justify-center rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 m-2"
            >
              <MenuIcon className="h-6 w-6 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </>
  )
}
