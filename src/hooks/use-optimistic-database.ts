
import { useState, useCallback, useEffect } from "react"
import { Database, Property, DatabaseRow, Cell, PropertyType } from "@prisma/client"
import { useRouter } from "next/navigation"

export type DetailedDatabase = Database & {
    properties: Property[]
    rows: (DatabaseRow & { cells: Cell[] })[]
}

export function useOptimisticDatabase(initialDatabase: DetailedDatabase) {
    const [database, setDatabase] = useState<DetailedDatabase>(initialDatabase)
    const router = useRouter()

    useEffect(() => {
        setDatabase(initialDatabase)
    }, [initialDatabase])

    const updateCell = useCallback((rowId: string, propertyId: string, value: any) => {
        setDatabase(prev => {
            const newRows = prev.rows.map(row => {
                if (row.id !== rowId) return row

                // Check if cell exists
                const cellIndex = row.cells.findIndex(c => c.propertyId === propertyId)
                let newCells = [...row.cells]

                if (cellIndex >= 0) {
                    newCells[cellIndex] = { ...newCells[cellIndex], value }
                } else {
                    // Optimistic new cell
                    newCells.push({
                        id: `temp-${Math.random()}`,
                        rowId,
                        propertyId,
                        value,
                        // We lack full Cell fields but enough for render
                    } as Cell)
                }

                return { ...row, cells: newCells }
            })
            return { ...prev, rows: newRows }
        })
    }, [])

    const addRow = useCallback((newRow: DatabaseRow & { cells: Cell[] }) => {
        setDatabase(prev => ({
            ...prev,
            rows: [...prev.rows, newRow]
        }))
    }, [])

    const addProperty = useCallback((property: Property) => {
        setDatabase(prev => ({
            ...prev,
            properties: [...prev.properties, property]
        }))
    }, [])

    const updateProperty = useCallback((propertyId: string, data: Partial<Property>) => {
        setDatabase(prev => ({
            ...prev,
            properties: prev.properties.map(p =>
                p.id === propertyId ? { ...p, ...data } : p
            )
        }))
    }, [])

    // Server action wrappers that also update local state
    // We can inject these into context or return them

    return {
        database,
        setDatabase,
        updateCell,
        addRow,
        addProperty,
        updateProperty
    }
}
