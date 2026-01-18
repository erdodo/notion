"use client"

import { Property, PropertyType } from "@prisma/client"
import { format } from "date-fns"
import { Check, Link as LinkIcon, Calendar, Type, Hash, List, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Badge } from "@/components/ui/badge" 
import { RelationCell } from "@/components/database/cells/relation-cell"
import { RollupCell } from "@/components/database/cells/rollup-cell"
import { FormulaCell } from "@/components/database/cells/formula-cell"
import { RelationConfig } from "@/lib/relation-service"
import { RollupConfig } from "@/lib/rollup-service"

interface PropertyValueProps {
    property: Property
    value: any
    compact?: boolean
    rowId?: string
}

export function PropertyValue({ property, value, compact, rowId }: PropertyValueProps) {
    // RowId is needed for advanced cells, but PropertyValue currently only gets property and value.
    // We need to refactor PropertyValue to accept rowId if we want to use the smart cells that fetch data.
    // However, existing usages might not pass rowId.
    // For now, let's assume value might contain what we need OR checking if we can get rowId context.
    // Actually, the new cells (RelationCell etc) take rowId and propertyId and fetch their own data or use value.
    // If PropertyValue is used in a context where we want "display only" from pre-fetched data (like in a list item), 
    // we might need to support passing just the value.
    // BUT the new cells are designed to be self-contained/interactive.
    // Let's check where PropertyValue is used. It is used in TableView, BoardView etc.
    // Just looking at the props `value`, it seems we might be missing rowId here.

    // TEMPORARY FIX: We will return simple representation if rowId is missing, 
    // but ideally we should update all call sites to pass rowId. 
    // But since I cannot easily update all call sites in one go without reading them, 
    // I will add optional rowId to props and use it if available.

    // Wait, let's look at the usage in `table-view.tsx`.

    // const rowId = (value as any)?.rowId // Check if value object has rowId attached? Unlikely. // This line is now redundant as rowId is passed as a prop.

    // I will look at adding rowId to props.

    if ((value === null || value === undefined) && ['TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'DATE', 'URL', 'EMAIL', 'PHONE'].includes(property.type)) {
        return <span className="text-muted-foreground/50 text-xs">Empty</span>
    }

    switch (property.type) {
        case 'TITLE':
        case 'TEXT':
            const textValue = typeof value === 'object' && value !== null ? ((value as any).value || (value as any).name || JSON.stringify(value)) : String(value || "")
            return <span className="truncate">{textValue}</span>

        case 'NUMBER':
            const numValue = typeof value === 'object' && value !== null ? (value as any).value : value
            return <span>{String(numValue)}</span>

        case 'SELECT':
            // Value is the option ID usually, but here we expect the resolved value or object
            const selectVal = typeof value === 'object' && value !== null ? ((value as any).name || (value as any).value || JSON.stringify(value)) : String(value)

            return (
                <span className={cn(
                    "px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs",
                    // Add color logic here if available
                )}>
                    {selectVal}
                </span>
            )

        case 'MULTI_SELECT':
            if (!Array.isArray(value)) return null
            return (
                <div className="flex gap-1 flex-wrap">
                    {value.map((v: any, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs">
                            {v?.name || v}
                        </span>
                    ))}
                </div>
            )

        case 'DATE':
            if (!value) return null
            const dateVal = typeof value === 'object' && value !== null && 'value' in value ? (value as any).value : value
            if (!dateVal) return null
            return (
                <span className="flex items-center gap-1.5">
                    {!compact && <Calendar className="h-3 w-3 text-muted-foreground" />}
                    {format(new Date(dateVal), "MMM d, yyyy")}
                </span>
            )

        case 'CHECKBOX':
            return value ? <Check className="h-4 w-4 text-primary" /> : null

        case 'URL':
            const urlVal = typeof value === 'object' && value !== null ? (value as any).value : value
            const urlStr = String(urlVal || "")
            return (
                <a href={urlStr} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                    {!compact && <LinkIcon className="h-3 w-3" />}
                    <span className="truncate max-w-[150px]">{urlStr}</span>
                </a>
            )

        case 'RELATION':
            if (!rowId) return <span className="text-xs text-muted-foreground">No context</span>
            return (
                <RelationCell
                    propertyId={property.id}
                    rowId={rowId}
                    value={value}
                    config={property.relationConfig as unknown as RelationConfig}
                    editable={!compact}
                />
            )

        case 'ROLLUP':
            if (!rowId) return <span className="text-xs text-muted-foreground">No context</span>
            return (
                <RollupCell
                    propertyId={property.id}
                    rowId={rowId}
                    config={property.rollupConfig as unknown as RollupConfig}
                />
            )

        case 'FORMULA':
            if (!rowId) return <span className="text-xs text-muted-foreground">No context</span>
            return (
                <FormulaCell
                    propertyId={property.id}
                    rowId={rowId}
                    config={property.formulaConfig as any}
                />
            )

        default:
            return <span className="truncate">{JSON.stringify(value)}</span>
    }
}
