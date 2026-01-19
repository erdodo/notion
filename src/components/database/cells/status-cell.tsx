
import { useState } from "react"
import { CellProps } from "./types"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, MoreHorizontal, Trash, Plus } from "lucide-react"
import { NOTION_COLORS, getOptionColors } from "@/lib/notion-colors"
import { cn } from "@/lib/utils"
import { updateProperty } from "@/app/(main)/_actions/database"

interface StatusOption {
    id: string
    name: string
    color: string
    group: "todo" | "inprogress" | "complete"
}

const GROUPS = [
    { id: "todo", label: "To-do", color: "text-gray-500" },
    { id: "inprogress", label: "In Progress", color: "text-blue-500" },
    { id: "complete", label: "Complete", color: "text-green-500" },
] as const

export function StatusCell({ getValue, updateValue, column, onPropertyUpdate }: CellProps) {
    const initialValue = getValue()
    const val = typeof initialValue === 'object' ? initialValue?.value : initialValue

    const property = (column.columnDef.meta as any)?.property
    const options: StatusOption[] = (property?.options as any) || []

    const selectedOption = options.find(o => o.id === val)
    const selectedColors = selectedOption ? getOptionColors(selectedOption.color) : null

    const onSelect = (option: StatusOption) => {
        updateValue({ value: option.id })
    }

    const [search, setSearch] = useState("")

    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))

    // Group options
    const groupedOptions = {
        todo: filteredOptions.filter(o => o.group === 'todo'),
        inprogress: filteredOptions.filter(o => o.group === 'inprogress'),
        complete: filteredOptions.filter(o => o.group === 'complete'),
    }

    const handleAddOption = async (group: "todo" | "inprogress" | "complete", name?: string) => {
        const newOption: StatusOption = {
            id: crypto.randomUUID(),
            name: name || "New Option",
            color: "gray",
            group
        }

        const newOptions = [...options, newOption]

        // Optimistic update
        onPropertyUpdate?.(property.id, { options: newOptions })

        // Server update
        await updateProperty(property.id, {
            ...property,
            options: newOptions
        })

        // Select the new option
        updateValue({ value: newOption.id })
    }

    const handleUpdateOption = async (optionId: string, updates: Partial<StatusOption>) => {
        const newOptions = options.map(o => o.id === optionId ? { ...o, ...updates } : o)

        onPropertyUpdate?.(property.id, { options: newOptions })

        await updateProperty(property.id, {
            ...property,
            options: newOptions
        })
    }

    const handleDeleteOption = async (optionId: string) => {
        const newOptions = options.filter(o => o.id !== optionId)

        onPropertyUpdate?.(property.id, { options: newOptions })

        await updateProperty(property.id, {
            ...property,
            options: newOptions
        })

        if (val === optionId) {
            updateValue({ value: null })
        }
    }

    return (
        <div className="h-full w-full py-1.5 px-2">
            <Popover>
                <PopoverTrigger asChild>
                    <div className="h-full w-full cursor-pointer min-h-[24px]">
                        {selectedOption ? (
                            <Badge variant="secondary" className={cn(selectedColors?.bg, selectedColors?.text)}>
                                {selectedOption.name}
                            </Badge>
                        ) : (
                            <div className="h-full w-full" />
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                    <div className="p-2">
                        <input
                            className="w-full text-sm border-b p-1 mb-2 outline-none bg-transparent"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && search) {
                                    // Default to todo if creating from search
                                    handleAddOption('todo', search)
                                    setSearch("")
                                }
                            }}
                        />
                        <div className="max-h-[300px] overflow-auto">
                            {GROUPS.map(group => {
                                const groupOptions = groupedOptions[group.id as keyof typeof groupedOptions]
                                // Even if empty, we might want to show header to allow adding via button

                                return (
                                    <div key={group.id} className="mb-2">
                                        <div className="flex items-center justify-between px-2 py-1 mb-1 group/header">
                                            <span className={cn("text-xs font-semibold", group.color)}>
                                                {group.label}
                                                <span className="ml-2 text-[10px] text-muted-foreground font-normal">{groupOptions.length}</span>
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 opacity-0 group-hover/header:opacity-100"
                                                onClick={() => handleAddOption(group.id as any)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {groupOptions.map(option => {
                                            const colors = getOptionColors(option.color)
                                            return (
                                                <div
                                                    key={option.id}
                                                    className="group flex items-center justify-between p-1 hover:bg-muted cursor-pointer rounded text-sm mx-1"
                                                    onClick={() => onSelect(option)}
                                                >
                                                    <div className="flex items-center">
                                                        <Badge variant="secondary" className={cn("mr-2", colors.bg, colors.text)}>
                                                            {option.name}
                                                        </Badge>
                                                        {option.id === val && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 p-0" onClick={(e) => e.stopPropagation()}>
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-48 p-2" side="right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="text-xs font-medium text-muted-foreground mb-2">Edit Option</div>
                                                            <input
                                                                className="w-full text-sm border rounded px-2 py-1 mb-2 bg-background"
                                                                value={option.name}
                                                                onChange={(e) => handleUpdateOption(option.id, { name: e.target.value })}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div className="grid grid-cols-5 gap-1 mb-2">
                                                                {NOTION_COLORS.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i).map(color => (
                                                                    <div
                                                                        key={color.name}
                                                                        className={cn("w-6 h-6 rounded cursor-pointer border hover:opacity-80", color.bg)}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleUpdateOption(option.id, { color: color.value })
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full text-xs text-destructive justify-start h-8 px-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteOption(option.id)
                                                                }}
                                                            >
                                                                <Trash className="h-3 w-3 mr-2" /> Delete
                                                            </Button>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
