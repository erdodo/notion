
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Filter, ArrowUpDown, MoreHorizontal, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDatabase } from "@/hooks/use-database"
import { FilterPopover } from "./filter-popover"
import { SortPopover } from "./sort-popover"

interface DatabaseToolbarProps {
    view: string
    onViewChange: (view: string) => void
    properties: any[]
}

export function DatabaseToolbar({ view, onViewChange, properties }: DatabaseToolbarProps) {
    const { searchQuery, setSearchQuery } = useDatabase()

    return (
        <div className="flex items-center justify-between px-2 py-3 border-b mb-2">
            <div className="flex items-center gap-1">
                {/* View Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 font-medium px-2">
                            {view === 'table' ? 'Table' : 'List'} View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Views</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={view === 'table'} onCheckedChange={() => onViewChange('table')}>
                            Table
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={view === 'list'} onCheckedChange={() => onViewChange('list')}>
                            List
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-[1px] h-4 bg-border mx-2" />

                <FilterPopover properties={properties} />
                <SortPopover properties={properties} />
            </div>

            <div className="flex items-center gap-1">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="h-7 w-[160px] pl-7 text-xs bg-secondary/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground ml-2">
                    New
                </Button>
            </div>
        </div>
    )
}
