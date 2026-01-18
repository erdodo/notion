
import { useState } from "react"
import { PropertyType } from "@prisma/client"
import { deleteProperty, updateProperty } from "@/app/(main)/_actions/database"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Trash, Edit2, ArrowDown, ArrowUp, Type } from "lucide-react"
import { PropertyTypeIcon, propertyTypeIcons } from "./property-type-icon"
import {
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"

// ... imports
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RelationConfig } from "@/components/database/config/relation-config"
import { FormulaEditor } from "@/components/database/config/formula-editor"
import { RollupConfig } from "@/components/database/config/rollup-config"
import { Property } from "@prisma/client"
import { SelectConfig } from "@/components/database/config/select-config"

interface PropertyHeaderProps {
    property: {
        id: string
        name: string
        type: PropertyType
        relationConfig?: any
        rollupConfig?: any
        formulaConfig?: any
    }
    column: any // TanStack column
    title?: string // Override title if needed
    databaseId: string
    allProperties: Property[]
    onPropertyUpdate?: (propertyId: string, data: any) => void
    onEditProperty?: (propertyId: string, type: 'relation' | 'rollup' | 'formula' | 'select') => void
}

export function PropertyHeader({ property, column, title, databaseId, allProperties, onPropertyUpdate, onEditProperty }: PropertyHeaderProps) {
    const icon = <PropertyTypeIcon type={property.type} className="h-3 w-3 mr-2 text-muted-foreground" />
    const name = title || property.name

    const onDelete = async () => {
        await deleteProperty(property.id)
    }

    const [isEditing, setIsEditing] = useState(false)
    const [tempName, setTempName] = useState(name)

    const onRename = async () => {
        if (tempName !== property.name) {
            onPropertyUpdate?.(property.id, { name: tempName })
            await updateProperty(property.id, { name: tempName })
        }
        setIsEditing(false)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center h-full w-full px-2 py-2 hover:bg-muted/50 cursor-pointer text-sm font-normal text-muted-foreground select-none">
                        {icon}
                        <span className="truncate">{name}</span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <div className="p-2">
                        <input
                            className="text-sm w-full border rounded px-1 py-0.5"
                            value={tempName}
                            onChange={e => setTempName(e.target.value)}
                            onBlur={onRename}
                            onKeyDown={e => e.key === 'Enter' && onRename()}
                        />
                    </div>
                    <DropdownMenuSeparator />

                    {(property.type === 'SELECT' || property.type === 'MULTI_SELECT') && (
                        <DropdownMenuItem onClick={() => onEditProperty?.(property.id, 'select')}>
                            <Edit2 className="mr-2 h-3 w-3" /> Edit Options
                        </DropdownMenuItem>
                    )}

                    {property.type === 'RELATION' && (
                        <DropdownMenuItem onClick={() => onEditProperty?.(property.id, 'relation')}>
                            <Edit2 className="mr-2 h-3 w-3" /> Edit Relation
                        </DropdownMenuItem>
                    )}

                    {property.type === 'FORMULA' && (
                        <DropdownMenuItem onClick={() => onEditProperty?.(property.id, 'formula')}>
                            <Edit2 className="mr-2 h-3 w-3" /> Edit Formula
                        </DropdownMenuItem>
                    )}

                    {property.type === 'ROLLUP' && (
                        <DropdownMenuItem onClick={() => onEditProperty?.(property.id, 'rollup')}>
                            <Edit2 className="mr-2 h-3 w-3" /> Configure Rollup
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                        <ArrowUp className="mr-2 h-3 w-3" /> Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                        <ArrowDown className="mr-2 h-3 w-3" /> Descending
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Type className="mr-2 h-3 w-3" /> Type
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={property.type} onValueChange={(val) => updateProperty(property.id, { type: val as PropertyType })}>
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
                    <DropdownMenuSeparator />
                    {property.type !== 'TITLE' && (
                        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                            <Trash className="mr-2 h-3 w-3" /> Delete Property
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}
