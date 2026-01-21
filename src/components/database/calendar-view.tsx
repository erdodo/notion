"use client"

import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData, FilteredDataResult } from "@/hooks/use-filtered-sorted-data"
import { MonthGrid } from "./calendar-month-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths, format, subMonths } from "date-fns"
import { addRow, updateCellByPosition } from "@/app/(main)/_actions/database"
import { useEffect } from "react"
import { useOptimisticDatabase } from "@/hooks/use-optimistic-database"
import { usePageNavigation } from "@/hooks/use-page-navigation"

interface CalendarViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    }
}

export function CalendarView({ database: initialDatabase }: CalendarViewProps) {
    const { database, updateCell, addRow: addOptimisticRow } = useOptimisticDatabase(initialDatabase as any)
    const { navigateToPage } = usePageNavigation()

    const {
        calendarDateProperty,
        calendarDate,
        setCalendarDate,
        calendarView,
        setCalendarView
    } = useDatabase()

    const { sortedRows: filteredRows } = useFilteredSortedData(database) as unknown as FilteredDataResult

    // Resolve Date Property
    // Default to first DATE property or Created Time
    const dateProperty = database.properties.find(p =>
        calendarDateProperty ? p.id === calendarDateProperty : p.type === 'DATE'
    ) || database.properties.find(p => p.type === 'CREATED_TIME')

    if (!dateProperty) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No date property found to render calendar.
            </div>
        )
    }

    const handlePrevMonth = () => setCalendarDate(subMonths(calendarDate, 1))
    const handleNextMonth = () => setCalendarDate(addMonths(calendarDate, 1))
    const handleToday = () => setCalendarDate(new Date())

    const handleAddRow = async (date: Date) => {
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

        // Optimistically add row with the date set!
        // We must fake the cell presence so it shows up in MonthGrid
        if (dateProperty) {
            newRow.cells.push({
                id: `temp-cell-${tempId}`,
                rowId: tempId,
                propertyId: dateProperty.id,
                value: date
            })
        }

        addOptimisticRow(newRow)

        const createdRow = await addRow(database.id)

        // Update date property on server
        if (dateProperty) {
            await updateCellByPosition(dateProperty.id, createdRow.id, date)
        }
    }

    const handleEventClick = (rowId: string) => {
        const row = database.rows.find(r => r.id === rowId)
        if (row?.pageId) {
            navigateToPage(row.pageId)
        }
    }

    useEffect(() => {
        const handleAddEvent = () => handleAddRow(calendarDate) // Use current calendar date or today
        window.addEventListener('database-add-row', handleAddEvent)
        return () => window.removeEventListener('database-add-row', handleAddEvent)
    }, [calendarDate])

    return (
        <div className="flex flex-col h-full bg-background rounded-md">
            {/* Calendar Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold w-40">
                        {format(calendarDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center rounded-md border shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-none" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-[1px] h-4 bg-border" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-none" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 px-2 ml-2" onClick={handleToday}>
                        Today
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <MonthGrid
                    date={calendarDate}
                    rows={filteredRows}
                    datePropertyId={dateProperty.id}
                    properties={database.properties}
                    onAddRow={handleAddRow}
                    onEventClick={handleEventClick}
                />
            </div>
        </div>
    )
}
