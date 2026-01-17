
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDatabase, SortRule } from "@/hooks/use-database"
import { ArrowUpDown, X, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { Property } from "@prisma/client"

interface SortPopoverProps {
    properties: Property[]
}

export function SortPopover({ properties }: SortPopoverProps) {
    const { sorts, addSort, updateSort, removeSort } = useDatabase()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={`h-8 gap-1 px-2 ${sorts.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
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
                            <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 p-2 rounded">
                                <span className="text-muted-foreground">{property.name}</span>
                                <span className="font-medium mx-1 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => {
                                    updateSort(index, { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
                                }}>
                                    {sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
                                </span>
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto" onClick={() => removeSort(index)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )
                    })}

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Add sort
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2" side="right" align="start">
                            <div className="space-y-1">
                                {properties.map(property => (
                                    <Button
                                        key={property.id}
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => addSort({
                                            propertyId: property.id,
                                            direction: 'asc'
                                        })}
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
