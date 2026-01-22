
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent, DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    MoreHorizontal,
    Trash, Copy,
    Layout,
    Eye,
    Filter,
    ArrowUpDown,
    Layers,
    Palette,
    Link,
    Settings,
    Database as DatabaseIcon,
    Zap,
    Lock,
    Check,
    Table,
    Columns,
    Calendar,
    List,
    GanttChartSquare,
    LayoutGrid, X,
    ArrowUp,
    ArrowDown,
    MousePointerClick
} from "lucide-react"
import { useDatabase } from "@/hooks/use-database"
import { deleteDatabaseView, updateDatabaseView, createDatabaseView } from "@/actions/database-view"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Database, DatabaseView, ViewType, Property } from "@prisma/client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DataSourceDialog } from "../data-source-dialog"

interface ViewSettingsMenuProps {
    databaseId: string
    views: DatabaseView[]
    database: Database & { properties: Property[] }
}

const VIEW_ICONS = {
    [ViewType.table]: Table,
    [ViewType.board]: Columns,
    [ViewType.calendar]: Calendar,
    [ViewType.gallery]: LayoutGrid,
    [ViewType.list]: List,
    [ViewType.timeline]: GanttChartSquare,
}

const VIEW_LABELS = {
    [ViewType.table]: "Table",
    [ViewType.board]: "Board",
    [ViewType.calendar]: "Calendar",
    [ViewType.gallery]: "Gallery",
    [ViewType.list]: "List",
    [ViewType.timeline]: "Timeline",
}

export function ViewSettingsMenu({ databaseId, views, database }: ViewSettingsMenuProps) {
    const {
        currentViewId,
        setCurrentViewId,
        updateView,
        filters,
        sorts,
        addFilter,
        addSort,
        removeFilter,
        removeSort,
        groupByProperty,
        setGroupByProperty,
        boardGroupByProperty,
        setBoardGroupByProperty,
        hiddenProperties,
        setHiddenProperties,
        currentView: currentViewType,
        setFromView,
        pageOpenMode,
        setPageOpenMode
    } = useDatabase()
    const router = useRouter()
    const [dataSourceDialogOpen, setDataSourceDialogOpen] = useState(false)

    // Rename Dialog State
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameValue, setRenameValue] = useState("")

    const currentView = views.find(v => v.id === currentViewId) || views[0]

    if (!currentView) {
        // No views at all, render minimal menu
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View settings">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px]">
                    <div className="p-4 text-sm text-muted-foreground">No views available</div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    const handleDelete = async () => {
        if (views.length <= 1) {
            toast.error("Cannot delete the last view")
            return
        }
        try {
            await deleteDatabaseView(currentView.id)
            toast.success("View deleted")
            const otherView = views.find(v => v.id !== currentView.id)
            if (otherView) setCurrentViewId(otherView.id)
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete view")
        }
    }

    const handleDuplicate = async () => {
        try {
            const newName = `${currentView.name} Copy`
            const newView = await createDatabaseView(databaseId, currentView.type, newName)
            await updateDatabaseView(newView.id, {
                filter: currentView.filter as any,
                sort: currentView.sort as any,
                group: currentView.group as any,
                hiddenProperties: currentView.hiddenProperties as any,
                propertyWidths: currentView.propertyWidths as any,
                layout: currentView.layout as any
            })
            setCurrentViewId(newView.id)
            toast.success("View duplicated")
            router.refresh()
        } catch (error) {
            toast.error("Failed to duplicate view")
        }
    }

    const handleRename = async () => {
        try {
            await updateDatabaseView(currentView.id, { name: renameValue })
            setRenameOpen(false)
            toast.success("View renamed")
            router.refresh()
        } catch (error) {
            toast.error("Failed to rename view")
        }
    }

    // Handlers for switching layout
    const handleSwitchLayout = async (type: ViewType) => {
        // We actually want to create a new view or update current?
        // Usually "Layout" in settings changes the CURRENT view's type.
        // Notion allows changing the layout of the current view.
        // But our `createDatabaseView` paradigm suggests views are distinct.
        // However, updating `type` field on a view is possible if schema allows.
        // If not, we might need to strict switch.
        // Let's assume we can update the type.
        // If not, we fall back to creating a new view.
        // For now, let's assume we update the view type.
        // Wait, ViewType is strict in Prisma.
        // Let's check `updateDatabaseView` action signature or Prism schema if possible?
        // Assuming we can update it.
        try {
            await updateDatabaseView(currentView.id, { type })
            // We also need to update local state immediately to reflect change
            // But `updateView` hook might not handle type change if it's derived from `currentViewId` -> `views` list.
            // Router refresh is safest.
            window.location.reload() // Force reload to be safe as type change is major
        } catch (e) {
            toast.error("Failed to change layout")
        }
    }

    const togglePropertyVisibility = (propertyId: string) => {
        const currentHidden = hiddenProperties || []
        const isHidden = currentHidden.includes(propertyId)
        let newHidden
        if (isHidden) {
            newHidden = currentHidden.filter(id => id !== propertyId)
        } else {
            newHidden = [...currentHidden, propertyId]
        }
        // Update view with new hidden properties
        updateView({ hiddenProperties: newHidden })
    }

    const activeGroupBy = currentViewType === 'board' ? boardGroupByProperty : groupByProperty
    const setActiveGroupBy = currentViewType === 'board' ? setBoardGroupByProperty : setGroupByProperty

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View settings">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px]" sideOffset={8}>
                    {/* View Name Header */}
                    <div className="px-2 py-1.5 flex items-center gap-2">
                        <Input
                            value={currentView.name}
                            className="h-8 text-sm font-medium border-transparent hover:border-border focus:border-primary px-2"
                            onChange={(e) => {
                                // Optimistic update
                                // We need a way to update the view name in the list locally without router refresh every char
                                // For now just allow editing and save on blur/enter?
                                // Or use a separate Rename dialog still?
                                // The input in the menu is cleaner.
                                // But simple input might lose focus.
                            }}
                            onBlur={(e) => {
                                updateDatabaseView(currentView.id, { name: e.target.value })
                                router.refresh()
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur()
                                }
                            }}
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => {
                            toast.info(`View ID: ${currentView.id}`)
                        }}>
                            <DatabaseIcon className="h-3 w-3 text-muted-foreground" />
                        </Button>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Layout */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Layout</span>
                            <span className="text-xs text-muted-foreground capitalize">{VIEW_LABELS[currentView.type as ViewType]}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[180px]">
                            {Object.values(ViewType).map((type) => {
                                const Icon = VIEW_ICONS[type]
                                return (
                                    <DropdownMenuItem
                                        key={type}
                                        onSelect={() => handleSwitchLayout(type)}
                                        className="gap-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{VIEW_LABELS[type]}</span>
                                        {currentView.type === type && <Check className="ml-auto h-3 w-3" />}
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Property Visibility */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Property visibility</span>
                            <span className="text-xs text-muted-foreground">{database.properties?.length || 0 - (hiddenProperties?.length || 0)} shown</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[200px]">
                            <DropdownMenuLabel>Properties</DropdownMenuLabel>
                            {database.properties.map(property => (
                                <DropdownMenuCheckboxItem
                                    key={property.id}
                                    checked={!hiddenProperties?.includes(property.id)}
                                    onCheckedChange={() => togglePropertyVisibility(property.id)}
                                >
                                    {property.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Filter */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Filter</span>
                            {filters.length > 0 && <span className="text-xs text-primary">{filters.length} active</span>}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[240px]">
                            <DropdownMenuLabel>Filters</DropdownMenuLabel>
                            {filters.map((filter, index) => {
                                const prop = database.properties.find(p => p.id === filter.propertyId)
                                return (
                                    <DropdownMenuItem key={index} className="flex items-center justify-between group">
                                        <span className="truncate text-xs">{prop?.name} {filter.operator.replace('_', ' ')} {filter.value}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFilter(index)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuItem>
                                )
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">Add filter</DropdownMenuLabel>
                            {database.properties.map(property => (
                                <DropdownMenuItem
                                    key={property.id}
                                    onSelect={() => {
                                        addFilter({
                                            id: crypto.randomUUID(),
                                            propertyId: property.id,
                                            operator: 'is', // default
                                            value: ''
                                        } as any)
                                    }}
                                >
                                    {property.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Sort */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Sort</span>
                            {sorts.length > 0 && <span className="text-xs text-primary">{sorts.length} active</span>}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[240px]">
                            <DropdownMenuLabel>Sorts</DropdownMenuLabel>
                            {sorts.map((sort, index) => {
                                const prop = database.properties.find(p => p.id === sort.propertyId)
                                return (
                                    <DropdownMenuItem key={index} className="flex items-center justify-between group">
                                        <span className="truncate text-xs">{prop?.name} ({sort.direction})</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4"
                                                onClick={(e) => {
                                                    e.stopPropagation() // Prevent menu close? DropdownMenuItem usually closes.
                                                    // We might need to prevent default.
                                                    // use Database updateSort
                                                }}
                                            >
                                                {sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeSort(index)
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </DropdownMenuItem>
                                )
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1">Add sort</DropdownMenuLabel>
                            {database.properties.map(property => (
                                <DropdownMenuItem
                                    key={property.id}
                                    onSelect={() => {
                                        addSort({
                                            id: crypto.randomUUID(),
                                            propertyId: property.id,
                                            direction: 'asc'
                                        })
                                    }}
                                >
                                    {property.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Group */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Group</span>
                            {activeGroupBy && <span className="text-xs text-primary">Active</span>}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[200px]">
                            <DropdownMenuRadioGroup value={activeGroupBy || "none"} onValueChange={(val) => setActiveGroupBy(val === "none" ? null : val)}>
                                <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                                {database.properties.map(property => (
                                    <DropdownMenuRadioItem key={property.id} value={property.id}>
                                        {property.name}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Conditional Color (Placeholder) */}
                    <DropdownMenuItem disabled>
                        <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                        Conditional color
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => {
                        window.navigator.clipboard.writeText(window.location.href)
                        toast.success("Link copied")
                    }}>
                        <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                        Copy link to view
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Data source settings</DropdownMenuLabel>
                    <DropdownMenuItem disabled>
                        <DatabaseIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        Source
                        <span className="ml-auto text-xs text-muted-foreground">New database</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        Edit properties
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                        Automations
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <MoreHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        More settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Open Page In */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <MousePointerClick className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Open page in</span>
                            <span className="text-xs text-muted-foreground capitalize">
                                {pageOpenMode === 'new-tab' ? 'New tab' : pageOpenMode}
                            </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[180px]">
                            <DropdownMenuRadioGroup value={pageOpenMode} onValueChange={(value: any) => setPageOpenMode(value)}>
                                <DropdownMenuRadioItem value="current">
                                    Current tab
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="new-tab">
                                    New tab
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="dialog">
                                    Dialog
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="drawer">
                                    Drawer
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem onSelect={() => setDataSourceDialogOpen(true)}>
                        <DatabaseIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        Manage data sources
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                        Lock database
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onSelect={handleDuplicate}>
                        <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                        Duplicate View
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete View
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DataSourceDialog
                open={dataSourceDialogOpen}
                onOpenChange={setDataSourceDialogOpen}
                currentDatabaseId={databaseId}
            />
        </>
    )
}
