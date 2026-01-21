
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDatabase, SortRule } from "@/hooks/use-database"
import { ArrowUpDown, X, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { Property } from "@prisma/client"
import { useState } from "react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface SortPopoverProps {
    properties: Property[]
}

export function SortPopover({ properties }: SortPopoverProps) {
    const { sorts, addSort, updateSort, removeSort } = useDatabase()
    const [open, setOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 ${sorts.length > 0 ? 'text-primary' : ''}`}
                    title="Sort"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">
                        {sorts.length === 0 ? "No sorts applied" : "Sort by"}
                    </div>

                    {sorts.map((sort, index) => {
                        const property = properties.find(p => p.id === sort.propertyId)
                        if (!property) return null

                        return (
                            <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 p-2 rounded border border-border/50">
                                <span className="text-muted-foreground font-medium flex-1 truncate">{property.name}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => {
                                    updateSort(index, { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
                                }}>
                                    {sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
                                </span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive" onClick={() => removeSort(index)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )
                    })}

                    <Popover open={addOpen} onOpenChange={setAddOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground text-xs justify-start px-2">
                                <Plus className="h-3 w-3 mr-2" /> Add sort
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" side="bottom" align="start">
                            <Command>
                                <CommandInput placeholder="Search properties..." />
                                <CommandList>
                                    <CommandEmpty>No property found.</CommandEmpty>
                                    <CommandGroup>
                                        {properties.map(property => (
                                            <CommandItem
                                                key={property.id}
                                                value={property.name}
                                                onSelect={() => {
                                                    addSort({
                                                        id: crypto.randomUUID(),
                                                        propertyId: property.id,
                                                        direction: 'asc'
                                                    })
                                                    setAddOpen(false)
                                                }}
                                            >
                                                {property.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </PopoverContent>
        </Popover>
    )
}
