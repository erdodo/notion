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

    const displayValue = formatRollupValue(value, config.aggregation)

    // Array değerler için badge gösterimi
    if (Array.isArray(value)) {
        return (
            <div className="flex flex-wrap gap-1 px-2">
                {value.slice(0, 5).map((v, i) => (
                    <span
                        key={i}
                        className="bg-muted px-1.5 py-0.5 rounded text-xs"
                    >
                        {String(v)}
                    </span>
                ))}
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
            {displayValue}
        </div>
    )
}
