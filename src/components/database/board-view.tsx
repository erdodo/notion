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
            // Default to first STATUS or SELECT property (Prioritize STATUS)
            return database.properties.find(p => p.type === 'STATUS') ||
                database.properties.find(p => p.type === 'SELECT') || null
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

        const groupsMap: Record<string, typeof filteredRows> = {}

        // Handle STATUS Property Special Case (Fixed Groups)
        if (groupByProperty.type === 'STATUS') {
            const statusGroups = [
                { id: 'todo', title: 'To Do', color: 'gray' },
                { id: 'inprogress', title: 'In Progress', color: 'blue' },
                { id: 'complete', title: 'Complete', color: 'green' }
            ]

            // Initialize buckets
            statusGroups.forEach(g => groupsMap[g.id] = [])
            groupsMap['uncategorized'] = [] // for errors/missing

            const options = (groupByProperty.options as any[]) || []

            filteredRows.forEach(row => {
                const cell = row.cells.find(c => c.propertyId === groupByProperty.id)
                const val = cell?.value

                // Value is option ID. Find option to get its group.
                const optionId = typeof val === 'object' ? (val as any).value : val
                const option = options.find(o => o.id === optionId)

                if (option && option.group) {
                    // Check if valid group
                    if (groupsMap[option.group]) {
                        groupsMap[option.group].push(row)
                    } else {
                        groupsMap['uncategorized'].push(row)
                    }
                } else {
                    // Start state or invalid -> usually To Do (or uncategorized if strict)
                    // If no value, put in 'todo' per "Not Started" default usually, but let's put in 'todo' as fallback
                    // matching Notion's behavior where empty -> usually implies default status.
                    // But if option is missing but value exists? Uncategorized.
                    // If value is null? 'todo' (Not Started)
                    if (!val) {
                        groupsMap['todo'].push(row)
                    } else {
                        groupsMap['uncategorized'].push(row)
                    }
                }
            })

            return {
                groups: statusGroups, // Fixed columns
                groupedRows: groupsMap
            }
        }

        // ... Standard SELECT Logic (Existing) ...

        // Attempting to infer options from rows for dynamic grouping (existing fallback logic)
        // or usage of property options if available (recommended update)

        const propertyOptions = (groupByProperty.options as any[]) || []

        // Initialize from options if available
        const uniqueGroups = new Map<string, { id: string, title: string, color: string }>()

        if (propertyOptions.length > 0) {
            propertyOptions.forEach(opt => {
                uniqueGroups.set(opt.id, { id: opt.id, title: opt.name, color: opt.color })
                groupsMap[opt.id] = []
            })
        }

        // Catch-all
        groupsMap['uncategorized'] = []

        filteredRows.forEach(row => {
            const cell = row.cells.find(c => c.propertyId === groupByProperty.id)
            const value = cell?.value // Option ID

            let groupId = typeof value === 'object' ? (value as any).value : String(value)

            // If value is null -> uncategorized (No Status)
            if (!value) groupId = 'uncategorized'

            // If group doesn't exist (maybe ad-hoc option), create it? 
            // Or if we used property options, strict check?
            // Let's stick to existing "infer from data" if opt missing, or just use ID.

            // Fix: Existing logic inferred from value directly.
            // If propertyOptions existed, we match ID.

            if (groupId !== 'uncategorized' && !groupsMap[groupId]) {
                // Dynamic group from data?
                // Try to resolve name?
                const opt = propertyOptions.find(o => o.id === groupId)
                if (opt) {
                    uniqueGroups.set(groupId, { id: groupId, title: opt.name, color: opt.color })
                    groupsMap[groupId] = []
                } else {
                    // Fallback
                    if (!uniqueGroups.has(groupId)) {
                        uniqueGroups.set(groupId, { id: groupId, title: "Unknown", color: 'gray' })
                    }
                    if (!groupsMap[groupId]) groupsMap[groupId] = []
                }
            }

            if (groupsMap[groupId]) {
                groupsMap[groupId].push(row)
            } else {
                groupsMap['uncategorized'].push(row)
            }
        })

        const sortedGroups = Array.from(uniqueGroups.values())
        // If options existed, they are inserted in order? map iteration order is insertion order usually.
        // But we might want to sort by property option order if possible.
        // For now, simple.

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

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeRowId = active.id as string
        const overId = over.id as string

        // overId is either a Group ID (Column) or a Row ID (Card)
        // If it's a card, we need to find which group it belongs to?
        // Actually, BoardColumn is a droppable with id=groupId.
        // BoardCard is a sortable with id=rowId.

        let targetGroupId = overId

        // If dropped on a card, find that card's group
        // But we don't have easy access to card->group map here without searching.
        // However, dnd-kit `over.data` might have it if we set it.
        // Let's assume for now we only support dropping on Column (which is the main drop target for switching groups)
        // Or if dropped on card, dnd-kit returns the collision.
        // Note: Simple Board usually treats dropping on list as changing status. Reordering within list is Order.
        // If `overId` matches a group ID (from `groups`), it's a column drop.

        let isGroupDrop = groups.some(g => g.id === overId)

        if (!isGroupDrop) {
            // Must be a row drop. Find which group contains this row.
            const targetRow = filteredRows.find(r => r.id === overId)
            if (targetRow) {
                // Determine group of targetRow
                // Check Status logic:
                if (groupByProperty?.type === 'STATUS') {
                    const cell = targetRow.cells.find(c => c.propertyId === groupByProperty.id)
                    const val = cell?.value
                    const optionId = typeof val === 'object' ? (val as any).value : val
                    const options = (groupByProperty.options as any[]) || []
                    const option = options.find(o => o.id === optionId)
                    targetGroupId = option?.group || (val ? 'uncategorized' : 'todo')
                } else {
                    // Select logic
                    const cell = targetRow.cells.find(c => c.propertyId === groupByProperty?.id)
                    const val = cell?.value
                    // ... resolve group ...
                    // Simplification: just scan `groupedRows` to find which key contains overId
                    const foundGroup = Object.entries(groupedRows).find(([gid, rows]) => rows.some(r => r.id === overId))
                    if (foundGroup) targetGroupId = foundGroup[0]
                }
            }
        }

        if (targetGroupId && groupByProperty) {
            // Move Row to Group
            let newValue: any = targetGroupId

            if (groupByProperty.type === 'STATUS') {
                // Map group ID (todo, inprogress, complete) to an Option ID
                const options = (groupByProperty.options as any[]) || []
                const targetOptions = options.filter(o => o.group === targetGroupId)
                if (targetOptions.length > 0) {
                    // Pick first option? Or Default?
                    newValue = { value: targetOptions[0].id }
                } else {
                    // No option in this group? Can't move.
                    return
                }
            } else if (groupByProperty.type === 'SELECT') {
                // TargetGroupId is Option ID usually
                if (targetGroupId === 'uncategorized') newValue = { value: null } // Clear
                else newValue = { value: targetGroupId }
            }

            // Call Server
            await updateCellByPosition(groupByProperty.id, activeRowId, newValue)
        }
    }

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
            let value: any = null

            if (property?.type === 'STATUS') {
                const options = (property.options as any[]) || []
                // groupId is 'todo', 'inprogress', 'complete'
                const targetOption = options.find(o => o.group === groupId)
                if (targetOption) {
                    value = { value: targetOption.id }
                }
            } else if (property?.type === 'SELECT' || property?.type === 'MULTI_SELECT') {
                const options = (property.options as any[]) || []
                const option = options.find((o: any) => o.id === groupId || o.name === groupId)
                if (option) {
                    value = { value: option.id }
                }
            }

            if (value) {
                await updateCellByPosition(groupByPropId, createdRow.id, value)
            }
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
