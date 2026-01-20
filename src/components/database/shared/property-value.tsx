"use client"

import { Property, PropertyType } from "@prisma/client"
import { format } from "date-fns"
import { Check, Link as LinkIcon, Calendar, Type, Hash, List, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { RelationCell } from "@/components/database/cells/relation-cell"
import { RollupCell } from "@/components/database/cells/rollup-cell"
import { FormulaCell } from "@/components/database/cells/formula-cell"
import { RelationConfig } from "@/lib/relation-service"
import { RollupConfig } from "@/lib/rollup-service"
import { getOptionColors } from "@/lib/notion-colors"

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
            const selectId = typeof value === 'object' && value !== null ? ((value as any).value || value) : value
            if (!selectId) return null

            const selectOption = (property.options as any[])?.find((o: any) => o.id === selectId)

            if (selectOption) {
                const colors = getOptionColors(selectOption.color)
                return (
                    <Badge variant="secondary" className={cn("font-normal px-2 py-0.5", colors.bg, colors.text)}>
                        {selectOption.name}
                    </Badge>
                )
            }
            return <span>{String(selectId)}</span>

        case 'MULTI_SELECT':
            if (!Array.isArray(value)) return null
            const multiOptions = (property.options as any[]) || []
            return (
                <div className="flex gap-1 flex-wrap">
                    {value.map((v: any, i: number) => {
                        // v might be ID or object
                        const id = typeof v === 'object' ? v.id || v.value : v
                        const option = multiOptions.find((o: any) => o.id === id)
                        const colors = option ? getOptionColors(option.color) : { bg: '', text: '' }

                        return (
                            <Badge key={i} variant="secondary" className={cn("font-normal px-2 py-0.5", colors.bg, colors.text)}>
                                {option?.name || String(id)}
                            </Badge>
                        )
                    })}
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
            // Checkbox value can be boolean or 'Yes'/'No' string or object
            const checked = value === true || value === 'true' || (typeof value === 'object' && value?.value === true)
            return checked ? <Check className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 border rounded-sm border-muted" />

        case 'URL':
            const urlVal = typeof value === 'object' && value !== null ? (value as any).value : value
            const urlStr = String(urlVal || "")
            if (!urlStr) return null
            return (
                <a href={urlStr} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                    {!compact && <LinkIcon className="h-3 w-3" />}
                    <span className="truncate max-w-[150px]">{urlStr}</span>
                </a>
            )

        case 'EMAIL':
        case 'PHONE':
            const txtVal = typeof value === 'object' && value !== null ? ((value as any).value || "") : String(value || "")
            return <span className="truncate">{txtVal}</span>

        case 'STATUS':
            const statusId = typeof value === 'object' && value !== null ? ((value as any).value || value) : value
            if (!statusId) return null

            const statusOptions = (property.options as any[]) || []
            const statusOption = statusOptions.find((o: any) => o.id === statusId)

            if (statusOption) {
                const colors = getOptionColors(statusOption.color)
                return (
                    <Badge variant="secondary" className={cn("font-normal px-2 py-0.5", colors.bg, colors.text)}>
                        {statusOption.name}
                    </Badge>
                )
            }
            return <span>{String(statusId)}</span>

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
