"use client"

import { useState } from "react"
import { Editor } from "./editor"
import { updatePage } from "@/actions/page"

interface DocumentEditorProps {
  page: any
}

export const DocumentEditor = ({ page }: DocumentEditorProps) => {
  const [content, setContent] = useState(page.content || "")

  const handleContentChange = async (newContent: string) => {
    setContent(newContent)
    await updatePage(page.id, { content: newContent })
  }

  return (
    <div className="px-12 pb-40">
      <Editor
        initialContent={content}
        onChange={handleContentChange}
      />
    </div>
  )
}
