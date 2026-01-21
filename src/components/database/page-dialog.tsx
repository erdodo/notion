"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { getDocument } from "@/app/(main)/_actions/documents"
import { getDatabase } from "@/app/(main)/_actions/database"
import { Skeleton } from "@/components/ui/skeleton"
import { DatabaseView } from "./database-view"
import { PageRenderer } from "@/components/editor/page-renderer"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface PageDialogProps {
    pageId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PageDialog({ pageId, open, onOpenChange }: PageDialogProps) {
    const [page, setPage] = useState<any>(null)
    const [database, setDatabase] = useState<any>(null)
    const [row, setRow] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!pageId || !open) {
            setLoading(false)
            return
        }

        setLoading(true)

        // Fetch page data
        getDocument(pageId)
            .then(async (pageData) => {
                if (!pageData) {
                    setPage(null)
                    setLoading(false)
                    return
                }

                setPage(pageData)

                // If it's a database page, fetch database data
                if (pageData.isDatabase) {
                    const dbData = await getDatabase(pageId)
                    setDatabase(dbData)
                }

                // If it's a database row, fetch row data
                if (pageData.databaseRow) {
                    setRow(pageData.databaseRow)
                }

                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching page:', error)
                setLoading(false)
            })
    }, [pageId, open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-0">
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>{page?.title || 'Page'}</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                {loading ? (
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : page ? (
                    <div className="p-8">
                        {page.isDatabase && database ? (
                            <DatabaseView database={database as any} page={page} />
                        ) : (
                            <PageRenderer
                                page={page}
                                row={row as any}
                            />
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Page not found
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
