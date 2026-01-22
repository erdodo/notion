
"use client"

import { Database, Property, DatabaseRow, Cell, Page, ViewType, DatabaseView as DatabaseViewModelType } from "@prisma/client"
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
import { DocumentHeader } from "@/components/editor/document-header"

interface DatabaseViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
        views: DatabaseViewModelType[]
    }
    page?: Page
    viewConfig?: any
    isLinked?: boolean
}

import { useViewPersistence } from "@/hooks/use-view-persistence"

export function DatabaseView({ database, page }: DatabaseViewProps) {
    if (!database) {
        return <div className="p-4 text-muted-foreground">Database not found</div>
    }

    useViewPersistence(database.properties)

    const {
        currentView,
        selectedRowId,
        setSelectedRowId,
        openMode,
        setFromView,
        currentViewId,
        setCurrentViewId
    } = useDatabase()

    // Find selected row for modal (safely)
    const rows = database.rows || []
    const selectedRow = selectedRowId ? rows.find(r => r.id === selectedRowId) : null

    // Set view on mount if we have views
    useEffect(() => {
        if (database.views && database.views.length > 0 && !currentViewId) {
            const defaultView = database.views.find(v => v.isDefault) || database.views[0]
            setCurrentViewId(defaultView.id)
            setFromView(defaultView.type)
        }
    }, [database.views, currentViewId, setCurrentViewId, setFromView])

    const renderView = () => {
        switch (currentView) {
            case ViewType.board:
                return <BoardView database={database} />
            case ViewType.calendar:
                return <CalendarView database={database} />
            case ViewType.gallery:
                return <GalleryView database={database} />
            case ViewType.list:
                return <ListView database={database} />
            case ViewType.timeline:
                return <TimelineView database={database} />
            default:
                return <TableView database={database} />
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Add DocumentHeader if page is provided */}
            {page && <DocumentHeader page={page} />}

            <DatabaseToolbar database={database} />

            <div className="flex-1 overflow-auto">
                {renderView()}
            </div>

            {selectedRow && openMode === 'center' && (
                <RowDetailModal
                    row={selectedRow}
                    database={database}
                    isOpen={!!selectedRow}
                    onClose={() => setSelectedRowId(null)}
                />
            )}

            {selectedRow && openMode === 'side' && (
                <RowDetailDrawer
                    row={selectedRow}
                    database={database}
                    isOpen={!!selectedRow}
                    onClose={() => setSelectedRowId(null)}
                />
            )}
        </div>
    )
}
