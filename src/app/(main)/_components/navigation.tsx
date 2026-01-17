"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, Search, Settings, Trash, MenuIcon, ChevronsLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSearch } from "@/hooks/use-search"
import { useSettings } from "@/hooks/use-settings"
import { useSession } from "next-auth/react"
import { getSidebarDocuments, createDocument, getArchivedDocuments } from "../_actions/documents"
import { DocumentList } from "./document-list"
import { ItemSkeleton } from "./item-skeleton"
import { TrashBox } from "@/components/trash-box"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const search = useSearch()
  const settings = useSettings()
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  const isResizingRef = useRef(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(isMobile)
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [archivedDocuments, setArchivedDocuments] = useState<any[]>([])

  useEffect(() => {
    if (isMobile) {
      collapse()
    } else {
      resetWidth()
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      collapse()
    }
  }, [pathname, isMobile])

  useEffect(() => {
    loadDocuments()
    loadArchivedDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await getSidebarDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadArchivedDocuments = async () => {
    try {
      const docs = await getArchivedDocuments()
      setArchivedDocuments(docs)
    } catch (error) {
      console.error("Error loading archived documents:", error)
    }
  }

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

  const resetWidth = () => {
    if (sidebarRef.current) {
      setIsCollapsed(false)
      setIsResetting(true)

      sidebarRef.current.style.width = isMobile ? "100%" : "240px"

      setTimeout(() => {
        setIsResetting(false)
      }, 300)
    }
  }

  const collapse = () => {
    if (sidebarRef.current) {
      setIsCollapsed(true)
      setIsResetting(true)

      sidebarRef.current.style.width = "0"

      setTimeout(() => {
        setIsResetting(false)
      }, 300)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const document = await createDocument("Untitled")
      await loadDocuments()
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
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        
        <div className="p-3">
          <div className="flex items-center gap-x-2 mb-4">
            <div className="flex items-center gap-x-2 flex-1">
              <span className="text-sm font-medium">
                {session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0]}'s Notion
              </span>
            </div>
            <button 
              onClick={settings.onOpen}
              className="opacity-0 group-hover/sidebar:opacity-100 transition text-muted-foreground hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-sm p-1"
            >
              <Settings className="h-4 w-4" />
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

            <Popover>
              <PopoverTrigger className="w-full">
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
                <TrashBox documents={archivedDocuments} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground px-2 mb-2">
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
              <DocumentList data={documents} />
            )}
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
          onClick={collapse}
          className="fixed inset-0 z-[99998] bg-black/50"
        />
      )}

      {isMobile && (
        <div className="absolute top-0 left-0 z-[99999]">
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
    </>
  )
}
