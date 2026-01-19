"use client"

import { useEffect, useRef, useState } from "react"
import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData, FilteredDataResult } from "@/hooks/use-filtered-sorted-data"
import { Timeline, TimelineOptions, DataItem, DataGroup } from "vis-timeline/standalone"
import { DataSet } from "vis-data"
import "vis-timeline/styles/vis-timeline-graph2d.css"
import moment from "moment"
import { updateCellByPosition } from "@/app/(main)/_actions/database"
import { TimelineDependencies } from "./timeline-dependencies"

interface TimelineViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    }
}

export function TimelineView({ database }: TimelineViewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<Timeline | null>(null)

    const {
        timelineDateProperty,
        timelineGroupByProperty,
        timelineScale,
        setSelectedRowId,
        setTimelineDateProperty,
        timelineDependencyProperty
    } = useDatabase()

    const { sortedRows: filteredRows } = useFilteredSortedData(database) as unknown as FilteredDataResult

    // 1. Resolve Date Property
    const dateProperty = database.properties.find(p =>
        timelineDateProperty ? p.id === timelineDateProperty : p.type === 'DATE'
    ) || database.properties.find(p => p.type === 'CREATED_TIME')

    // Effect to set default date property if not set
    useEffect(() => {
        if (!timelineDateProperty && dateProperty) {
            setTimelineDateProperty(dateProperty.id)
        }
    }, [dateProperty, timelineDateProperty, setTimelineDateProperty])


    // 2. Prepare Data for Vis Timeline
    const [items, setItems] = useState<DataSet<DataItem>>(new DataSet([]))
    const [groups, setGroups] = useState<DataSet<DataGroup>>(new DataSet([]))

    useEffect(() => {
        if (!dateProperty) return

        const newItems = new DataSet<DataItem>()
        const newGroups = new DataSet<DataGroup>()
        const groupIdSet = new Set<string>()

        // Handle Grouping
        const groupProperty = database.properties.find(p => p.id === timelineGroupByProperty)
        if (groupProperty) {
            if (groupProperty.type === 'SELECT' || groupProperty.type === 'MULTI_SELECT') {
                // @ts-ignore - casting options
                const options = groupProperty.options || []
                // @ts-ignore
                options.forEach((opt: any) => {
                    newGroups.add({ id: opt.id, content: opt.name })
                    groupIdSet.add(opt.id)
                })
                // Add an "No Group" group
                newGroups.add({ id: 'uncategorized', content: 'No ' + groupProperty.name })
                groupIdSet.add('uncategorized')
            }
        }

        filteredRows.forEach(row => {
            const dateCell = row.cells.find(c => c.propertyId === dateProperty.id)
            let start = new Date()
            let end: Date | undefined = undefined

            if (dateCell && dateCell.value) {
                try {
                    const parsed = typeof dateCell.value === 'string' ? JSON.parse(dateCell.value) : dateCell.value
                    if (parsed.start) start = new Date(parsed.start)
                    if (parsed.end) end = new Date(parsed.end)
                    if (!parsed.start && !parsed.end && typeof dateCell.value === 'string') {
                        start = new Date(dateCell.value)
                    }
                } catch (e) {
                    if (typeof dateCell.value === 'string') {
                        start = new Date(dateCell.value)
                    }
                }
            } else if (dateProperty.type === 'CREATED_TIME') {
                start = new Date(row.createdAt)
            } else if (dateProperty.type === 'UPDATED_TIME') {
                start = new Date(row.updatedAt)
            } else {
                return
            }

            // Grouping Logic
            let groupId: string | number = 'uncategorized' // Default group
            if (groupProperty) {
                const groupCell = row.cells.find(c => c.propertyId === groupProperty.id)
                if (groupCell && groupCell.value) {
                    try {
                        const val = typeof groupCell.value === 'string' ? JSON.parse(groupCell.value) : groupCell.value
                        if (groupProperty.type === 'SELECT') {
                            groupId = val?.id || val || 'uncategorized'
                        } else if (groupProperty.type === 'MULTI_SELECT' && Array.isArray(val) && val.length > 0) {
                            groupId = val[0].id || 'uncategorized' // Just take first for now
                        }
                    } catch (e) {
                        groupId = String(groupCell.value)
                    }
                }
            }

            if (timelineGroupByProperty && !newGroups.get(groupId)) {
                newGroups.add({ id: groupId, content: String(groupId) })
            }

            newItems.add({
                id: row.id,
                content: row.page?.title || "Untitled",
                start: start,
                end: end,
                group: timelineGroupByProperty ? groupId : undefined,
                type: end ? 'range' : 'point'
            })
        })

        setItems(newItems)
        setGroups(newGroups)

    }, [database, filteredRows, dateProperty, timelineGroupByProperty])


    // Dependencies Logic
    const [dependencies, setDependencies] = useState<{ source: string, target: string }[]>([])

    useEffect(() => {
        if (!timelineDependencyProperty) {
            setDependencies([])
            return
        }

        const newDeps: { source: string, target: string }[] = []

        filteredRows.forEach(row => {
            const depCell = row.cells.find(c => c.propertyId === timelineDependencyProperty)
            if (depCell && depCell.value) {
                let blockedByIds: string[] = []
                try {
                    const val = typeof depCell.value === 'string' ? JSON.parse(depCell.value) : depCell.value
                    if (val && Array.isArray(val.linkedRowIds)) {
                        blockedByIds = val.linkedRowIds
                    }
                } catch (e) {
                    console.error("Failed to parse dependency cell", e)
                }

                blockedByIds.forEach(blockerId => {
                    newDeps.push({ source: blockerId, target: row.id })
                })
            }
        })
        setDependencies(newDeps)
    }, [filteredRows, timelineDependencyProperty])


    // 3. Initialize Timeline
    useEffect(() => {
        if (!containerRef.current || !items) return

        const options: TimelineOptions = {
            height: '100%',
            orientation: 'top',
            zoomKey: 'ctrlKey',
            start: moment().startOf('month').toDate(),
            end: moment().endOf('month').toDate(),
            editable: {
                add: false,
                remove: false,
                updateGroup: true,
                updateTime: true,
                overrideItems: false
            },
            onMove: async (item: any, callback: any) => {
                // Dependency Constraint Logic
                let allowed = true
                let newStart = item.start
                let newEnd = item.end

                if (timelineDependencyProperty) {
                    const blockers = dependencies.filter(d => d.target === item.id)
                    for (const dep of blockers) {
                        const blockerItem = items.get(dep.source)
                        if (blockerItem && blockerItem.end) {
                            if (new Date(newStart) < new Date(blockerItem.end)) {
                                allowed = false
                            }
                        }
                    }

                    const blockedItems = dependencies.filter(d => d.source === item.id)
                    for (const dep of blockedItems) {
                        const targetItem = items.get(dep.target)
                        if (targetItem && targetItem.start) {
                            if (new Date(newEnd) > new Date(targetItem.start)) {
                                allowed = false
                            }
                        }
                    }
                }

                if (!allowed) {
                    callback(null)
                    // Optional: Insert Toast here
                    return
                }

                // update date in DB
                if (dateProperty && item.id) {
                    let newVal: any = item.start
                    if (item.end) {
                        newVal = {
                            start: item.start,
                            end: item.end
                        }
                    }
                    await updateCellByPosition(dateProperty.id, item.id, newVal)
                }
                callback(item)
            }
        }

        const timeline = new Timeline(containerRef.current, items, groups, options)

        timeline.on('select', (props) => {
            if (props.items && props.items.length > 0) {
                setSelectedRowId(props.items[0])
            }
        })

        timelineRef.current = timeline

        return () => {
            timeline.destroy()
            if (timelineRef.current === timeline) {
                timelineRef.current = null
            }
        }
    }, [items, groups, timelineScale, dateProperty, setSelectedRowId, dependencies, timelineDependencyProperty])


    // 4. Update Scale dynamically
    useEffect(() => {
        if (!timelineRef.current) return

        const start = moment()
        let end = moment()

        switch (timelineScale) {
            case 'day':
                end = start.clone().add(1, 'week')
                break;
            case 'week':
                start.startOf('month')
                end = start.clone().add(1, 'month')
                break;
            case 'month':
                start.startOf('year')
                end = start.clone().add(1, 'year')
                break;
            case 'year':
                start.subtract(1, 'year')
                end = start.clone().add(3, 'years')
                break;
        }

        timelineRef.current.setWindow(start.toDate(), end.toDate())

    }, [timelineScale])


    if (!dateProperty) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No date property found. Please add a Date property to use Timeline view.
            </div>
        )
    }

    return (
        <div className="relative h-full w-full">
            <div className="h-full w-full bg-background" ref={containerRef} />
            {timelineRef.current && (
                <TimelineDependencies
                    timeline={timelineRef.current}
                    items={items}
                    dependencies={dependencies}
                />
            )}
        </div>
    )
}
