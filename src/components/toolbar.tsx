"use client"

import { useState, useRef } from "react"
import { ImageIcon, Smile, X } from "lucide-react"
import { useEdgeStore } from "@/lib/edgestore"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { IconPicker } from "./icon-picker"

interface ToolbarProps {
  page: any
  preview?: boolean
}

export const Toolbar = ({ page, preview }: ToolbarProps) => {
  const { edgestore } = useEdgeStore()
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
      const res = await edgestore.publicFiles.upload({
        file
      })

      await updateDocument(page.id, { coverImage: res.url })
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
      </div>
    </div>
  )
}
