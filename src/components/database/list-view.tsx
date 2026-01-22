"use client"

import { Database, Property, DatabaseRow, Cell, Page, type DatabaseView } from "@prisma/client"
import { useFilteredSortedData, FilteredDataResult } from "@/hooks/use-filtered-sorted-data"
import { ListItem } from "./list-item"
import { Plus } from "lucide-react"
import { useEffect } from "react"

import { useDatabase } from "@/hooks/use-database"
import { addRow } from "@/app/(main)/_actions/database"

interface ListViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
        views: DatabaseView[]
    }
}

export function ListView({ database }: ListViewProps) {
    const { setSelectedRowId } = useDatabase()
    const { sortedRows: filteredRows } = useFilteredSortedData(database) as unknown as FilteredDataResult

    const handleAddRow = async () => {
        const tempId = crypto.randomUUID()
        const newRow: any = {
            id: tempId,
            databaseId: database.id,
            pageId: null,
            order: database.rows.length,
            createdAt: new Date(),
            updatedAt: new Date(),
            cells: []
        }
        // addOptimisticRow(newRow)

        await addRow(database.id)
    }


    useEffect(() => {
        const handleAddEvent = () => handleAddRow()
        window.addEventListener('database-add-row', handleAddEvent)
        return () => window.removeEventListener('database-add-row', handleAddEvent)
    }, [])

    return (
        <div className="p-2 h-full overflow-y-auto">
            <div className="flex flex-col">
                {filteredRows.map(row => (
                    <ListItem
                        key={row.id}
                        row={row}
                        properties={database.properties}
                        onClick={() => setSelectedRowId(row.id)}
                    />
                ))}

                <button
                    className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/50 rounded-md mt-1 text-left"
                    onClick={handleAddRow}
                >
                    <Plus className="h-4 w-4" />
                    New
                </button>
            </div>
        </div>
    )
}
