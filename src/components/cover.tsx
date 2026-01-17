"use client"

import { useState } from "react"
import Image from "next/image"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEdgeStore } from "@/lib/edgestore"

interface CoverProps {
  url?: string
  pageId?: string
  preview?: boolean
}
export const Cover = ({ url, pageId, preview }: CoverProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { edgestore } = useEdgeStore()
  const [file, setFile] = useState<File>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  const onClose = () => {
    setFile(undefined)
    setIsSubmitting(false)
    setProgress(0)
  }

  const onChange = async (file?: File) => {
    if (file) {
      setIsSubmitting(true)
      setFile(file)

      try {
        const res = await edgestore.coverImages.upload({
          file,
          options: {
            replaceTargetUrl: url,
          },
          onProgressChange: (progress) => {
            setProgress(progress)
          },
        })

        await updateDocument(pageId!, {
          coverImage: res.url
        })

        onClose()
      } catch (error) {
        console.error("Error uploading cover:", error)
        onClose()
      }
    }
  }

  const onRemove = async () => {
    if (url) {
      await edgestore.coverImages.delete({
        url: url
      })
    }
    await updateDocument(pageId!, {
      coverImage: ""
    })
  }

  if (!url) {
    return null
  }

  return (
    <div className={cn(
      "relative w-full h-[35vh] group",
      !url && "h-[12vh]",
      url && "bg-muted"
    )}>
      {!!url && (
        <Image
          src={url}
          fill
          alt="Cover"
          className="object-cover"
        />
      )}

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            <label className="text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 cursor-pointer text-muted-foreground flex items-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
                onChange={(e) => onChange(e.target.files?.[0])}
              />
              <ImageIcon className="h-4 w-4 mr-1" />
              Change cover
            </label>

            <button
              onClick={onRemove}
              className="text-muted-foreground text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 flex items-center"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-xs mt-2">Uploading... {progress}%</p>
        </div>
      )}
    </div>
  )

}