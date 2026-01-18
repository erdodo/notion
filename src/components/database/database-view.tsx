
"use client"

import { Database, Property, DatabaseRow, Cell } from "@prisma/client"
import { TableView } from "./table-view"
import { BoardView } from "./board-view"
import { CalendarView } from "./calendar-view"
import { GalleryView } from "./gallery-view"
import { ListView } from "./list-view"
import { RowDetailModal } from "./row-detail-modal"
import { useDatabase } from "@/hooks/use-database"
import { DatabaseToolbar } from "./toolbar/database-toolbar"
import { useEffect } from "react"

interface DatabaseViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
    viewConfig?: any
    isLinked?: boolean
}

export function DatabaseView({ database }: DatabaseViewProps) {
    const { currentView, selectedRowId, setSelectedRowId } = useDatabase()

    // Find selected row for modal
    const selectedRow = selectedRowId ? database.rows.find(r => r.id === selectedRowId) : null

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
                </div>
            </div>

            {selectedRow && (
                <RowDetailModal
                    row={selectedRow}
                    properties={database.properties}
                    isOpen={!!selectedRow}
                    onClose={() => setSelectedRowId(null)}
                />
            )}
        </div>
    )
}
