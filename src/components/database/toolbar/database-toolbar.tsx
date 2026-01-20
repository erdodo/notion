import { Button } from "@/components/ui/button"
import { Filter, ArrowUpDown, MoreHorizontal, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDatabase } from "@/hooks/use-database"
import { FilterPopover } from "./filter-popover"
import { SortPopover } from "./sort-popover"
import { ViewSwitcher } from "./view-switcher"
import { ViewOptions } from "./view-options"
import { ViewSettingsMenu } from "./view-settings-menu"
import { Database, Property, DatabaseView } from "@prisma/client"

interface DatabaseToolbarProps {
    database: Database & { properties: Property[], views?: DatabaseView[] }
}

export function DatabaseToolbar({ database }: DatabaseToolbarProps) {
    const { searchQuery, setSearchQuery } = useDatabase()

    return (
        <div className="flex items-center justify-between px-2 py-3 border-b mb-2 gap-4">
            <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                {/* View Switcher */}
                <ViewSwitcher database={database} />
                <ViewSettingsMenu databaseId={database.id} views={database.views || []} />

                <div className="w-[1px] h-4 bg-border mx-2 shrink-0" />

                <ViewOptions database={database} />

                <div className="w-[1px] h-4 bg-border mx-2 shrink-0" />

                <FilterPopover properties={database.properties} />
                <SortPopover properties={database.properties} />
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="h-7 w-[160px] pl-7 text-xs bg-secondary/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* Removed useless multiple horizontal button */}
                <Button
                    size="sm"
                    className="h-7 text-xs bg-primary text-primary-foreground ml-2"
                    onClick={() => {
                        // TODO: trigger add row for current view
                        // We will implement a global trigger mechanism next.
                        const event = new CustomEvent('database-add-row')
                        window.dispatchEvent(event)
                    }}
                >
                    New
                </Button>
            </div>
        </div>
    )
}
