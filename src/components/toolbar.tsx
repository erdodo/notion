"use client"

import { useState, useRef } from "react"
import { ImageIcon, Smile, X } from "lucide-react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { IconPicker } from "./icon-picker"
import { useContextMenu } from "@/hooks/use-context-menu"

interface Page {
  id: string
  title: string
  icon?: string | null
  coverImage?: string | null
  isPublished: boolean
}

interface ToolbarProps {
  page: Page
  preview?: boolean
}

export const Toolbar = ({ page, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { onContextMenu } = useContextMenu({
    type: "icon",
    data: { id: page.id, icon: page.icon }
  })

  const handleIconSelect = async (icon: string) => {
    // Optimistic update
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, icon }
    }))
    await updateDocument(page.id, { icon })
  }

  const handleIconRemove = async () => {
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, icon: null }
    }))
    await updateDocument(page.id, { icon: "" })
  }

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // For now, use a placeholder image URL
      // You can integrate with a file upload service later
      const placeholderUrl = `https://placehold.co/1200x400/`
      await updateDocument(page.id, { coverImage: placeholderUrl })
    } catch (error) {
      console.error("Error uploading cover:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCoverUpload(file)
    }
  }

  return (
    <div className="group relative">
      {!!page.icon && !preview && (
        <div
          onContextMenu={onContextMenu}
          className={`flex items-center gap-x-2 group/icon pt-6 ${page.coverImage ? "absolute -top-[1rem] left-0 z-10" : ""}`}
        >
          <IconPicker onChange={handleIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {page.icon}
            </p>
          </IconPicker>
          <button
            onClick={handleIconRemove}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {!!page.icon && preview && (
        <p className={`text-6xl pt-6 ${page.coverImage ? "absolute -top-[2.5rem] left-0 z-10" : ""}`}>
          {page.icon}
        </p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!page.icon && !preview && (
          <IconPicker asChild onChange={handleIconSelect}>
            <button className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md">
              <Smile className="h-4 w-4 mr-2 inline" />
              Add icon
            </button>
          </IconPicker>
        )}
        {!page.coverImage && !preview && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md"
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4 mr-2 inline" />
              {isUploading ? "Uploading..." : "Add cover"}
            </button>
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  )
}
