"use client"

import { useState } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { ChevronRight, ChevronDown } from "lucide-react"
import { flexRender } from "@tanstack/react-table"

interface GroupSectionProps {
    group: any
    table: any
    columns: any
    isGrouped?: boolean
}

export function GroupSection({ group, table, columns }: GroupSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    // Filter table rows that belong to this group
    // In `data` memo, we kept original rows.
    // The `group.rows` are the data objects.
    // We need to find the corresponding `Row` objects from `table.getRowModel()`.

    // Safety check for groupRows
    const groupRows = table.getRowModel().rows.filter((r: any) => group.rows.some((gr: any) => gr.id === r.id))

    return (
        <>
            <TableRow className="bg-secondary/20 hover:bg-secondary/30">
                <TableCell colSpan={columns.length + 1} className="p-0">
                    <div
                        className="flex items-center gap-2 p-1 pl-2 cursor-pointer select-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium text-sm flex items-center gap-2">
                            {group.groupKey === "__empty__" ? "No Group" : (
                                <span>{String(group.groupValue)}</span>
                            )}
                            <span className="text-muted-foreground font-normal ml-1">
                                {groupRows.length}
                            </span>
                        </span>
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && groupRows.map((row: any) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group h-[32px] hover:bg-muted/50 transition-colors border-b border-border/50"
                >
                    {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id} className="p-0 border-r border-border/50 last:border-r-0 relative database-cell align-top" style={{ width: cell.column.getSize() }}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </TableCell>
                    ))}
                    <TableCell className="border-l border-border/50 bg-transparent p-0 min-w-[50px]">
                        <div className="h-full w-full" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
