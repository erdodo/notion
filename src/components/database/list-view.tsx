
import { Database, Property, DatabaseRow, Cell, PropertyType } from "@prisma/client"
import { useOptimisticDatabase } from "@/hooks/use-optimistic-database"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { FileIcon } from "lucide-react"

interface ListViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
}

import { useFilteredSortedData } from "@/hooks/use-filtered-sorted-data"

export function ListView({ database: initialDatabase }: ListViewProps) {
    const { database, addRow: addOptimisticRow } = useOptimisticDatabase(initialDatabase as any)
    const router = useRouter()

    const filteredRows = useFilteredSortedData(database)

    const titleProperty = database.properties.find(p => p.type === 'TITLE')

    return (
        <div className="w-full flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto px-10 py-4">
                <div className="space-y-1">
                    {filteredRows.map(row => {
                        const titleCell = row.cells.find(c => c.propertyId === titleProperty?.id)
                        let title = "Untitled"
                        if (titleCell && titleCell.value) {
                            try {
                                const val = typeof titleCell.value === 'string' ? JSON.parse(titleCell.value) : titleCell.value
                                title = val.value || "Untitled"
                            } catch {
                                title = String(titleCell.value)
                            }
                        }

                        return (
                            <div
                                key={row.id}
                                className="group flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer border-b border-border/40 last:border-0"
                                onClick={() => router.push(`/documents/${row.pageId}`)}
                            >
                                <span className="p-1 rounded bg-secondary text-secondary-foreground">
                                    <FileIcon className="h-4 w-4" />
                                </span>
                                <span className="text-sm font-medium">{title}</span>
                                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>{format(new Date(row.updatedAt), "MMM d")}</span>
                                </div>
                            </div>
                        )
                    })}
                    {database.rows.length === 0 && (
                        <div className="text-sm text-muted-foreground p-4">No pages inside</div>
                    )}
                </div>
            </div>
        </div>
    )
}
