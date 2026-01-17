"use client"

import { useState } from "react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { Cover } from "@/components/cover"
import { Toolbar } from "@/components/toolbar"

interface DocumentHeaderProps {
  page: any
  preview?: boolean
}

export const DocumentHeader = ({ page, preview }: DocumentHeaderProps) => {
  const [title, setTitle] = useState(page.title)

  const handleTitleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    await updateDocument(page.id, { title: newTitle })
  }

  return (
    <div className="pb-10">
      <Cover url={page.coverImage} pageId={page.id} />
      
      <div className="px-12 pt-12">
        <Toolbar page={page} preview={preview} />

        <div className="mt-4">
          <textarea
            value={title}
            onChange={handleTitleChange}
            className="text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] bg-transparent resize-none w-full"
            placeholder="Untitled"
            rows={1}
            disabled={preview}
          />
        </div>
      </div>
    </div>
  )
}
