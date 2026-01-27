"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useState, useEffect } from "react"
import { LinkedDatabaseView } from "@/components/database/linked-database"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { getLinkedDatabase } from "@/app/(main)/_actions/database"

export const InlineDatabaseBlock = createReactBlockSpec(
    {
        type: "inlineDatabase",
        content: "none",
        propSchema: {
            linkedDatabaseId: {
                default: "",
            },
        },
    },
    {
        render: ({ block, editor }) => {
            const [linkedDb, setLinkedDb] = useState<any>(null)
            const [loading, setLoading] = useState(true)
            const [error, setError] = useState<string | null>(null)

            useEffect(() => {
                if (!block.props.linkedDatabaseId) {
                    setLoading(false)
                    setError("No database ID")
                    return
                }

                getLinkedDatabase(block.props.linkedDatabaseId)
                    .then((data) => {
                        if (!data) {
                            setError("Database not found")
                        } else {
                            setLinkedDb(data)
                        }
                    })
                    .catch((err) => {
                        setError(err.message || "Failed to load database")
                    })
                    .finally(() => setLoading(false))
            }, [block.props.linkedDatabaseId])

            // Prevent editing of the database container
            return (
                <div contentEditable={false} className="my-4 w-full">
                    {loading && (
                        <div className="border rounded-lg p-4 space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="border border-destructive/50 rounded-lg p-4 flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {linkedDb && !loading && !error && (
                        <LinkedDatabaseView
                            linkedDb={linkedDb}
                            editable={true}
                            onDelete={async () => {
                                // Block'u sil
                                const blockPos = editor.getTextCursorPosition().block
                                editor.removeBlocks([block])

                                // LinkedDatabase kaydını sil
                                const { deleteLinkedDatabase } = await import(
                                    "@/app/(main)/_actions/database"
                                )
                                await deleteLinkedDatabase(linkedDb.id)
                            }}
                        />
                    )}
                </div>
            )
        },
    }
)
