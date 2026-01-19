"use client"

import { useState, useEffect, useRef } from "react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { Cover } from "@/components/cover"
import { Toolbar } from "@/components/toolbar"


import TextareaAutosize from "react-textarea-autosize"

interface DocumentHeaderProps {
  page: any
  preview?: boolean
}

export const DocumentHeader = ({ page, preview }: DocumentHeaderProps) => {
  const [title, setTitle] = useState(page.title)
  const previousTitleRef = useRef(page.title)

  const saveTitle = async (newTitle: string) => {
    if (newTitle === previousTitleRef.current) return

    previousTitleRef.current = newTitle

    // Optimistic update
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, title: newTitle }
    }))

    await updateDocument(page.id, { title: newTitle })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    saveTitle(title)
  }

  // Handle programmatic changes (e.g., from E2E tests)
  useEffect(() => {
    if (title !== previousTitleRef.current && title !== page.title) {
      saveTitle(title)
    }
  }, [title, page.id, page.title])

  return (
    <div className="pb-10 group/header relative">
      <Cover url={page.coverImage} pageId={page.id} preview={preview} />



      <div className="px-12 pt-12 md:max-w-3xl md:mx-auto lg:max-w-4xl">
        {/* Negative margin to pull icon up if cover exists */}
        <div className={page.coverImage ? "-mt-24" : ""}>
          <Toolbar page={page} preview={preview} />
        </div>

        <div className="mt-8">
          <TextareaAutosize
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] bg-transparent resize-none w-full placeholder:text-muted-foreground/50 mt-4"
            placeholder="Untitled"
            disabled={preview}
          />
        </div>
      </div>
    </div>
  )
}
