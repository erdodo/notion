"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { PartialBlock } from "@blocknote/core"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  editable?: boolean
}

export const BlockNoteEditorComponent = ({
  initialContent,
  onChange,
  editable = true
}: BlockNoteEditorProps) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Parse initial content from JSON string
  const parsedContent = useMemo(() => {
    if (!initialContent) {
      return undefined
    }
    
    try {
      return JSON.parse(initialContent) as PartialBlock[]
    } catch (error) {
      console.error("Error parsing initial content:", error)
      return undefined
    }
  }, [initialContent])

  // Create editor instance using the hook
  const editor = useCreateBlockNote({
    initialContent: parsedContent
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle changes
  const handleEditorChange = () => {
    const blocks = editor.document
    const jsonContent = JSON.stringify(blocks)
    onChange(jsonContent)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="blocknote-editor">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
      />
    </div>
  )
}
