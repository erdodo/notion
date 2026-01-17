"use client"

import { useState } from "react"
import { updatePage } from "@/actions/page"
import { Smile, Image as ImageIcon } from "lucide-react"

interface DocumentHeaderProps {
  page: any
}

export const DocumentHeader = ({ page }: DocumentHeaderProps) => {
  const [title, setTitle] = useState(page.title)

  const handleTitleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    await updatePage(page.id, { title: newTitle })
  }

  const handleIconSelect = async (icon: string) => {
    await updatePage(page.id, { icon })
  }

  return (
    <div className="pb-10 px-12 pt-12">
      {page.coverImage && (
        <div className="relative w-full h-[35vh] group">
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center gap-x-2 mt-10">
        {page.icon ? (
          <button
            className="text-6xl hover:opacity-75 transition"
            onClick={() => {}}
          >
            {page.icon}
          </button>
        ) : (
          <button
            className="h-12 w-12 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center"
            onClick={() => {}}
          >
            <Smile className="h-6 w-6 text-muted-foreground" />
          </button>
        )}
        
        {!page.coverImage && (
          <button
            className="h-12 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-x-2 text-sm text-muted-foreground"
            onClick={() => {}}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Add cover</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        <textarea
          value={title}
          onChange={handleTitleChange}
          className="text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] bg-transparent resize-none w-full"
          placeholder="Untitled"
          rows={1}
        />
      </div>
    </div>
  )
}
