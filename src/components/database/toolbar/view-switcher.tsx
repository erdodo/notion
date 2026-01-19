import {
    Table,
    LayoutGrid,
    Calendar,
    Columns,
    List,
    Check,
    ChevronsUpDown,
    GanttChartSquare,
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
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface ViewSwitcherProps {
    className?: string
}

const views = [
    {
        value: "table",
        label: "Table",
        icon: Table,
    },
    {
        value: "board",
        label: "Board",
        icon: Columns,
    },
    {
        value: "calendar",
        label: "Calendar",
        icon: Calendar,
    },
    {
        value: "gallery",
        label: "Gallery",
        icon: LayoutGrid,
    },
    {
        value: "list",
        label: "List",
        icon: List,
    },
    {
        value: "timeline",
        label: "Timeline",
        icon: GanttChartSquare,
    },
] as const

export function ViewSwitcher({ className }: ViewSwitcherProps) {
    const { currentView, setCurrentView } = useDatabase()

    const activeView = views.find((view) => view.value === currentView)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    className={cn("w-[140px] justify-between", className)}
                >
                    {activeView ? (
                        <div className="flex items-center gap-2">
                            <activeView.icon className="h-4 w-4" />
                            {activeView.label}
                        </div>
                    ) : (
                        "Select view..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
                <DropdownMenuLabel>Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {views.map((view) => (
                    <DropdownMenuItem
                        key={view.value}
                        onSelect={() => setCurrentView(view.value as any)}
                        className="gap-2"
                    >
                        <view.icon className="h-4 w-4" />
                        {view.label}
                        <Check
                            className={cn(
                                "ml-auto h-4 w-4",
                                currentView === view.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
