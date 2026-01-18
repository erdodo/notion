"use client"

import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { Database, Property, DatabaseRow, Cell } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData } from "@/hooks/use-filtered-sorted-data"
import { BoardColumn } from "./board-column"
import { BoardCard } from "./board-card"
import { Button } from "@/components/ui/button"

interface BoardViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
}

export function BoardView({ database }: BoardViewProps) {
    const { boardGroupByProperty } = useDatabase()
    const filteredRows = useFilteredSortedData(database)

    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        })
    )

    // 1. Resolve Grouping Property
    const groupByProperty = useMemo(() => {
        if (!boardGroupByProperty) {
            // Default to first SELECT or STATUS property
            return database.properties.find(p => p.type === 'SELECT') || null
        }
        return database.properties.find(p => p.id === boardGroupByProperty) || null
    }, [database.properties, boardGroupByProperty])

    // 2. Generate Groups and Group Rows
    const { groups, groupedRows } = useMemo(() => {
        if (!groupByProperty) {
            return {
                groups: [{ id: 'uncategorized', title: 'No Status', color: 'gray' }],
                groupedRows: { uncategorized: filteredRows }
            }
        }

        // Get options from property config (assuming options are stored in property somehow? 
        // Usually prisma stores JSON or we have options table. 
        // Given the prompt examples, options might be in SelectOption[] structure inside property if it was fully expanded, 
        // but in basic prisma schema usually it's relation or Json. 
        // Let's assume for now we extract unique values from rows OR we have fixed options if it were a proper select.
        // For this implementation, let's extract unique values found in rows + 'No Status'

        // Attempting to infer options from rows for dynamic grouping
        // In a real app we should read property.options (if JSON).
        // Let's assume grouping by simple string values for now.

        const uniqueGroups = new Map<string, { id: string, title: string, color: string }>()

        // Initialize with standard groups if we could read them.
        // Since we don't have property options schema visibility here, we'll build from data.

        const groupsMap: Record<string, typeof filteredRows> = {}

        // Initialize catch-all
        groupsMap['uncategorized'] = []

        filteredRows.forEach(row => {
            const cell = row.cells.find(c => c.propertyId === groupByProperty.id)
            const value = cell?.value

            if (!value) {
                groupsMap['uncategorized'].push(row)
            } else {
                // Value is expected to be a string (Option ID or Option Name)
                // Ideally it is an Option ID. 
                // If value is object (JSON), we handle it.
                let groupId = typeof value === 'object' ? (value as any).id || (value as any).name : String(value)
                let groupTitle = typeof value === 'object' ? (value as any).name : String(value)

                // Fallback for empty/null if somehow passed check
                if (!groupId) groupId = 'uncategorized'

                // Ensure unique ID for the map
                if (!groupsMap[groupId]) {
                    groupsMap[groupId] = []
                    uniqueGroups.set(groupId, { id: groupId, title: groupTitle || "Untitled", color: 'default' })
                }
                groupsMap[groupId].push(row)
            }
        })

        const sortedGroups = Array.from(uniqueGroups.values()).sort((a, b) => a.title.localeCompare(b.title))

        // Determine final groups list: [No Status, ...Defined Groups]
        // Or if we have explicit options in the property definition, we should use those orders.

        return {
            groups: [...sortedGroups, { id: 'uncategorized', title: 'No Status', color: 'gray' }],
            groupedRows: groupsMap
        }
    }, [filteredRows, groupByProperty])

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const onDragOver = (event: DragOverEvent) => {
        // Visual updates usually handled by sortable strategy
    }

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeRowId = active.id as string
        const overId = over.id as string

        // Check if dropped on a container (Column) or a Card
        // 'over.data.current.type' could be 'Column' or 'Card'

        // Server action needed to update grouping value
        // group ID is overId if column, or over's parent group if card.

        // TODO: Calls to move row to group
        console.log("Moved", activeRowId, "to", overId)
    }

    if (!groupByProperty) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Please select a property to group by.
            </div>
        )
    }

    const activeRow = activeId ? filteredRows.find(r => r.id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full overflow-x-auto p-4 gap-4 items-start">
                {groups.map(group => (
                    <BoardColumn
                        key={group.id}
                        group={group}
                        rows={groupedRows[group.id] || []}
                        properties={database.properties}
                    />
                ))}

                <div className="shrink-0 w-72 h-10 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer">
                    <span className="flex items-center text-sm font-medium">Add Group</span>
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeRow && (
                        <div className="w-72"> {/* Constrain width to column width */}
                            <BoardCard row={activeRow} properties={database.properties} />
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
