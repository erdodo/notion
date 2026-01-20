"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { useDebouncedCallback } from "use-debounce"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { useSocket } from "@/components/providers/socket-provider"

// Import BlockNote editor dynamically to prevent SSR issues
const BlockNoteEditorComponent = dynamic(
  () => import("./blocknote-editor").then((mod) => mod.BlockNoteEditorComponent),
  { ssr: false }
)

interface DocumentEditorProps {
  documentId: string
  initialContent?: string | null
  editable?: boolean
}

export default function DocumentEditor({ documentId, initialContent, editable = true }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent || "")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)


  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    // Join the room for this document
    socket.emit("join-room", `document-${documentId}`)

    // Listen for updates
    socket.on("doc:update", (data: any) => {
      // If we receive content update and it's different, update state
      // We should be careful about overwriting user's own typing
      // Ideally we check if the update came from another user, but simplified:
      if (data.content && data.content !== content) {
        setContent(data.content)
      }
    })

    return () => {
      socket.emit("leave-room", `document-${documentId}`)
      socket.off("doc:update")
    }
  }, [documentId, content, socket])

  // Debounced save function - waits 2 seconds after user stops typing
  const debouncedSave = useDebouncedCallback(
    async (newContent: string) => {
      if (!editable) return

      setIsSaving(true)
      try {
        await updateDocument(documentId, { content: newContent })
        setLastSaved(new Date())
      } catch (error) {
        console.error("Error saving content:", error)
      } finally {
        setIsSaving(false)
      }
    },
    2000 // 2 second delay
  )

  const handleContentChange = useCallback((newContent: string) => {
    if (!editable) return
    setContent(newContent)
    debouncedSave(newContent)
  }, [debouncedSave, editable])

  return (

    <div className="relative">
      {/* Save indicator */}
      {editable && (
        <div className="absolute top-0 right-0 text-xs text-muted-foreground">
          {isSaving && <span>Saving...</span>}
          {!isSaving && lastSaved && <span>Saved</span>}
        </div>
      )}

      <BlockNoteEditorComponent
        initialContent={content}
        onChange={handleContentChange}
        editable={editable}
        documentId={documentId}
      />
    </div>

  )
}
