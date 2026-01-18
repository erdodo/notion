"use client"

import { DatabaseRow } from "@prisma/client"
import { format, isSameDay } from "date-fns"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "./calendar-event"

interface CalendarDayCellProps {
    date: Date
    events: (DatabaseRow & { title: string })[]
    isToday?: boolean
    onAddEvent?: (date: Date) => void
    onEventClick?: (rowId: string) => void
}

export function CalendarDayCell({ date, events, isToday, onAddEvent, onEventClick }: CalendarDayCellProps) {
    return (
        <div
            className={cn(
                "min-h-[120px] border-b border-r p-1 relative group hover:bg-muted/5",
                isToday && "bg-muted/30"
            )}
        >
            {/* Day Number */}
            <div className={cn(
                "text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ml-auto",
                isToday && "bg-primary text-primary-foreground font-bold"
            )}>
                {format(date, 'd')}
            </div>

            {/* Events */}
            <div className="space-y-1">
                {events.slice(0, 4).map(event => (
                    <CalendarEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event.id)}
                    />
                ))}
                {events.length > 4 && (
                    <button className="w-full text-left text-xs text-muted-foreground px-1 hover:text-foreground">
                        +{events.length - 4} more
                    </button>
                )}
            </div>

            {/* Quick Add on hover */}
            <button
                className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                onClick={() => onAddEvent?.(date)}
            >
                <Plus className="h-3 w-3 text-muted-foreground" />
            </button>
        </div>
    )
}
