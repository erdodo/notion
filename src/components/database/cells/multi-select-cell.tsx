
import { useState } from "react"
import { CellProps } from "./types"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, MoreHorizontal, Trash, X, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { updateProperty } from "@/app/(main)/_actions/database"
import { getOptionColors, NOTION_COLORS } from "@/lib/notion-colors"
import { cn } from "@/lib/utils"

interface Option {
    id: string
    name: string
    color: string
}

export function MultiSelectCell({ getValue, updateValue, column, onPropertyUpdate }: CellProps) {
    const initialValue = getValue()
    // Value format: { value: ["opt-id-1", "opt-id-2"] }
    const val = typeof initialValue === 'object' ? (initialValue?.value as string[]) || [] : []
    const selectedIds = Array.isArray(val) ? val : []

    // Property options
    const property = (column.columnDef.meta as any)?.property
    const options: Option[] = (property?.options as any) || []

    const selectedOptions = options.filter(o => selectedIds.includes(o.id))

    const [search, setSearch] = useState("")

    const toggleOption = (optionId: string) => {
        if (selectedIds.includes(optionId)) {
            updateValue({ value: selectedIds.filter(id => id !== optionId) })
        } else {
            updateValue({ value: [...selectedIds, optionId] })
        }
    }

    const removeOption = (e: React.MouseEvent, optionId: string) => {
        e.stopPropagation()
        updateValue({ value: selectedIds.filter(id => id !== optionId) })
    }

    const createOption = async () => {
        if (!search) return

        const newOption = {
            id: crypto.randomUUID(),
            name: search,
            color: "gray"
        }

        const newOptions = [...options, newOption]

        // Optimistic update
        onPropertyUpdate?.(property.id, { options: newOptions })

        await updateProperty(property.id, {
            ...property,
            options: newOptions
        })

        // Auto select the new option
        updateValue({ value: [...selectedIds, newOption.id] })
        setSearch("")
    }

    return (
        <div className="h-full w-full py-1.5 px-2">
            <Popover>
                <PopoverTrigger asChild>
                    <div className="h-full w-full cursor-pointer min-h-[24px]">
                        {selectedOptions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {selectedOptions.map(opt => {
                                    const colors = getOptionColors(opt.color)
                                    return (
                                        <Badge
                                            key={opt.id}
                                            variant="secondary"
                                            className={cn("px-1 py-0 h-5 font-normal", colors.bg, colors.text)}
                                        >
                                            {opt.name}
                                            <div
                                                role="button"
                                                onClick={(e) => removeOption(e, opt.id)}
                                                className="ml-1 rounded-sm hover:bg-black/10 p-0.5 cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </div>
                                        </Badge>
                                    )
                                })}
                            </div>
                        ) : (
                            <span className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">Empty</span>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <div className="p-2">
                        <input
                            className="w-full text-sm border-b p-1 mb-2 outline-none bg-transparent"
                            placeholder="Search or create..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && search && !options.find(o => o.name === search)) {
                                    createOption()
                                }
                            }}
                        />
                        <div className="max-h-[200px] overflow-auto space-y-0.5">
                            {options.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).map(option => (
                                <div
                                    key={option.id}
                                    className="group flex items-center justify-between p-1 hover:bg-muted cursor-pointer rounded text-sm"
                                    onClick={() => toggleOption(option.id)}
                                >
                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                        <Checkbox
                                            checked={selectedIds.includes(option.id)}
                                            onCheckedChange={() => toggleOption(option.id)}
                                            className="h-4 w-4"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Badge variant="secondary" className={cn("truncate", getOptionColors(option.color).bg, getOptionColors(option.color).text)}>
                                            {option.name}
                                        </Badge>
                                    </div>

                                    <Popover>
                                        <PopoverTrigger asChild dest="body">
                                            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 p-0" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2" side="right" onClick={(e) => e.stopPropagation()}>
                                            <div className="text-xs font-medium text-muted-foreground mb-2">Edit Option</div>
                                            <div className="grid grid-cols-5 gap-1 mb-2">
                                                {NOTION_COLORS.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i).map(color => (
                                                    <div
                                                        key={color.name}
                                                        className={cn("w-6 h-6 rounded cursor-pointer border hover:opacity-80", color.bg)}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const newOptions = options.map(o => o.id === option.id ? { ...o, color: color.value } : o)
                                                            onPropertyUpdate?.(property.id, { options: newOptions })
                                                            updateProperty(property.id, { ...property, options: newOptions })
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <input
                                                className="w-full text-xs border rounded p-1 mb-2"
                                                defaultValue={option.name}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const newName = (e.currentTarget as HTMLInputElement).value
                                                        if (newName && newName !== option.name) {
                                                            const newOptions = options.map(o => o.id === option.id ? { ...o, name: newName } : o)
                                                            onPropertyUpdate?.(property.id, { options: newOptions })
                                                            updateProperty(property.id, { ...property, options: newOptions })
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs text-destructive justify-start h-8 px-1"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const newOptions = options.filter(o => o.id !== option.id)
                                                    onPropertyUpdate?.(property.id, { options: newOptions })
                                                    updateProperty(property.id, { ...property, options: newOptions })
                                                    // Also remove from selection if selected
                                                    if (selectedIds.includes(option.id)) {
                                                        updateValue({ value: selectedIds.filter(id => id !== option.id) })
                                                    }
                                                }}
                                            >
                                                <Trash className="h-3 w-3 mr-2" /> Delete
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ))}
                            {search && !options.find(o => o.name === search) && (
                                <div
                                    className="text-sm p-1 hover:bg-muted cursor-pointer rounded text-muted-foreground flex items-center gap-2"
                                    onClick={createOption}
                                >
                                    <Plus className="h-3 w-3" />
                                    <span>Create "{search}"</span>
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
