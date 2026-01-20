"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Settings, Trash } from "lucide-react"
import { createPage, getPages } from "@/actions/page"
import { useSession } from "next-auth/react"
import { useDocumentsStore } from "@/store/use-documents-store"
import { useSocket } from "@/components/providers/socket-provider"
import { PageItem } from "./page-item"

export const Sidebar = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const { documents, setDocuments, addDocument, updateDocument, removeDocument } = useDocumentsStore()
  const { socket } = useSocket()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      loadPages()
    }
  }, [session])

  useEffect(() => {
    if (!socket) return

    socket.on("doc:create", (newDoc) => {
      addDocument(newDoc)
    })

    socket.on("doc:update", ({ id, ...updates }) => {
      updateDocument(id, updates)
    })

    socket.on("doc:delete", (id) => {
      removeDocument(id)
    })

    return () => {
      socket.off("doc:create")
      socket.off("doc:update")
      socket.off("doc:delete")
    }
  }, [socket, addDocument, updateDocument, removeDocument])

  const loadPages = async () => {
    if (!session?.user?.id) return

    try {
      const fetchedPages = await getPages()
      setDocuments(fetchedPages)
    } catch (error) {
      console.error("Error loading pages:", error)
    }
  }

  const handleCreatePage = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const page = await createPage()
      // We can rely on socket or optimistically update. 
      // For now, let's just push and let socket sync or manual load? 
      // Existing code called loadPages().
      // If we emit event from server, we don't need loadPages here if we trust socket.
      // But let's keep loadPages or manual add for safety until server emit is confirmed working.
      // Actually, let's just add it locally immediately to be snappy.
      addDocument(page)
      router.push(`/documents/${page.id}`)
    } catch (error) {
      console.error("Error creating page:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <aside className="group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]">
      <div className="p-3">
        <div className="flex items-center gap-x-2 mb-4">
          <div className="flex items-center gap-x-2 flex-1">
            <span className="text-sm font-medium tracking-tight truncate">
              {session?.user?.name?.split(' ')[0]}'s Notion
            </span>
          </div>
          <button className="opacity-0 group-hover/sidebar:opacity-100 transition">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <button
            className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>

          <button
            onClick={handleCreatePage}
            disabled={isLoading}
            className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Page</span>
          </button>

          <button
            className="w-full flex items-center gap-x-2 px-2 py-1.5 text-sm hover:bg-primary/5 rounded-sm"
          >
            <Trash className="h-4 w-4" />
            <span>Trash</span>
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground px-2 mb-2">
            Private
          </p>
          <div className="space-y-1">
            {documents.filter(doc => !doc.isArchived).map((page) => (
              <PageItem
                key={page.id}
                page={page}
                onRefresh={loadPages}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
