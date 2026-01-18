"use client"

import { DatabaseRow, Cell } from "@prisma/client"
import { cn } from "@/lib/utils"

interface CalendarEventProps {
    event: DatabaseRow & { title: string }
    // we might pass row directlry or just title/id
    onClick?: () => void
}

export function CalendarEvent({ event, onClick }: CalendarEventProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onClick?.()
            }}
            className={cn(
                "w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-colors",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "dark:bg-primary/20 dark:text-primary-foreground/90"
            )}
        >
            {event.title || "Untitled"}
        </button>
    )
}
