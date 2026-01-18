"use client"

import { useState } from "react"
import Image from "next/image"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEdgeStore } from "@/lib/edgestore"
import { CoverImageModal } from "@/components/modals/cover-image-modal"

interface CoverProps {
  url?: string
  pageId?: string
  preview?: boolean
}
export const Cover = ({ url, pageId, preview }: CoverProps) => {
  const { edgestore } = useEdgeStore()
  const [coverModalOpen, setCoverModalOpen] = useState(false)

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
    <>
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
              <button
                onClick={() => setCoverModalOpen(true)}
                className="text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 cursor-pointer text-muted-foreground flex items-center"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Change cover
              </button>

              <button
                onClick={onRemove}
                className="text-muted-foreground text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <CoverImageModal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
      />
    </>
  )
}