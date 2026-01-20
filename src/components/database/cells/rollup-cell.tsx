"use client"

import { useEffect, useState } from "react"
import { computeRollupValue } from "@/app/(main)/_actions/database"
import { formatRollupValue, AggregationType } from "@/lib/rollup-service"
import { Skeleton } from "@/components/ui/skeleton"

interface RollupCellProps {
    propertyId: string
    rowId: string
    config: {
        relationPropertyId: string
        targetPropertyId: string
        aggregation: AggregationType
        dateFormat?: string
    }
}

export function RollupCell({ propertyId, rowId, config }: RollupCellProps) {
    const [value, setValue] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        computeRollupValue(rowId, propertyId)
            .then(setValue)
            .finally(() => setLoading(false))
    }, [rowId, propertyId])

    if (loading) {
        return <Skeleton className="h-5 w-16" />
    }

    const formattedValue = formatRollupValue(value, config.aggregation, config.dateFormat)

    // Special handling for array display if we want badges
    // If show_original/show_unique, formatting might have joined them, or we want badges.
    // formatRollupValue returns string.
    // If we want badges, we need to handle array manually OR split.
    // But formatRollupValue handles date formatting too.

    // Updated Logic: Use the formatted string for text display.
    // If it's an array and we returned a comma separated list, maybe we just show that text?
    // Notion shows comma separated text for Rollups usually, unless mapped to tags.
    // The current implementation shows Badges for array values.
    // Let's preserve Badges but apply date format to each badge content.

    if (Array.isArray(value)) {
        return (
            <div className="flex flex-wrap gap-1 px-2">
                {value.slice(0, 5).map((v, i) => {
                    // Format individual item
                    // We can reuse formatRollupValue logic or a helper?
                    // Since formatRollupValue takes aggregation, passing 'show_original' with single value isn't quite right semantically but works if it just stringifies.
                    // But simpler: just replicate the Date logic here or make `formatRollupValue` handle single item helper export.
                    // Let's do inline date check if config.dateFormat exists.
                    let content = String(v)
                    if (config.dateFormat) {
                        const d = new Date(v)
                        if (!isNaN(d.getTime())) {
                            if (config.dateFormat === "relative") {
                                const diff = (new Date().getTime() - d.getTime()) / (1000 * 3600 * 24)
                                if (Math.abs(diff) < 1) content = "Today"
                                else if (Math.abs(diff) < 2) content = diff > 0 ? "Yesterday" : "Tomorrow"
                                else content = d.toLocaleDateString()
                            } else if (config.dateFormat === "US") content = d.toLocaleDateString("en-US")
                            else if (config.dateFormat === "ISO") content = d.toISOString().split('T')[0]
                            else content = d.toLocaleDateString()
                        }
                    }

                    return (
                        <span
                            key={i}
                            className="bg-muted px-1.5 py-0.5 rounded text-xs"
                        >
                            {content}
                        </span>
                    )
                })}
                {value.length > 5 && (
                    <span className="text-muted-foreground text-xs">
                        +{value.length - 5} more
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="px-2 py-1 text-sm text-muted-foreground">
            {formattedValue}
        </div>
    )
}
