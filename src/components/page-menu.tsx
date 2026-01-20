"use client"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, History, Trash, Undo } from "lucide-react"
import { useHistory } from "@/hooks/use-history"
import { removeDocument, archiveDocument } from "@/app/(main)/_actions/documents"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


interface PageMenuProps {
    documentId: string
    isArchived: boolean
    onRemove?: () => void
}

export const PageMenu = ({ documentId, isArchived }: PageMenuProps) => {
    const history = useHistory()
    const router = useRouter()

    const onArchive = async () => {
        const promise = archiveDocument(documentId)
        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Moved to trash!",
            error: "Failed to archive."
        })
    }

    // Note: Delete functionality might be complex if not implemented in detail, 
    // but we can add the History button here.

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem onClick={() => history.onOpen(documentId)}>
                    <History className="h-4 w-4 mr-2" />
                    Page History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onArchive} className="text-red-600 focus:text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
                <div className="text-xs text-muted-foreground p-2">
                    Last edited just now
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
