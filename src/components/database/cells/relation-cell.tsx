"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X, Plus, ExternalLink } from "lucide-react"
import { getLinkedRows, linkRows, unlinkRow } from "@/app/(main)/_actions/database"
import { DatabaseRow } from "@prisma/client"

interface RelationCellProps {
    propertyId: string
    rowId: string
    value: { linkedRowIds: string[] } | null
    config: {
        targetDatabaseId: string
        limitType: 'none' | 'one'
    }
    editable?: boolean
}

export function RelationCell({
    propertyId,
    rowId,
    value,
    config,
    editable = true
}: RelationCellProps) {
    const [linkedRows, setLinkedRows] = useState<DatabaseRow[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [availableRows, setAvailableRows] = useState<DatabaseRow[]>([])

    if (!config) {
        return <div className="text-muted-foreground italic text-xs px-2">Invalid configuration</div>
    }

    const linkedRowIds = value?.linkedRowIds || []

    // Linked rows'ları fetch et
    useEffect(() => {
        if (linkedRowIds.length > 0 && config?.targetDatabaseId) {
            getLinkedRows(config.targetDatabaseId, linkedRowIds)
                .then(setLinkedRows)
        } else {
            setLinkedRows([])
        }
    }, [JSON.stringify(linkedRowIds), config?.targetDatabaseId])

    // Popover açılınca mevcut rows'ları fetch et
    // Note: fetchDatabaseRows implementation needs to be defined or imported.
    // The provided prompt didn't strictly give fetchDatabaseRows client side function.
    // But likely database.ts has getDatabase(id) which includes rows.
    // Or I can use getLinkedRows with empty filter? No.
    // The prompt missed `fetchDatabaseRows` implementation in the snippet.
    // I will check `getDatabase` in actions. It returns database with rows.

    const fetchDatabaseRows = async (dbId: string) => {
        // Assuming imported getDatabase (which is server action) can be called? No, imports are from actions.
        const { getDatabase } = await import("@/app/(main)/_actions/database")
        const db = await getDatabase(dbId)
        return db?.rows || []
    }

    useEffect(() => {
        if (isOpen && config?.targetDatabaseId) {
            // Target database'in tüm row'larını al
            fetchDatabaseRows(config.targetDatabaseId)
                .then(setAvailableRows)
        }
    }, [isOpen, config?.targetDatabaseId])

    const handleLink = async (targetRowId: string) => {
        const newIds = config.limitType === 'one'
            ? [targetRowId]
            : [...linkedRowIds, targetRowId]

        // Using cellId? Wait, prompt uses `cellId` in action call but logic here uses propertyId/rowId?
        // The action `linkRows` takes `cellId`.
        // But I don't have `cellId` in props.
        // I need `cellId`.
        // OR I need to use `updateCellByPosition(propertyId, rowId, { linkedRowIds: ... })`.
        // The prompt's component `handleLink` calls `linkRows(cellId, newIds)`.
        // But `RelationCell` props don't have `cellId`.
        // Usually standard `Cell` component receives `cell` object or `id`.
        // Here it receives propertyId and rowId.
        // I should probably find the cellId first or use updateCellByPosition if available.
        // `database.ts` has `updateCellByPosition`.
        // I will use `updateCellByPosition` which is safer if cell doesn't exist yet.

        // Wait, prompt provided `linkRows` action which takes `cellId`.
        // If I strictly follow the prompt, I need cellId.
        // But if I don't have it...
        // I'll assume I can use `updateCellByPosition` which I saw in database.ts.

        // Actually, looking at `RelationCellProps`, it has `value`.
        // I will use `updateCellByPosition` for robustness.

        const { updateCellByPosition } = await import("@/app/(main)/_actions/database")
        await updateCellByPosition(propertyId, rowId, { linkedRowIds: newIds })

        if (config.limitType === 'one') {
            setIsOpen(false)
        }
    }

    const handleUnlink = async (targetRowId: string) => {
        const newIds = linkedRowIds.filter(id => id !== targetRowId)
        const { updateCellByPosition } = await import("@/app/(main)/_actions/database")
        await updateCellByPosition(propertyId, rowId, { linkedRowIds: newIds })
    }

    // Zaten linkli olanları filtrele
    const filteredRows = availableRows.filter(row =>
        !linkedRowIds.includes(row.id) &&
        // row.title? Row might not have title property directly if it's dynamic?
        // DatabaseRow + include cells.
        // I need to check how to get title from row.
        // `getDatabase` returns rows with `cells` and `page`.
        // Page has `title`.
        // The TypeScript type `DatabaseRow` from Prisma doesn't include `page` by default unless included.
        // The `fetchDatabaseRows` (via getDatabase) includes `page`.
        // So `row.page?.title`.
        (row as any).page?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-wrap items-center gap-1 min-h-[32px] px-2">
            {/* Linked items */}
            {linkedRows.map(row => (
                <Badge
                    key={row.id}
                    variant="secondary"
                    className="flex items-center gap-1 max-w-[200px]"
                >
                    {/* @ts-ignore */}
                    {(row as any).page?.icon && <span>{(row as any).page.icon}</span>}
                    {/* @ts-ignore */}
                    <span className="truncate">{(row as any).page?.title || "Untitled"}</span>

                    {/* Open link */}
                    <button
                        // @ts-ignore
                        onClick={() => window.open(`/documents/${row.pageId}`, '_blank')}
                        className="hover:bg-muted rounded p-0.5"
                    >
                        <ExternalLink className="h-3 w-3" />
                    </button>

                    {/* Remove */}
                    {editable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleUnlink(row.id)
                            }}
                            className="hover:bg-destructive/20 rounded p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </Badge>
            ))}

            {/* Add button */}
            {editable && (config.limitType === 'none' || linkedRowIds.length === 0) && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Plus className="h-3 w-3 mr-1" />
                            Link
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search pages to link..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList>
                                <CommandEmpty>No pages found</CommandEmpty>
                                {filteredRows.map(row => (
                                    <CommandItem
                                        key={row.id}
                                        onSelect={() => handleLink(row.id)}
                                    >
                                        {/* @ts-ignore */}
                                        {(row as any).page?.icon && <span className="mr-2">{(row as any).page.icon}</span>}
                                        {/* @ts-ignore */}
                                        <span>{(row as any).page?.title || "Untitled"}</span>
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}
