"use client"

import { Property, PropertyType } from "@prisma/client"
import { format } from "date-fns"
import { Check, Link as LinkIcon, Calendar, Type, Hash, List, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Badge } from "@/components/ui/badge" 

interface PropertyValueProps {
    property: Property
    value: any
    compact?: boolean
}

export function PropertyValue({ property, value, compact }: PropertyValueProps) {
    if (value === null || value === undefined) {
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

        default:
            return <span className="truncate">{JSON.stringify(value)}</span>
    }
}
