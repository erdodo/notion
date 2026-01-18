"use client"

import { DatabaseRow, Property, Cell, PropertyType, Database } from "@prisma/client"
import { PropertyTypeIcon, propertyTypeIcons } from "./property-type-icon"
import { CellRenderer } from "./cell-renderer"
import { useState, useCallback, useEffect } from "react"
import { updateCellByPosition, updateProperty, deleteProperty, reorderProperties } from "@/app/(main)/_actions/database"
import { AddPropertyButton } from "./add-property-button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Edit2, Trash, ArrowUp, ArrowDown, Type } from "lucide-react"
import { PropertyConfigDialog } from "./property-config-dialog"
import { cn } from "@/lib/utils"

interface PagePropertiesProps {
    row: DatabaseRow & { cells: Cell[]; database: Database & { properties: Property[] } }
}

export function PageProperties({ row }: PagePropertiesProps) {
    const [properties, setProperties] = useState(row.database.properties)
    const [cells, setCells] = useState(row.cells)

    // Sync state with props when row data changes (e.g. after adding property)
    useEffect(() => {
        setProperties(row.database.properties)
        setCells(row.cells)
    }, [row])

    // Config dialog state
    const [configDialog, setConfigDialog] = useState<{ propertyId: string, type: 'relation' | 'rollup' | 'formula' | 'select' } | null>(null)

    const handleUpdateCell = useCallback(async (propertyId: string, value: any) => {
        // Optimistic update
        setCells(prev => {
            const index = prev.findIndex(c => c.propertyId === propertyId)
            if (index >= 0) {
                const newCells = [...prev]
                newCells[index] = { ...newCells[index], value }
                return newCells
            } else {
                return [...prev, {
                    id: "temp",
                    propertyId,
                    rowId: row.id,
                    value
                } as Cell]
            }
        })

        // Server update
        await updateCellByPosition(propertyId, row.id, value)
    }, [row.id])

    const handleDeleteProperty = async (propertyId: string) => {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
        await deleteProperty(propertyId)
    }

    const handleUpdateProperty = async (propertyId: string, data: Partial<Property>) => {
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, ...data } : p))
        await updateProperty(propertyId, data as any)
    }

    // Sort logic
    const moveProperty = async (index: number, direction: 'up' | 'down') => {
        const newHelper = [...properties]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= newHelper.length) return

        // Swap
        const temp = newHelper[index]
        newHelper[index] = newHelper[targetIndex]
        newHelper[targetIndex] = temp

        setProperties(newHelper)

        // Persist order
        await reorderProperties(row.databaseId, newHelper.map(p => p.id))
    }

    return (
        <div className="py-2 space-y-1 mb-6 border-b border-border/50 pb-4">
            {properties.map((property, index) => {
                const cell = cells.find(c => c.propertyId === property.id)

                // Skip title property as it is the page title
                if (property.type === "TITLE") return null

                return (
                    <div key={property.id} className="flex items-start group min-h-[34px]">
                        <div className="w-[160px] flex items-center pt-1.5 shrink-0">
                            <PropertyMenu
                                property={property}
                                onUpdate={handleUpdateProperty}
                                onDelete={() => handleDeleteProperty(property.id)}
                                onEditConfig={(type: 'relation' | 'rollup' | 'formula' | 'select') => setConfigDialog({ propertyId: property.id, type })}
                                onMoveUp={() => moveProperty(index, 'up')}
                                onMoveDown={() => moveProperty(index, 'down')}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <PagePropertyCell
                                property={property}
                                cell={cell}
                                row={row}
                                onUpdate={handleUpdateCell}
                                onPropertyUpdate={handleUpdateProperty}
                            />
                        </div>
                    </div>
                )
            })}

            {/* Add Property */}
            <div className="flex items-start pt-1.5">
                <div className="w-[160px]">
                    <AddPropertyButton databaseId={row.databaseId} />
                </div>
            </div>

            <PropertyConfigDialog
                databaseId={row.databaseId}
                isOpen={!!configDialog}
                onOpenChange={(open) => !open && setConfigDialog(null)}
                configType={configDialog?.type || null}
                property={configDialog ? properties.find(p => p.id === configDialog.propertyId) : undefined}
                allProperties={properties}
                onPropertyUpdate={(id, data) => handleUpdateProperty(id, data)}
            />
        </div>
    )
}

function PropertyMenu({ property, onUpdate, onDelete, onEditConfig, onMoveUp, onMoveDown }: any) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(property.name)

    const handleRename = () => {
        if (tempName !== property.name) {
            onUpdate(property.id, { name: tempName })
        }
        setIsEditingName(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 rounded px-2 py-1 cursor-pointer select-none transition-colors w-full mr-2">
                    <PropertyTypeIcon type={property.type} className="h-4 w-4" />
                    <span className="truncate">{property.name}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <div className="p-2">
                    <input
                        className="text-sm w-full border rounded px-1 py-0.5 bg-background"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Type className="mr-2 h-3 w-3" /> Type
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                            value={property.type}
                            onValueChange={(val) => onUpdate(property.id, { type: val as PropertyType })}
                        >
                            {Object.keys(propertyTypeIcons).map((key) => {
                                const type = key as PropertyType
                                const Icon = propertyTypeIcons[type]
                                return (
                                    <DropdownMenuRadioItem key={type} value={type}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span className="capitalize">{type.toLowerCase().replace("_", " ")}</span>
                                    </DropdownMenuRadioItem>
                                )
                            })}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {(property.type === 'SELECT' || property.type === 'MULTI_SELECT') && (
                    <DropdownMenuItem onClick={() => onEditConfig('select')}>
                        <Edit2 className="mr-2 h-3 w-3" /> Edit Options
                    </DropdownMenuItem>
                )}

                {property.type === 'RELATION' && (
                    <DropdownMenuItem onClick={() => onEditConfig('relation')}>
                        <Edit2 className="mr-2 h-3 w-3" /> Edit Relation
                    </DropdownMenuItem>
                )}

                {property.type === 'ROLLUP' && (
                    <DropdownMenuItem onClick={() => onEditConfig('rollup')}>
                        <Edit2 className="mr-2 h-3 w-3" /> Configure Rollup
                    </DropdownMenuItem>
                )}

                {property.type === 'FORMULA' && (
                    <DropdownMenuItem onClick={() => onEditConfig('formula')}>
                        <Edit2 className="mr-2 h-3 w-3" /> Edit Formula
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onMoveUp}>
                    <ArrowUp className="mr-2 h-3 w-3" /> Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMoveDown}>
                    <ArrowDown className="mr-2 h-3 w-3" /> Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash className="mr-2 h-3 w-3" /> Delete Property
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function PagePropertyCell({ property, cell, row, onUpdate, onPropertyUpdate }: any) {
    const [isEditing, setIsEditing] = useState(false)

    // Mocking the table/column structure expected by CellRenderer
    const mockColumn = {
        columnDef: {
            meta: {
                property: property
            }
        }
    }

    const mockTable = {}

    return (
        <div className="px-2 py-1 -ml-2 rounded hover:bg-muted/50 transition-colors min-h-[28px]">
            <CellRenderer
                getValue={() => cell?.value}
                rowId={row.id}
                propertyId={property.id}
                table={mockTable as any}
                column={mockColumn as any}
                cell={cell || {}}
                isEditing={isEditing}
                startEditing={() => setIsEditing(true)}
                stopEditing={() => setIsEditing(false)}
                updateValue={(val) => onUpdate(property.id, val)}
                row={row}
                onPropertyUpdate={onPropertyUpdate}
            />
        </div>
    )
}
