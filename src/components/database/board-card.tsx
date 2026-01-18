"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DatabaseRow, Property, Cell } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { PropertyBadge } from "./shared/property-badge"

interface BoardCardProps {
    row: DatabaseRow & { cells: Cell[] }
    properties: Property[]
}

export function BoardCard({ row, properties }: BoardCardProps) {
    const { filteredRows, visibleProperties } = useDatabase()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.id,
        data: {
            type: "Card",
            row,
        },
    })

    // We need to resolve title from title cell
    // Typically title property name is 'Name' or type is TITLE
    // FilteredSortedData might already process this, but here we have row.cells.
    // We need to find the cell that corresponds to the TITLE property.
    const titleProperty = properties.find(p => p.type === 'TITLE')
    const titleCell = row.cells.find(c => c.propertyId === titleProperty?.id)
    const rawTitle = titleCell?.value
    const title = typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
        ? String((rawTitle as any).value)
        : String(rawTitle || "Untitled")

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    // Determine which properties to show
    // If visibleProperties is empty, we might show none or defaults.
    // Let's assume store defaults to empty means show nothing except title.
    // Actually, let's show all for now if empty? No, usually hidden.
    const propsToShow = properties.filter(p => p.type !== 'TITLE' && visibleProperties.includes(p.id))

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 h-24 bg-secondary/50 border-2 border-primary/50 border-dashed rounded-lg"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group"
        >
            <Card
                className={cn(
                    "cursor-grab active:cursor-grabbing hover:bg-secondary/10 transition-colors shadow-sm hover:shadow-md",
                    isDragging && "opacity-50 shadow-lg" // isDragging handled above typically for overlay, but standard items stay
                )}
            >
                <CardContent className="p-3 space-y-2">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-2">
                        {row.icon && <span className="text-lg leading-relaxed shadow-sm">{row.icon}</span>}
                        <p className="font-medium text-sm text-foreground/90 leading-relaxed break-words select-none">
                            {title}
                        </p>
                    </div>

                    {/* Properties */}
                    {propsToShow.length > 0 && (
                        <div className="space-y-1 pt-1">
                            {propsToShow.map(prop => {
                                const cell = row.cells.find(c => c.propertyId === prop.id)
                                return (
                                    <PropertyBadge
                                        key={prop.id}
                                        property={prop}
                                        value={cell?.value}
                                    />
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
