"use client"

import { DatabaseRow, Cell, Property, Page } from "@prisma/client"
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameDay,
    isSameMonth
} from "date-fns"
import { CalendarDayCell } from "./calendar-day-cell"

interface MonthGridProps {
    date: Date
    rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    datePropertyId: string
    properties: Property[]
    onAddRow?: (date: Date) => void
    onEventClick?: (rowId: string) => void
}

export function MonthGrid({ date, rows, datePropertyId, properties, onAddRow, onEventClick }: MonthGridProps) {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    // Group events by date using dateProperty
    const eventsByDate: Record<string, any[]> = {}

    // Find title property
    const titleProp = properties.find(p => p.type === 'TITLE')

    rows.forEach(row => {
        const dateCell = row.cells.find(c => c.propertyId === datePropertyId)
        if (!dateCell?.value) return

        let rawValue = dateCell.value
        if (typeof rawValue === 'object' && rawValue !== null && 'value' in rawValue) {
            rawValue = (rawValue as any).value
        }
        if (!rawValue) return

        const dateStr = format(new Date(String(rawValue)), 'yyyy-MM-dd')
        if (!eventsByDate[dateStr]) eventsByDate[dateStr] = []

        // Resolve title
        const titleCell = row.cells.find(c => c.propertyId === titleProp?.id)
        const rawTitle = titleCell?.value
        const title = typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
            ? String((rawTitle as any).value)
            : String(rawTitle || "Untitled")

        eventsByDate[dateStr].push({ ...row, title })
    })

    return (
        <div className="border-t border-l rounded-t-none rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-r bg-muted/20">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    const dayDate = day
                    const dateKey = format(dayDate, 'yyyy-MM-dd')
                    const dayEvents = eventsByDate[dateKey] || []
                    const isCurrentMonth = isSameMonth(dayDate, monthStart)

                    return (
                        <div key={dateKey} className={!isCurrentMonth ? "bg-muted/10 opacity-60" : ""}>
                            <CalendarDayCell
                                date={dayDate}
                                events={dayEvents}
                                isToday={isSameDay(dayDate, new Date())}
                                onAddEvent={onAddRow}
                                onEventClick={onEventClick}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
