
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
import { useEffect, useRef } from "react"

interface DatabaseViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[]
        views: DatabaseViewModelType[]
    }
    viewConfig?: any
    isLinked?: boolean
}

import { useViewPersistence } from "@/hooks/use-view-persistence"

export function DatabaseView({ database }: DatabaseViewProps) {
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

    // Initialize view from database default if needed
    // Track previous view ID to detect meaningful switches vs server refresh
    const prevViewIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (database.views && database.views.length > 0) {
            // Find default view or first view
            const defaultView = database.views.find(v => v.isDefault) || database.views[0]

            if (!currentViewId) {
                // Initial load: Sync to default only if no ID
                setFromView(defaultView)
            } else {
                // ID exists in store. Verify it exists in THIS database's views
                const exists = database.views.find(v => v.id === currentViewId)
                if (!exists) {
                    // ID suggests different DB or deleted view. Reset to default.
                    setFromView(defaultView)
                }
                // Else: It exists, so we keep using it (persistence worked).
            }
        } else {
            // If we have an ID, check if it's a SWITCH or a REFRESH
            const isViewSwitch = currentViewId !== prevViewIdRef.current

            if (isViewSwitch) {
                // It's a switch! We MUST load the new view's config
                const newView = database.views.find((v: any) => v.id === currentViewId)
                if (newView) {
                    setFromView(newView)
                } else {
                    // ID not found? fallback
                    setFromView(defaultView)
                }
                prevViewIdRef.current = currentViewId
            } else {
                // It's a server update (revalidating path).
                // Do NOT reset local state (filters, sorts) by calling setFromView.
            }
        }

    }, [database.views, setFromView, currentViewId])

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
