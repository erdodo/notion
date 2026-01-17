
"use client"

import { Database, Property, DatabaseRow, Cell } from "@prisma/client"
import { TableView } from "./table-view"
import { useState } from "react"

interface DatabaseViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
}

import { DatabaseToolbar } from "./toolbar/database-toolbar"
import { ListView } from "./list-view"

export function DatabaseView({ database }: DatabaseViewProps) {
    const [view, setView] = useState('table')

    return (
        <div className="flex flex-col h-full bg-background relative group">
            {/* Center container like pages */}
            <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-12 pb-24 pt-4 overflow-hidden flex flex-col">
                <DatabaseToolbar view={view} onViewChange={setView} properties={database.properties} />
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {view === 'table' && <TableView database={database} />}
                    {view === 'list' && <ListView database={database} />}
                </div>
            </div>
        </div>
    )
}
