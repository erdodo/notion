"use client"

import { usePreview } from "@/hooks/use-preview"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// We need to fetch document data.
import { getDocument } from "@/app/(main)/_actions/documents"
import { getDatabase } from "@/app/(main)/_actions/database"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DatabaseView } from "@/components/database/database-view"
import { PageRenderer } from "@/components/page/page-renderer"

export const DocumentPreviewProvider = () => {
    const { isOpen, onClose, documentId, mode } = usePreview()
    const router = useRouter()
    const [page, setPage] = useState<any>(null)
    const [database, setDatabase] = useState<any>(null)
    const [row, setRow] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && documentId) {
            setLoading(true)

            getDocument(documentId)
                .then(async (pageData) => {
                    if (!pageData) {
                        setPage(null)
                        setLoading(false)
                        return
                    }

                    setPage(pageData)

                    // If it's a database page, fetch database data
                    if (pageData.isDatabase) {
                        const dbData = await getDatabase(documentId)
                        setDatabase(dbData)
                    }

                    // If it's a database row, fetch row data WITH database info
                    if (pageData.databaseRow) {
                        const rowData = pageData.databaseRow
                        setRow(rowData)

                        // Fetch the database that this row belongs to
                        if (rowData.databaseId) {
                            const dbData = await getDatabase(rowData.databaseId)
                            // Attach database to row
                            setRow({ ...rowData, database: dbData })
                        }
                    }

                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Error fetching page:', error)
                    setLoading(false)
                })
        } else {
            setPage(null)
            setDatabase(null)
            setRow(null)
        }
    }, [isOpen, documentId])

    const handleOpenFullPage = () => {
        if (documentId) {
            onClose()
            router.push(`/documents/${documentId}`)
        }
    }

    const Content = () => {
        if (loading) {
            return (
                <div className="p-8 space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-64 w-full" />
                </div>
            )
        }

        if (!page) return <div className="p-8 text-center text-muted-foreground">Page not found</div>

        return (
            <div className="h-full overflow-auto">
                {page.isDatabase && database ? (
                    <DatabaseView database={database as any} page={page} />
                ) : (
                    <PageRenderer
                        page={page}
                        row={row as any}
                        isPreview={false}
                    />
                )}
            </div>
        )
    }

    if (mode === "center") {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>{page?.title || 'Page'}</DialogTitle>
                        </DialogHeader>
                    </VisuallyHidden>
                    {/* Buttons - styled like default close button */}
                    <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
                        <button
                            onClick={handleOpenFullPage}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                        >
                            <Maximize2 className="h-4 w-4" />
                            <span className="sr-only">Open in full page</span>
                        </button>
                        <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>
                    <Content />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="p-0 sm:max-w-xl md:max-w-2xl w-full border-l [&>button]:hidden">
                <VisuallyHidden>
                    <SheetHeader>
                        <SheetTitle>{page?.title || 'Page'}</SheetTitle>
                    </SheetHeader>
                </VisuallyHidden>
                {/* Buttons - styled like default close button */}
                <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
                    <button
                        onClick={handleOpenFullPage}
                        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    >
                        <Maximize2 className="h-4 w-4" />
                        <span className="sr-only">Open in full page</span>
                    </button>
                    <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                </div>
                <Content />
            </SheetContent>
        </Sheet>
    )
}
