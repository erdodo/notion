
"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import { useState, useMemo, useEffect } from "react"
import { Database, Property, DatabaseRow, Cell } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PropertyHeader } from "./property-header"
import { CellRenderer } from "./cell-renderer"
import { AddRowButton } from "./add-row-button"
import { AddPropertyButton } from "./add-property-button"
import { updateCellByPosition, addRow, addProperty, updateProperty } from "@/app/(main)/_actions/database"
import { useOptimisticDatabase } from "@/hooks/use-optimistic-database"
import { useFilteredSortedData } from "@/hooks/use-filtered-sorted-data"
import { cn } from "@/lib/utils"

interface TableViewProps {
    database: Database & {
        properties: Property[]
        rows: (DatabaseRow & { cells: Cell[] })[]
    }
}

export function TableView({ database: initialDatabase }: TableViewProps) {
    const { database, updateCell, addRow: addOptimisticRow, addProperty: addOptimisticProperty } = useOptimisticDatabase(initialDatabase as any)

    const [sorting, setSorting] = useState<SortingState>([])

    const filteredRows = useFilteredSortedData(database)

    // Update data memo to use filtered rows
    const data = useMemo(() => {
        return filteredRows.map(row => {
            const rowData: any = { id: row.id, originalRow: row }
            row.cells.forEach(cell => {
                rowData[cell.propertyId] = cell.value
            })
            return rowData
        })
    }, [filteredRows]) // filteredRows is already memoized in the hook

    const columns = useMemo<ColumnDef<any>[]>(() => {
        return database.properties.map(property => ({
            accessorKey: property.id,
            header: ({ column }) => (
                <PropertyHeader property={property} column={column} databaseId={database.id} />
            ),
            cell: ({ getValue, row, column, table }) => {
                // Stable update callback
                const updateValue = (value: any) => {
                    // Optimistic update
                    updateCell(row.original.id, property.id, value)
                    // Server update
                    updateCellByPosition(property.id, row.original.id, value)
                }

                return (
                    <CellWrapper
                        getValue={getValue}
                        rowId={row.original.id}
                        propertyId={property.id}
                        table={table}
                        column={column}
                        updateValue={updateValue}
                        row={row}
                    />
                )
            },
            meta: {
                property: property,
                getPageId: (rowId: string) => null
            },
            enableSorting: true,
            size: property.width || 200,
        }))
    }, [database.properties])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        defaultColumn: {
            minSize: 50,
            maxSize: 500,
        },
        columnResizeMode: "onChange",
        getRowId: row => row.id,
    })

    const handleAddRow = async () => {
        // Create optimistic row
        const tempId = crypto.randomUUID()
        const newRow: any = {
            id: tempId,
            databaseId: database.id,
            pageId: null,
            order: database.rows.length,
            createdAt: new Date(),
            updatedAt: new Date(),
            cells: []
        }
        addOptimisticRow(newRow)

        // Server Call
        await addRow(database.id)
    }

    return (
        <div className="w-full flex-1 flex flex-col h-full overflow-hidden">
            <div className="border border-border/50 rounded-sm overflow-hidden flex flex-col max-h-full">
                {/* Horizontal Scroll Area */}
                <div className="overflow-auto w-full flex-1 relative">
                    <Table className="w-max min-w-full database-table">
                        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/50">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                style={{ width: header.getSize() }}
                                                className="h-9 px-0 border-r border-border/50 last:border-r-0 relative group bg-secondary/30 select-none text-xs font-normal text-muted-foreground"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                <div
                                                    onMouseDown={(e) => {
                                                        header.getResizeHandler()(e)
                                                        const onMouseUp = () => {
                                                            setTimeout(() => {
                                                                const width = header.column.getSize()
                                                                updateProperty(header.column.id, { width })
                                                            }, 0)
                                                            document.removeEventListener('mouseup', onMouseUp)
                                                        }
                                                        document.addEventListener('mouseup', onMouseUp)
                                                    }}
                                                    onTouchStart={(e) => {
                                                        header.getResizeHandler()(e)
                                                        const onTouchEnd = () => {
                                                            setTimeout(() => {
                                                                const width = header.column.getSize()
                                                                updateProperty(header.column.id, { width })
                                                            }, 0)
                                                            document.removeEventListener('touchend', onTouchEnd)
                                                        }
                                                        document.addEventListener('touchend', onTouchEnd)
                                                    }}
                                                    className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary opacity-0 group-hover:opacity-100 ${header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
                                                        }`}
                                                />
                                            </TableHead>
                                        )
                                    })}
                                    <TableHead className="w-[50px] p-0 border-l border-border/50 bg-secondary/30">
                                        <div className="flex items-center justify-center h-full">
                                            <AddPropertyButton databaseId={database.id} />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="group h-[32px]"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="p-0 border-r border-border/50 last:border-r-0 relative database-cell align-top">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell className="border-l border-border/50 bg-transparent" />
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + 1}
                                        className="h-24 text-center text-muted-foreground text-sm"
                                    >
                                        No entries.
                                    </TableCell>
                                </TableRow>
                            )}

                        </TableBody>
                    </Table>
                </div>
                <div className="border-t border-border/50">
                    <AddRowButton databaseId={database.id} onAdd={handleAddRow} />
                </div>
            </div>
        </div>
    )
}

function CellWrapper({ getValue, rowId, propertyId, table, column, updateValue, row }: any) {
    const [isEditing, setIsEditing] = useState(false)
    return (
        <CellRenderer
            getValue={getValue}
            rowId={rowId}
            propertyId={propertyId}
            table={table}
            column={column}
            cell={{}}
            isEditing={isEditing}
            startEditing={() => setIsEditing(true)}
            stopEditing={() => setIsEditing(false)}
            updateValue={updateValue}
            row={row}
        />
    )
}
