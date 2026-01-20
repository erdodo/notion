"use client"

import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData, FilteredDataResult } from "@/hooks/use-filtered-sorted-data"
import { GalleryCard } from "./gallery-card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { addRow } from "@/app/(main)/_actions/database"
import { useEffect } from "react"

interface GalleryViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    }
}

export function GalleryView({ database }: GalleryViewProps) {
    const {
        galleryCardSize,
        galleryCoverProperty,
        galleryFitImage,
        setSelectedRowId,
        galleryColumns
    } = useDatabase()

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
        <div className="p-4 h-full overflow-y-auto">
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: `repeat(${galleryColumns || 4}, minmax(0, 1fr))`
                }}
            >
                {filteredRows.map(row => (
                    <GalleryCard
                        key={row.id}
                        row={row}
                        properties={database.properties}
                        coverPropertyId={galleryCoverProperty}
                        fitImage={galleryFitImage}
                        size={galleryCardSize}
                        onClick={() => setSelectedRowId(row.id)}
                    />
                ))}

                {/* New Card Button */}
                <div
                    role="button"
                    className={cn(
                        "border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors",
                        galleryCardSize === 'small' ? 'h-[200px]' : galleryCardSize === 'medium' ? 'h-[260px]' : 'h-[320px]'
                    )}
                    onClick={handleAddRow}
                >
                    <Plus className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">New</span>
                </div>
            </div>
        </div>
    )
}
