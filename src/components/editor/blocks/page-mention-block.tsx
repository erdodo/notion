"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, ExternalLink } from "lucide-react"
import { getDocument } from "@/app/(main)/_actions/documents"

// Helper function since we can't import server action directly inside useEffect sometimes if it's not marked 'use server' properly or if build issues. 
// But getDocumentById IS a server action.
// Ideally we should use a client-side fetcher or the server action.
// The prompt used getDocumentById.

export const PageMentionBlock = createReactBlockSpec(
    {
        type: "pageMention",
        propSchema: {
            pageId: { default: "" },
        },
        content: "none",
    },
    {
        render: ({ block }) => {
            const [page, setPage] = useState<{ title: string; icon: string | null } | null>(null)
            const [loading, setLoading] = useState(true)

            useEffect(() => {
                if (block.props.pageId) {
                    getDocument(block.props.pageId)
                        .then(p => setPage(p ? { title: p.title, icon: p.icon || null } : null))
                        .catch(() => setPage(null))
                        .finally(() => setLoading(false))
                } else {
                    setLoading(false)
                }
            }, [block.props.pageId])

            if (loading) {
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-sm align-middle">
                        <div className="h-4 w-4 bg-muted-foreground/20 animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted-foreground/20 animate-pulse rounded" />
                    </span>
                )
            }

            if (!page) {
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-sm align-middle">
                        <FileText className="h-4 w-4" />
                        <span>Page not found</span>
                    </span>
                )
            }

            return (
                <Link
                    href={`/documents/${block.props.pageId}`}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-sm group align-middle mx-1"
                    contentEditable={false}
                >
                    <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                    <span className="underline-offset-2 group-hover:underline">
                        {page.title || 'Untitled'}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            )
        },
    }
)
