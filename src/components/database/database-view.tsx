
"use client"

import { Database, Property, DatabaseRow, Cell, Page } from "@prisma/client"
import { TableView } from "./table-view"
import { BoardView } from "./board-view"
import { CalendarView } from "./calendar-view"
import { GalleryView } from "./gallery-view"
import { ListView } from "./list-view"
import { TimelineView } from "./timeline-view"
import { RowDetailModal } from "./row-detail-modal"
import { useDatabase } from "@/hooks/use-database"
import { DatabaseToolbar } from "./toolbar/database-toolbar"
import { RowDetailDrawer } from "./row-detail-drawer"
import { useEffect } from "react"

interface DatabaseViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
    }
    viewConfig?: any
    isLinked?: boolean
}

export function DatabaseView({ database }: DatabaseViewProps) {
    if (!database) {
        return <div className="p-4 text-muted-foreground">Database not found</div>
    }


    const { currentView, selectedRowId, setSelectedRowId, openMode } = useDatabase()

    // Find selected row for modal (safely)
    const rows = database.rows || []
    const selectedRow = selectedRowId ? rows.find(r => r.id === selectedRowId) : null

    // Initialize view from database default if needed or just rely on default 'table'
    // Ideally we sync this with server state later

    return (
        <div className="flex flex-col h-full bg-background relative group">
            {/* Center container like pages */}
            <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-12 pb-24 pt-4 overflow-hidden flex flex-col">
                <DatabaseToolbar database={database} />
                <div className="flex-1 flex flex-col h-full overflow-hidden border-t border-border/40 mt-2">
                    {currentView === 'table' && <TableView database={database} />}
                    {currentView === 'board' && <BoardView database={database} />}
                    {currentView === 'calendar' && <CalendarView database={database} />}
                    {currentView === 'gallery' && <GalleryView database={database} />}
                    {currentView === 'list' && <ListView database={database} />}
                    {currentView === 'timeline' && <TimelineView database={database} />}
                </div>
            </div>

            {selectedRow && (
                openMode === 'side' ? (
                    <RowDetailDrawer
                        row={selectedRow}
                        database={database}
                        isOpen={!!selectedRow}
                        onClose={() => setSelectedRowId(null)}
                    />
                ) : (
                    <RowDetailModal
                        row={selectedRow}
                        database={database}
                        isOpen={!!selectedRow}
                        onClose={() => setSelectedRowId(null)}
                    />
                )
            )}
        </div>
    )
}
