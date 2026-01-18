"use client"

import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData } from "@/hooks/use-filtered-sorted-data"
import { GalleryCard } from "./gallery-card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { addRow } from "@/app/(main)/_actions/database"

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
        setSelectedRowId
    } = useDatabase()

    const filteredRows = useFilteredSortedData(database)

    const gridClasses = {
        small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    }

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

    return (
        <div className="p-4 h-full overflow-y-auto">
            <div className={cn("grid gap-4", gridClasses[galleryCardSize])}>
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
