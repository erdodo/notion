"use client"

import {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
    Undo,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import {
    restoreDocument,
    removeDocument
} from "@/app/(main)/_actions/documents"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { useRouter } from "next/navigation"


interface TrashItemMenuProps {
    data: {
        id: string
        title: string
        [key: string]: any
    }
}

export const TrashItemMenu = ({ data }: TrashItemMenuProps) => {
    const router = useRouter()
    const { closeContextMenu } = useContextMenuStore()

    const { mutate: restore } = useMutation({
        mutationFn: restoreDocument,
        onSuccess: () => {
            toast.success("Restored note")
            router.refresh()
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to restore")
            closeContextMenu()
        }
    })

    const { mutate: remove } = useMutation({
        mutationFn: removeDocument,
        onSuccess: () => {
            toast.success("Note deleted forever")
            router.refresh()
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to delete")
            closeContextMenu()
        }
    })

    const onConfirmDelete = () => {
        // For MVP just standard confirm or just delete
        if (confirm("Are you sure you want to delete this forever?")) {
            remove(data.id)
        }
        closeContextMenu()
    }

    return (
        <>
            <DropdownMenuItem onClick={() => restore(data.id)}>
                <Undo className="h-4 w-4 mr-2" />
                Restore
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onConfirmDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
            </DropdownMenuItem>
        </>
    )
}
