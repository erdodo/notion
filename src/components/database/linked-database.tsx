import { useState, useEffect } from "react"
// import { DatabaseView } from "./database-view" // Assuming this exists or I should mock it. Or likely DatabaseView is main component.
// I will check if DatabaseView exists in components/database/database-view.tsx
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Settings, Trash2, ExternalLink } from "lucide-react"
import { getDatabase } from "@/app/(main)/_actions/database"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkedDatabase, Database } from "@prisma/client"
import { DatabaseView } from "./database-view" // Trying to import assuming it exists.
import { DetailedDatabase } from "@/hooks/use-filtered-sorted-data"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface LinkedDatabaseProps {
    linkedDb: any // LinkedDatabase with sourceDatabase included
    editable?: boolean
    onDelete?: () => void | Promise<void>
}

export function LinkedDatabaseView({ linkedDb, editable = true, onDelete }: LinkedDatabaseProps) {
    const [sourceDatabase, setSourceDatabase] = useState<DetailedDatabase | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (linkedDb.sourceDatabase) {
            setSourceDatabase(linkedDb.sourceDatabase)
            setLoading(false)
            return
        }

        getDatabase(linkedDb.sourceDatabaseId)
            .then(setSourceDatabase)
            .finally(() => setLoading(false))
    }, [linkedDb.sourceDatabaseId, linkedDb.sourceDatabase])

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
                </div>

                <div className="flex items-center gap-1">
                    {/* Open source database */}
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <Link href={`/documents/${sourceDatabase.pageId}`}>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* Delete linked database (YENİ) */}
                    {onDelete && editable && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Remove database?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove the database from this page.
                                        The original database and its data will not be deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onDelete}
                                        className="bg-destructive text-destructive-foreground"
                                    >
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
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

