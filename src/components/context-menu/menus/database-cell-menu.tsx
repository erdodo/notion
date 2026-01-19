"use client"

import {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
    Copy,
    Trash,
    CopyPlus,
    Edit2
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { removeDocument, duplicateDocument } from "@/app/(main)/_actions/documents"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DatabaseCellMenuProps {
    data: {
        rowId: string // Page ID
        propertyId: string
        value: any
        [key: string]: any
    }
}

export const DatabaseCellMenu = ({ data }: DatabaseCellMenuProps) => {
    const router = useRouter()
    const { closeContextMenu } = useContextMenuStore()

    const { mutate: remove } = useMutation({
        mutationFn: () => removeDocument(data.rowId),
        onSuccess: () => {
            toast.success("Row moved to trash")
            router.refresh()
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to delete row")
        }
    })

    const { mutate: duplicate } = useMutation({
        mutationFn: () => duplicateDocument(data.rowId),
        onSuccess: () => {
            toast.success("Row duplicated")
            router.refresh()
            closeContextMenu()
        }
    })

    const onCopyContent = () => {
        let text = ""
        if (typeof data.value === 'string') text = data.value
        else if (typeof data.value === 'number') text = String(data.value)
        else if (data.value === null || data.value === undefined) text = ""
        else if (typeof data.value === 'object') text = JSON.stringify(data.value)

        navigator.clipboard.writeText(text)
        toast.success("Cell content copied")
        closeContextMenu()
    }

    const onEditProperty = () => {
        // Trigger local edit logic?
        // Requires signaling the view to open edit drawer/cell
        // We can use a custom event or a store.
        // DatabaseView has `setEditingCell`. 
        // We don't have access to that via simple props here unless using a global store or event.
        // We can emit 'database-edit-cell' event.
        window.dispatchEvent(new CustomEvent('database-edit-cell', {
            detail: { rowId: data.rowId, propertyId: data.propertyId }
        }))
        closeContextMenu()
    }

    return (
        <>
            <DropdownMenuItem onClick={onEditProperty}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Property
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onCopyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => duplicate()}>
                <CopyPlus className="h-4 w-4 mr-2" />
                Duplicate Row
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => remove()} className="text-red-600 focus:text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete Row
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
        </>
    )
}
