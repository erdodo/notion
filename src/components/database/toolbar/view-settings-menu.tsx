
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, Type, Copy } from "lucide-react"
import { useDatabase } from "@/hooks/use-database"
import { deleteDatabaseView, updateDatabaseView, createDatabaseView } from "@/actions/database-view"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DatabaseView, ViewType } from "@prisma/client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ViewSettingsMenuProps {
    databaseId: string
    views: DatabaseView[]
}

export function ViewSettingsMenu({ databaseId, views }: ViewSettingsMenuProps) {
    const { currentViewId, setCurrentViewId } = useDatabase()
    const router = useRouter()

    // Rename Dialog State
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameValue, setRenameValue] = useState("")

    const currentView = views.find(v => v.id === currentViewId)

    if (!currentView) return null

    const handleDelete = async () => {
        if (views.length <= 1) {
            toast.error("Cannot delete the last view")
            return
        }
        try {
            await deleteDatabaseView(currentView.id)
            toast.success("View deleted")
            // Switch to another view (store update will happen via effect when props change?)
            // Actually server revalidate will refresh page. 
            // We should pick a new ID to prevent UI flicker or "View not found" error.
            const otherView = views.find(v => v.id !== currentView.id)
            if (otherView) setCurrentViewId(otherView.id)

            router.refresh()
        } catch (error) {
            toast.error("Failed to delete view")
        }
    }

    const handleDuplicate = async () => {
        try {
            // Create a new view with same type
            const newName = `${currentView.name} Copy`
            const newView = await createDatabaseView(databaseId, currentView.type, newName)

            // Copy config
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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>View Options</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => {
                        setRenameValue(currentView.name)
                        setRenameOpen(true)
                    }}>
                        <Type className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete View
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename View</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
