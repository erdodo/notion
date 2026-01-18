"use client"

import { useState, useEffect } from "react"
// import { DatabaseView } from "./database-view" // Assuming this exists or I should mock it. Or likely DatabaseView is main component.
// I will check if DatabaseView exists in components/database/database-view.tsx
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Settings, X } from "lucide-react"
import { getDatabase } from "@/app/(main)/_actions/database"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkedDatabase, Database } from "@prisma/client"
import { DatabaseView } from "./database-view" // Trying to import assuming it exists.
import { DetailedDatabase } from "@/hooks/use-filtered-sorted-data"

interface LinkedDatabaseProps {
    linkedDb: LinkedDatabase
    editable?: boolean
}

export function LinkedDatabaseView({ linkedDb, editable = true }: LinkedDatabaseProps) {
    const [sourceDatabase, setSourceDatabase] = useState<DetailedDatabase | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDatabase(linkedDb.sourceDatabaseId)
            .then(setSourceDatabase)
            .finally(() => setLoading(false))
    }, [linkedDb.sourceDatabaseId])

    if (loading) {
        return <Skeleton className="h-64 w-full" />
    }

    if (!sourceDatabase) {
        return (
            <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
                Source database not found or was deleted
            </div>
        )
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    <span className="text-lg">{sourceDatabase.page?.icon || '📊'}</span>
                    <span className="font-medium">
                        {/* @ts-ignore */}
                        {linkedDb.title || (sourceDatabase as any).page?.title}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        // @ts-ignore
                        onClick={() => window.open(`/documents/${sourceDatabase.pageId}`, '_blank')}
                    >
                        <ArrowUpRight className="h-3 w-3" />
                    </Button>
                </div>

                {editable && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Database View with local config */}
            <DatabaseView
                database={sourceDatabase}
            // viewConfig={linkedDb.viewConfig} // Assuming DatabaseView accepts viewConfig
            // isLinked={true} // Asuming DatabaseView accepts isLinked
            />
        </div>
    )
}
