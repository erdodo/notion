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
        setTimelineDateProperty
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
            // For Select/MultiSelect, we can pre-populate groups from options
            // but for now, let's just create groups dynamically based on row values or distinct options
            // If it's a select property, let's use its options as groups
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
                // Assuming value might be ISO string or JSON with start/end
                // Adjust based on your cell value structure for DATE type
                // If simple string:
                // start = new Date(dateCell.value as string)

                // If complex object (common in Notion for Date ranges):
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
                // Skip if no date and not system date? Or show at today?
                // Let's skip rendering on timeline if no date
                return
            }

            // Grouping Logic
            let groupId: string | number = 'uncategorized' // Default group
            if (groupProperty) {
                const groupCell = row.cells.find(c => c.propertyId === groupProperty.id)
                if (groupCell && groupCell.value) {
                    // Determine group ID based on cell value (e.g. select option ID)
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

            // Ensure group exists if we didn't pre-populate (e.g. text grouping)
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
                add: false,         // handled via specific button usually
                remove: false,      // handled via modal
                updateGroup: true,  // drag between groups
                updateTime: true,   // drag to change time
                overrideItems: false
            },
            onMove: async (item: any, callback: any) => {
                // update date in DB
                if (dateProperty && item.id) {
                    // Construct new value
                    // If range: { start: ..., end: ... }
                    // If point: start...

                    let newVal: any = item.start
                    if (item.end) {
                        newVal = {
                            start: item.start,
                            end: item.end
                        }
                    }

                    // Optimistic update handled by vis-timeline local state, need to sync server
                    await updateCellByPosition(dateProperty.id, item.id, newVal)

                    // If group changed
                    // Note: 'onMove' in vis-timeline usually handles time dragging. 
                    // 'onMoving' or grouping changes might be different events depending on version.
                    // But if Group change is supported, item.group will be updated.
                    // We need to check if group property needs update.
                }

                // IMPORTANT: Must call callback(item) to apply change in UI or callback(null) to revert
                callback(item)
            }
        }



        const timeline = new Timeline(containerRef.current, items, groups, options)

        timeline.on('select', (props) => {
            if (props.items && props.items.length > 0) {
                // Open modal
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
    }, [items, groups, timelineScale, dateProperty, setSelectedRowId]) // Re-init if data sets change deeply? efficiently managed by vis usually but here simplistic re-create

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
        <div className="h-full w-full bg-background" ref={containerRef} />
    )
}
