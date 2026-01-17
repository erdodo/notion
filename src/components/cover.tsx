"use client"

import { useState } from "react"
import Image from "next/image"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverProps {
  url?: string
  pageId?: string
  preview?: boolean
}

export const Cover = ({ url, pageId, preview }: CoverProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleRemove = async () => {
    if (!url || !pageId || preview) return

    setIsLoading(true)
    try {
      // Update database - remove cover image URL
      await updateDocument(pageId, { coverImage: "" })
    } catch (error) {
      console.error("Error removing cover:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!url) {
    return null
  }

  return (
    <div className={cn(
      "relative w-full h-[35vh] group",
      isLoading && "opacity-50"
    )}>
      <Image
        src={url}
        fill
        alt="Cover"
        className="object-cover"
      />
      {!preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <button
            onClick={handleRemove}
            className="text-muted-foreground text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75"
            disabled={isLoading}
          >
            <X className="h-4 w-4 inline mr-1" />
            Remove
          </button>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      )}
    </div>
  )
}
