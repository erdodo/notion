"use client"

import { DatabaseRow, Cell, Property } from "@prisma/client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CellRenderer } from "./cell-renderer"
import { useState } from "react"
import { updateCell } from "@/app/(main)/_actions/database"

interface RowDetailModalProps {
    row: DatabaseRow & { cells: Cell[] }
    properties: Property[] // Full properties to render fields
    isOpen: boolean
    onClose: () => void
}

export function RowDetailModal({ row, properties, isOpen, onClose }: RowDetailModalProps) {
    const [localTitle, setLocalTitle] = useState("")
    // Title is handled via cell, but for header we might want direct access if title cell found.

    const titleProp = properties.find(p => p.type === 'TITLE')
    const titleCell = row.cells.find(c => c.propertyId === titleProp?.id)

    // Note: For content we likely use BlockNote or similar editor component.
    // Since integrating full BlockNote here requires PageId which row has.
    // We can render the Page Editor component if it's reusable.
    // Assuming a placeholder or simple text area for now if Editor not easily detachable.
    // But Row IS A Page. So we can just navigate to it?
    // Usually modal shows properties on top and content below.

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                {/* Cover / Icon Area Placeholder */}
                <div className="h-32 bg-secondary/30 relative shrink-0 group">
                    {row.pageId && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm">
                            Add Cover
                        </div>
                    )}
                    <div className="absolute -bottom-8 left-12 h-16 w-16 bg-background rounded-md shadow-sm border flex items-center justify-center text-3xl">
                        {/* Icon */}
                        {/* row.icon usually comes from Page model if linked. DatabaseRow doesn't have icon field in schema shown in prompt? 
                     Wait, schema had `page Page?` relation. 
                     Properties are cells.
                     Usually icon is on the page.
                  */}
                        📄
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-12 pt-12 pb-8">
                    {/* Title */}
                    <div className="mb-8">
                        <Input
                            className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-muted-foreground/50"
                            value={titleCell?.value as string || ""}
                            placeholder="Untitled"
                            onChange={(e) => {
                                // Optimistic update + Server action
                                // updateCell(titleCell.id, e.target.value)
                            }}
                        />
                    </div>

                    {/* Properties Grid */}
                    <div className="space-y-1 mb-8">
                        {properties.filter(p => p.type !== 'TITLE').map(prop => {
                            const cell = row.cells.find(c => c.propertyId === prop.id)
                            return (
                                <div key={prop.id} className="flex items-start py-1.5 group">
                                    <div className="w-[160px] flex items-center gap-2 text-sm text-muted-foreground pt-1.5 shrink-0">
                                        {/* Icon */}
                                        <span className="truncate">{prop.name}</span>
                                    </div>
                                    <div className="flex-1 min-h-[32px] rounded-md hover:bg-muted/50 -ml-2 px-2 py-1 transition-colors">
                                        {/* Reuse CellRenderer but ensure it works in form mode? 
                                     CellRenderer usually is for Table (compact).
                                     We might need specific form renderers.
                                     For now using CellRenderer if it supports editing.
                                 */}
                                        <CellRenderer
                                            getValue={() => cell?.value}
                                            rowId={row.id}
                                            propertyId={prop.id}
                                            cell={cell}
                                            // props mocking table context, tricky.
                                            // Ideally we extract Edit component from CellRenderer.
                                            column={{ columnDef: { meta: { property: prop } } } as any}
                                            table={{} as any}
                                            isEditing={false} // Click to edit usually
                                            startEditing={() => { }}
                                            stopEditing={() => { }}
                                            updateValue={() => { }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="h-[1px] bg-border my-6" />

                    {/* Page Content */}
                    <div className="min-h-[200px] text-muted-foreground">
                        {/* <BlockEditor pageId={row.pageId} /> */}
                        <div className="flex items-center gap-2">
                            <p>Click to start writing...</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
