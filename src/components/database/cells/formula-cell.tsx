"use client"

import { useEffect, useState } from "react"
import { computeFormulaValue } from "@/app/(main)/_actions/database"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface FormulaCellProps {
    propertyId: string
    rowId: string
    config: {
        expression: string
        resultType: 'string' | 'number' | 'boolean' | 'date'
    }
}

export function FormulaCell({ propertyId, rowId, config }: FormulaCellProps) {
    const [result, setResult] = useState<{ value: any, error: string | null }>({
        value: null,
        error: null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        computeFormulaValue(rowId, propertyId)
            .then(setResult)
            .finally(() => setLoading(false))
    }, [rowId, propertyId])

    if (loading) {
        return <Skeleton className="h-5 w-20" />
    }

    if (result.error) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">Error</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{result.error}</p>
                </TooltipContent>
            </Tooltip>
        )
    }

    // Format based on result type
    const formatValue = () => {
        if (result.value === null || result.value === undefined) return '-'

        switch (config.resultType) {
            case 'number':
                return typeof result.value === 'number'
                    ? result.value.toLocaleString()
                    : String(result.value)
            case 'boolean':
                return result.value ? '✓' : '✗'
            case 'date':
                return new Date(result.value).toLocaleDateString()
            default:
                return String(result.value)
        }
    }

    return (
        <div className="px-2 py-1 text-sm">
            {formatValue()}
        </div>
    )
}
