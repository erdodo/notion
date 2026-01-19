"use client"

import { DatabaseRow, Cell, Property, Page } from "@prisma/client"
import { cn } from "@/lib/utils"
import { PropertyValue } from "./shared/property-value"
import { PropertyTypeIcon } from "./property-type-icon"
import { FileIcon } from "lucide-react"
import { useContextMenu } from "@/hooks/use-context-menu"

interface ListItemProps {
    row: DatabaseRow & { cells: Cell[]; page: Page | null }
    properties: Property[] // Full properties to render fields
    onClick?: () => void
}

export function ListItem({ row, properties, onClick }: ListItemProps) {
    const titleProp = properties.find(p => p.type === 'TITLE')
    const titleCell = row.cells.find(c => c.propertyId === titleProp?.id)
    const rawTitle = titleCell?.value
    const title = typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
        ? String((rawTitle as any).value)
        : String(rawTitle || "Untitled")

    const otherProps = properties.filter(p => p.type !== 'TITLE')

    const { onContextMenu, onTouchStart, onTouchEnd, onTouchMove } = useContextMenu({
        type: "database-row",
        data: { id: row.id, title } // sending title for potential use
    })

    return (
        <div
            className="group flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer border-b border-border/40 last:border-0"
            onClick={onClick}
            onContextMenu={onContextMenu}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
        >
            {/* Icon */}
            <div className="w-6 flex justify-center shrink-0">
                {row.page?.icon ? (
                    <span>{row.page.icon}</span>
                ) : (
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                )}
            </div>

            {/* Title */}
            <span className="text-sm font-medium flex-1 truncate text-foreground">
                {title}
            </span>

            {/* Properties (Compact) */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground overflow-hidden">
                {otherProps.slice(0, 3).map(prop => {
                    const cell = row.cells.find(c => c.propertyId === prop.id)
                    if (!cell?.value) return null

                    return (
                        <div key={prop.id} className="flex items-center gap-1.5 max-w-[150px]">
                            <PropertyTypeIcon type={prop.type} className="h-3 w-3 opacity-70 shrink-0" />
                            <div className="truncate">
                                <PropertyValue property={prop} value={cell.value} compact />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
