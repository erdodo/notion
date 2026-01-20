"use client"

import { usePreview } from "@/hooks/use-preview"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BlockNoteEditorComponent } from "@/components/editor/blocknote-editor" // Reusing editor

// We need to fetch document data.
import { getDocument } from "@/app/(main)/_actions/documents"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const DocumentPreviewProvider = () => {
    const { isOpen, onClose, documentId, mode } = usePreview()
    const [documentData, setDocumentData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && documentId) {
            setLoading(true)
            getDocument(documentId)
                .then(setDocumentData)
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setDocumentData(null)
        }
    }, [isOpen, documentId])

    const Content = () => {
        if (loading) { // Corrected: return expression logic
            return (
                <div className="p-4 space-y-4">
                    <Skeleton className="h-10 w-[60%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-full" />
                </div>
            )
        }

        if (!documentData) return <div className="p-4 text-muted-foreground">Document not found</div>

        return (
            <div className="h-full overflow-y-auto pb-10">
                {/* Read-only Editor */}
                <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
                    <div className="pb-40">
                        <div className="text-3xl font-bold px-[54px] pt-8 pb-4">
                            {documentData.icon} {documentData.title}
                        </div>
                        <BlockNoteEditorComponent
                            editable={false}
                            initialContent={documentData.content}
                            onChange={() => { }}
                            disableCollaboration={true}
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (mode === "modal") {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
                    <Content />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="p-0 sm:max-w-xl md:max-w-2xl w-full border-l">
                <Content />
            </SheetContent>
        </Sheet>
    )
}
