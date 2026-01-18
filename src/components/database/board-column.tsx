"use client"

import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { BoardCard } from "./board-card"
import { DatabaseRow, Property, Cell } from "@prisma/client"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"

interface BoardGroup {
    id: string
    title: string
    color: string
}

interface BoardColumnProps {
    group: BoardGroup
    rows: (DatabaseRow & { cells: Cell[] })[]
    properties: Property[]
}

export function BoardColumn({ group, rows, properties }: BoardColumnProps) {
    const { setNodeRef } = useDroppable({
        id: group.id,
        data: {
            type: "Column",
            group,
        }
    })

    const rowIds = useMemo(() => rows.map(r => r.id), [rows])

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-72 flex flex-col gap-2 max-h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-1 h-8">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("px-2 py-0.5 font-normal text-muted-foreground bg-secondary/50 hover:bg-secondary/70")}>
                        {group.title}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">{rows.length}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Cards Area */}
            <ScrollArea className="flex-1 -mx-2 px-2">
                <SortableContext items={rowIds}>
                    <div className="flex flex-col gap-2 pb-4 min-h-[100px]">
                        {rows.map(row => (
                            <BoardCard key={row.id} row={row} properties={properties} />
                        ))}
                    </div>
                </SortableContext>

                {/* Add Card Button */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground h-8 hover:bg-secondary/50 font-normal px-2"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New
                </Button>
            </ScrollArea>
        </div>
    )
}
