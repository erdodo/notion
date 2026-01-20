import {
    Table,
    LayoutGrid,
    Calendar,
    Columns,
    List,
    Check,
    ChevronsUpDown,
    GanttChartSquare,
    Plus,
} from "lucide-react"
import { useDatabase } from "@/hooks/use-database"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Database, DatabaseView, ViewType } from "@prisma/client"
import { createDatabaseView, setDatabaseDefaultView } from "@/actions/database-view"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ViewSwitcherProps {
    className?: string
    database: Database & { views?: DatabaseView[] }
}

const VIEW_ICONS = {
    [ViewType.TABLE]: Table,
    [ViewType.BOARD]: Columns,
    [ViewType.CALENDAR]: Calendar,
    [ViewType.GALLERY]: LayoutGrid,
    [ViewType.LIST]: List,
    [ViewType.TIMELINE]: GanttChartSquare,
}

const VIEW_LABELS = {
    [ViewType.TABLE]: "Table",
    [ViewType.BOARD]: "Board",
    [ViewType.CALENDAR]: "Calendar",
    [ViewType.GALLERY]: "Gallery",
    [ViewType.LIST]: "List",
    [ViewType.TIMELINE]: "Timeline",
}

export function ViewSwitcher({ className, database }: ViewSwitcherProps) {
    const { currentViewId, setCurrentViewId, setFromView } = useDatabase()
    const router = useRouter()

    // Fallback if no views (shouldn't happen with updated backend)
    const views = database.views || []

    const activeView = views.find((view) => view.id === currentViewId) || views[0]

    const handleCreateView = async (type: ViewType) => {
        const name = `${VIEW_LABELS[type]}` // Simple default name "Board", "Table" etc.

        try {
            const newView = await createDatabaseView(database.id, type, name)
            setCurrentViewId(newView.id)
            toast.success("View created")
            router.refresh()
        } catch (error) {
            toast.error("Failed to create view")
        }
    }

    const ActiveIcon = activeView ? VIEW_ICONS[activeView.type] : Table

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    className={cn("w-[140px] justify-between h-7 text-sm px-2 font-medium", className)}
                >
                    {activeView ? (
                        <div className="flex items-center gap-2 truncate">
                            <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{activeView.name}</span>
                        </div>
                    ) : (
                        "Select view..."
                    )}
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                    {database.views?.length} views
                </DropdownMenuLabel>

                {views.map((view) => {
                    const Icon = VIEW_ICONS[view.type]
                    return (
                        <DropdownMenuItem
                            key={view.id}
                            onSelect={() => {
                                // Optimistic update: Immediate UI switch
                                setFromView({ ...view, database })
                                // Server persistence
                                setDatabaseDefaultView(database.id, view.id)
                            }}
                            className="gap-2 text-sm"
                        >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate flex-1">{view.name}</span>
                            {currentViewId === view.id && (
                                <Check className="h-3 w-3 ml-auto opacity-100" />
                            )}
                        </DropdownMenuItem>
                    )
                })}

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Add view</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="width-[180px]">
                        {Object.values(ViewType).map((type) => {
                            const Icon = VIEW_ICONS[type]
                            return (
                                <DropdownMenuItem
                                    key={type}
                                    className="gap-2"
                                    onSelect={() => handleCreateView(type)}
                                >
                                    <Icon className="h-4 w-4" />
                                    {VIEW_LABELS[type]}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
