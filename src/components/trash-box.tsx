"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Trash, Undo, FileText } from "lucide-react"
import { toast } from "sonner"
import { restoreDocument, removeDocument } from "@/app/(main)/_actions/documents"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/spinner"
import { ConfirmModal } from "@/components/modals/confirm-modal"

interface Document {
  id: string
  title: string
  icon?: string | null
  isArchived: boolean
}

interface TrashBoxProps {
  documents: Document[]
}

export const TrashBox = ({ documents: initialDocuments }: TrashBoxProps) => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)

  const filteredDocuments = documents.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase())
  })

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  const onRestore = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    documentId: string,
  ) => {
    event.stopPropagation()

    const promise = restoreDocument(documentId).then(() => {
      // Remove from local state
      setDocuments(documents.filter(doc => doc.id !== documentId))
      router.refresh()
    })

    toast.promise(promise, {
      loading: "Restoring page...",
      success: "Page restored!",
      error: "Failed to restore page."
    })
  }

  const onRemove = async (documentId: string) => {
    const promise = removeDocument(documentId).then(() => {
      // Remove from local state
      setDocuments(documents.filter(doc => doc.id !== documentId))
      router.push("/documents")
    })

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted permanently!",
      error: "Failed to delete page."
    })
  }

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found in Trash.
        </p>
        {filteredDocuments?.map((document) => (
          <div
            key={document.id}
            onClick={() => onClick(document.id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between cursor-pointer"
          >
            <div className="flex items-center gap-x-2 pl-2">
              {document.icon ? (
                <span className="text-lg">{document.icon}</span>
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="truncate">
                {document.title}
              </span>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => onRestore(e, document.id)}
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </button>
              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <button
                  type="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </button>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
