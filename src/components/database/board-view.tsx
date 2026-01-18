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
import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData, FilteredDataResult } from "@/hooks/use-filtered-sorted-data"
import { addRow, updateCellByPosition, updateProperty } from "@/app/(main)/_actions/database"
import { BoardColumn } from "./board-column"
import { BoardCard } from "./board-card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface BoardViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    }
}

export function BoardView({ database }: BoardViewProps) {
    const { boardGroupByProperty } = useDatabase()
    // Cast result to FilteredDataResult and use sortedRows
    const { sortedRows: filteredRows } = useFilteredSortedData(database) as unknown as FilteredDataResult

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

    const handleAddRow = async (groupId: string) => {
        // Prepare initial cell values if necessary
        // For a board view, we want to set the grouping property to the column's group
        const groupByPropId = boardGroupByProperty

        const tempId = crypto.randomUUID()
        const newRow: any = {
            id: tempId,
            databaseId: database.id,
            pageId: null,
            order: database.rows.length,
            createdAt: new Date(),
            updatedAt: new Date(),
            cells: []
        }

        // Optimistically add row (Note: cells are empty initially)
        // Optimistically add row (Note: cells are empty initially)
        // addOptimisticRow(newRow) - TODO: Implement optimistic update hook

        // Server Call
        const createdRow = await addRow(database.id)

        // If we have a group ID and it's not uncategorized, set the property
        if (groupByPropId && groupId !== 'uncategorized') {
            // Find the option
            const property = database.properties.find(p => p.id === groupByPropId)
            // Construct value based on property type (assuming SELECT)
            let value: any = groupId // Default to string ID/Name

            if (property?.type === 'SELECT' || property?.type === 'MULTI_SELECT') {
                const options = (property.options as any[]) || []
                const option = options.find((o: any) => o.id === groupId || o.name === groupId)
                if (option) {
                    value = { id: option.id, name: option.name, color: option.color }
                }
            }

            // Optimistic update cell (complex without current row in state, but row just added)
            // We can just trigger server update. The UI might lag slightly or we use updateCell if we had row index.
            // updateCell(tempId, groupByPropId, value) -> won't work easily as tempId might mismatch or race.
            // Rely on server update for the cell value
            await updateCellByPosition(groupByPropId, createdRow.id, value)
        }
    }

    const handleAddGroup = async () => {
        const groupByPropId = boardGroupByProperty
        if (!groupByPropId) return

        const property = database.properties.find(p => p.id === groupByPropId)
        if (!property || (property.type !== 'SELECT' && property.type !== 'MULTI_SELECT')) return

        const name = prompt("New Group Name:")
        if (!name) return

        const newOption = {
            id: crypto.randomUUID(),
            name,
            color: 'default'
        }

        const currentOptions = (property.options as any[]) || []
        const newOptions = [...currentOptions, newOption]

        // Server update
        await updateProperty(property.id, { options: newOptions })
    }



    useEffect(() => {
        const handleAddEvent = () => {
            // Default to first group or uncategorized
            const firstGroup = groups[0]?.id || 'uncategorized'
            handleAddRow(firstGroup)
        }
        window.addEventListener('database-add-row', handleAddEvent)
        return () => window.removeEventListener('database-add-row', handleAddEvent)
    }, [groups])

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
                        onAddRow={() => handleAddRow(group.id)}
                    />
                ))}

                <div
                    className="shrink-0 w-72 h-10 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer"
                    onClick={handleAddGroup}
                >
                    <span className="flex items-center text-sm font-medium">Add Group</span>
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeRow && (
                        <div className="w-72">
                            <BoardCard row={activeRow} properties={database.properties} />
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
