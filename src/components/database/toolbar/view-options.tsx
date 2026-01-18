"use client"

import { Database, Property } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import { BoardOptions } from "./board-options"
import { CalendarOptions } from "./calendar-options"
import { GalleryOptions } from "./gallery-options"

interface ViewOptionsProps {
    database: Database & { properties: Property[] }
}

export function ViewOptions({ database }: ViewOptionsProps) {
    const { currentView } = useDatabase()

    switch (currentView) {
        case 'board':
            return <BoardOptions database={database} />
        case 'calendar':
            return <CalendarOptions database={database} />
        case 'gallery':
            return <GalleryOptions database={database} />
        case 'list':
            // List view might reuse table options or have its own
            return null
        default:
            // Table options are handled separately or we add TableOptions here
            return null
    }
}
