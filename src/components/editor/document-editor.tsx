"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { useDebouncedCallback } from "use-debounce"
import { updateDocument } from "@/app/(main)/_actions/documents"

// Import BlockNote editor dynamically to prevent SSR issues
const BlockNoteEditorComponent = dynamic(
  () => import("./blocknote-editor").then((mod) => mod.BlockNoteEditorComponent),
  { ssr: false }
)

interface DocumentEditorProps {
  page: any
}

export const DocumentEditor = ({ page }: DocumentEditorProps) => {
  const [content, setContent] = useState(page.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Debounced save function - waits 2 seconds after user stops typing
  const debouncedSave = useDebouncedCallback(
    async (newContent: string) => {
      setIsSaving(true)
      try {
        await updateDocument(page.id, { content: newContent })
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
    setContent(newContent)
    debouncedSave(newContent)
  }, [debouncedSave])

  return (
    <div className="px-12 pb-40">
      <div className="relative">
        {/* Save indicator */}
        <div className="absolute top-0 right-0 text-xs text-muted-foreground">
          {isSaving && <span>Saving...</span>}
          {!isSaving && lastSaved && <span>Saved</span>}
        </div>

        <BlockNoteEditorComponent
          initialContent={content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  )
}
