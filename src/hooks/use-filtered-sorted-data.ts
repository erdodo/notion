
import { useDatabase } from "./use-database"
import { useMemo } from "react"
import { Database, Property, DatabaseRow, Cell, PropertyType } from "@prisma/client"

export type DetailedDatabase = Database & {
    properties: Property[]
    rows: (DatabaseRow & { cells: Cell[] })[]
}

export function useFilteredSortedData(database: DetailedDatabase) {
    const { filters, sorts, searchQuery } = useDatabase()

    const filteredAndSortedRows = useMemo(() => {
        let rows = [...database.rows]

        // 1. Search (Global)
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            rows = rows.filter(row => {
                // Check all cells
                return row.cells.some(cell => {
                    if (!cell.value) return false
                    const valStr = typeof cell.value === 'object'
                        ? JSON.stringify(cell.value).toLowerCase()
                        : String(cell.value).toLowerCase()
                    return valStr.includes(query)
                })
            })
        }

        // 2. Filters
        if (filters.length > 0) {
            rows = rows.filter(row => {
                return filters.every(filter => {
                    const cell = row.cells.find(c => c.propertyId === filter.propertyId)
                    const cellValue = cell ? cell.value : null

                    // Basic operators implementation
                    const filterVal = filter.value?.toString().toLowerCase() || ""
                    const val = cellValue?.toString().toLowerCase() || ""

                    switch (filter.operator) {
                        case 'is': return val === filterVal
                        case 'is_not': return val !== filterVal
                        case 'contains': return val.includes(filterVal)
                        case 'not_contains': return !val.includes(filterVal)
                        case 'is_empty': return !cellValue || val === ""
                        case 'is_not_empty': return !!cellValue && val !== ""
                        default: return true
                    }
                })
            })
        }

        // 3. Sorts
        if (sorts.length > 0) {
            rows.sort((a, b) => {
                for (const sort of sorts) {
                    const cellA = a.cells.find(c => c.propertyId === sort.propertyId)
                    const cellB = b.cells.find(c => c.propertyId === sort.propertyId)

                    const valA = cellA?.value ?? ""
                    const valB = cellB?.value ?? ""

                    if (valA === valB) continue

                    // Handle different types if needed (numbers, dates)
                    // For simplicity, using string comparison or simple greater/less
                    const comparison = valA > valB ? 1 : -1

                    if (sort.direction === 'desc') {
                        return comparison * -1
                    }
                    return comparison
                }
                return 0
            })
        }

        return rows
    }, [database.rows, filters, sorts, searchQuery])

    return filteredAndSortedRows
}
