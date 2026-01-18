"use client"

import { Database, Property, DatabaseRow, Cell } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { useFilteredSortedData } from "@/hooks/use-filtered-sorted-data"
import { MonthGrid } from "./calendar-month-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths, format, subMonths } from "date-fns"

interface CalendarViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
}

export function CalendarView({ database }: CalendarViewProps) {
    const {
        calendarDateProperty,
        calendarDate,
        setCalendarDate,
        calendarView,
        setCalendarView
    } = useDatabase()

    const filteredRows = useFilteredSortedData(database)

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
                {/* View Switcher (Month/Week) - simplified for now */}
                {/* <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
             <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Month</Button>
             <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Week</Button>
         </div> */}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <MonthGrid
                    date={calendarDate}
                    rows={filteredRows}
                    datePropertyId={dateProperty.id}
                    properties={database.properties}
                />
            </div>
        </div>
    )
}
