import { useState, useEffect, useRef, useCallback } from "react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { Cover } from "@/components/cover"
import { Toolbar } from "@/components/toolbar"
import { useSocket } from "@/components/providers/socket-provider" // Import socket
import { useDebounce } from "@/hooks/use-debounce" // Assuming this hook exists, or I will implement simple debounce

import TextareaAutosize from "react-textarea-autosize"

interface DocumentHeaderProps {
  page: any
  preview?: boolean
}

export const DocumentHeader = ({ page, preview }: DocumentHeaderProps) => {
  // Local state for real-time updates
  const [title, setTitle] = useState(page.title)
  const [icon, setIcon] = useState(page.icon)
  const [coverImage, setCoverImage] = useState(page.coverImage)
  const [coverImagePosition, setCoverImagePosition] = useState(page.coverImagePosition)

  const { socket } = useSocket()

  // Use a ref to track if we are the one updating (to avoid loop/jitter on own edits)
  const isEditingRef = useRef(false)
  const previousTitleRef = useRef(page.title)

  // Socket Listener for Remote Updates
  useEffect(() => {
    if (!socket) return

    const onUpdate = (data: any) => {
      if (data.id === page.id) {
        if (data.title !== undefined && !isEditingRef.current) setTitle(data.title)
        if (data.icon !== undefined) setIcon(data.icon)
        if (data.coverImage !== undefined) setCoverImage(data.coverImage)
        if (data.coverImagePosition !== undefined) setCoverImagePosition(data.coverImagePosition)
      }
    }

    socket.on("doc:update", onUpdate)
    return () => {
      socket.off("doc:update", onUpdate)
    }
  }, [socket, page.id])


  // Debounced Save Logic
  // We don't have useDebounce hook guaranteed, so let's use a simple timeout ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const saveTitle = async (newTitle: string) => {
    if (newTitle === previousTitleRef.current) return
    previousTitleRef.current = newTitle

    // Optimistic sidebar/breadcrumb update
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, title: newTitle }
    }))

    await updateDocument(page.id, { title: newTitle })
  }

  const handleInput = (value: string) => {
    setTitle(value)
    isEditingRef.current = true

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      saveTitle(value)
      isEditingRef.current = false
    }, 500) // 500ms debounce
  }

  const handleTitleBlur = () => {
    // Force save immediately on blur
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      saveTitle(title)
      isEditingRef.current = false
    }
  }

  // Update state only when navigating to a different page (page.id changes)
  // Don't override local edits when page prop updates
  const pageIdRef = useRef(page.id)

  useEffect(() => {
    // Only reset state if we navigated to a different page
    if (pageIdRef.current !== page.id) {
      setTitle(page.title)
      setIcon(page.icon)
      setCoverImage(page.coverImage)
      setCoverImagePosition(page.coverImagePosition)
      previousTitleRef.current = page.title
      pageIdRef.current = page.id
    }
  }, [page.id, page.title, page.icon, page.coverImage, page.coverImagePosition])


  const pageData = { ...page, title, icon, coverImage, coverImagePosition }

  return (
    <div className="pb-10 group/header relative">
      <Cover url={coverImage} pageId={page.id} preview={preview} position={coverImagePosition} />

      <div className="px-12 pt-12 md:max-w-3xl md:mx-auto lg:max-w-4xl">
        <div className={coverImage ? "-mt-24" : ""}>
          <Toolbar page={pageData} preview={preview} />
        </div>

        <div className="mt-8">
          <textarea
            value={title}
            onChange={(e) => handleInput(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const editor = document.querySelector(".bn-editor") as HTMLElement
                if (editor) {
                  editor.focus()
                }
              }
            }}
            className="text-5xl font-bold outline-none text-[#3F3F3F] dark:text-[#CFCFCF] bg-transparent w-full placeholder:text-muted-foreground/50 mt-4 resize-none h-auto overflow-hidden block"
            placeholder="Untitled"
            disabled={preview}
            rows={1}
            style={{ height: 'auto' }}
            // Simple auto-resize logic or use library if installed
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
