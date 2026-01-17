"use client"

import { useState, useRef } from "react"
import { ImageIcon, Smile, X } from "lucide-react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { IconPicker } from "./icon-picker"
import { Publish } from "./publish"
import { toast } from "sonner"

interface ToolbarProps {
  page: any
  preview?: boolean
}

export const Toolbar = ({ page, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleIconSelect = async (icon: string) => {
    await updateDocument(page.id, { icon })
  }

  const handleIconRemove = async () => {
    await updateDocument(page.id, { icon: "" })
  }

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      await updateDocument(page.id, { coverImage: data.url })
      toast.success("Cover image uploaded")
    } catch (error) {
      console.error("Error uploading cover:", error)
      toast.error("Failed to upload cover image")
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
    <div className="pl-[54px] group relative">
      {!!page.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
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
        <p className="text-6xl pt-6">
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
        {!preview && (
          <Publish initialData={{ id: page.id, isPublished: page.isPublished }} />
        )}
      </div>
    </div>
  )
}
