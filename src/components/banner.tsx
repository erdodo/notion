"use client"

import { useRouter } from "next/navigation"
import { restoreDocument, removeDocument } from "@/app/(main)/_actions/documents"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/modals/confirm-modal"

interface BannerProps {
  documentId: string
}

export const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter()

  const onRemove = async () => {
    await removeDocument(documentId)
    router.push("/documents")
  }

  const onRestore = async () => {
    await restoreDocument(documentId)
  }

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>
        This page is in the Trash.
      </p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  )
}
