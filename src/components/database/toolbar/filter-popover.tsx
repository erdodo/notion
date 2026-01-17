
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDatabase, FilterRule, FilterOperator } from "@/hooks/use-database"
import { Filter, X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Property } from "@prisma/client"
import { useState } from "react"

interface FilterPopoverProps {
    properties: Property[]
}

const operators: { label: string, value: FilterOperator }[] = [
    { label: "Is", value: "is" },
    { label: "Is not", value: "is_not" },
    { label: "Contains", value: "contains" },
    { label: "Does not contain", value: "not_contains" },
    { label: "Is empty", value: "is_empty" },
    { label: "Is not empty", value: "is_not_empty" },
]

export function FilterPopover({ properties }: FilterPopoverProps) {
    const { filters, addFilter, updateFilter, removeFilter } = useDatabase()
    const [open, setOpen] = useState(false)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={`h-8 gap-1 px-2 ${filters.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">
                        {filters.length === 0 ? "No filters applied" : "In this view, filter by:"}
                    </div>

                    {filters.map((filter, index) => {
                        const property = properties.find(p => p.id === filter.propertyId)
                        if (!property) return null

                        return (
                            <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 p-2 rounded">
                                <span className="text-muted-foreground">{property.name}</span>
                                <span className="font-medium mx-1">{operators.find(o => o.value === filter.operator)?.label}</span>
                                <Input
                                    className="h-6 w-32 text-xs"
                                    placeholder="Value..."
                                    value={filter.value || ''}
                                    onChange={(e) => {
                                        updateFilter(index, { ...filter, value: e.target.value })
                                    }}
                                />
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto" onClick={() => removeFilter(index)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )
                    })}

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Add filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2" side="right" align="start">
                            <div className="space-y-1">
                                {properties.map(property => (
                                    <Button
                                        key={property.id}
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            addFilter({
                                                propertyId: property.id,
                                                operator: 'contains',
                                                value: ''
                                            })
                                            setOpen(false)
                                        }}
                                    >
                                        {property.name}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </PopoverContent>
        </Popover>
    )
}
