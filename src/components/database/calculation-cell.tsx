
import { Property, PropertyType } from "@prisma/client"
import { useMemo } from "react"
// import { formatCurrency } from "@/lib/utils" 


interface CalculationCellProps {
    property: Property
    rows: any[] // Aggregated rows
}

type CalculationType = 'count_all' | 'count_values' | 'count_unique_values' | 'count_empty' | 'count_not_empty' | 'percent_empty' | 'percent_not_empty' | 'sum' | 'average' | 'median' | 'min' | 'max' | 'range'

export function CalculationCell({ property, rows }: CalculationCellProps) {
    // Hardcoded default calculation for now based on type
    // In real app, this should be stored in view config
    const type = property.type

    const value = useMemo(() => {
        const values = rows.map(r => {
            // Extract value from cell
            // Row structure: { original: { cells: [...] } }
            const cell = r.originalRow?.cells?.find((c: any) => c.propertyId === property.id)
            return cell?.value
        }).filter(v => v !== null && v !== undefined && v !== "")

        if (type === 'NUMBER') {
            // Default to Sum
            const sum = values.reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
            return `SUM ${sum}` // simplified formatting
        }

        if (type === 'TITLE') {
            return "Count check" // Screenshot shows "150" under title, likely count
        }

        return "Calculate"
    }, [rows, property, type])

    // Better implementation:
    const calculate = () => {
        const validValues = rows.map(r => {
            const cell = r.original.cells?.find((c: any) => c.propertyId === property.id)
            return cell?.value
        }).filter(v => v !== null && v !== undefined && v !== "")

        if (type === 'TITLE') {
            return rows.length
        }

        if (type === 'NUMBER') {
            const sum = validValues.reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
            // Simple currency match from screenshot
            // "TRY 92.52" -> implies currency formatting
            // If property has currency format settings we use it.
            // For now just general sum.
            return `SUM ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sum)}`
        }

        return ""
    }

    return (
        <div className="w-full h-full min-h-[33px] flex items-center justify-end px-2 text-xs text-muted-foreground border-t border-border/50 text-right">
            {calculate()}
        </div>
    )
}
