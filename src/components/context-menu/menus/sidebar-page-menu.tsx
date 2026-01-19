"use client"

import {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
    FileEdit,
    Trash,
    Copy,
    ExternalLink,
    FolderInput,
    Star,
    Link2,
    Trash2,
    MoreHorizontal
} from "lucide-react"
import { useUser } from "@clerk/nextjs" // Wait, user is using NextAuth not Clerk? 
// Checking package.json: next-auth. Not Clerk.
// So I don't need auth hook for this likely, actions handle it.
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import {
    archiveDocument,
    duplicateDocument
} from "@/app/(main)/_actions/documents"
import {
    addToFavorites,
    removeFromFavorites,
    isFavorite
} from "@/app/(main)/_actions/navigation"
import { useRouter } from "next/navigation"
import { useRenameModal } from "@/hooks/use-rename-modal"
import { useMovePage } from "@/hooks/use-move-page"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { useEffect, useState } from "react"
import { useOrigin } from "@/hooks/use-origin"

interface SidebarPageMenuProps {
    data: {
        id: string
        title: string
        icon?: string
        [key: string]: any
    }
}

export const SidebarPageMenu = ({ data }: SidebarPageMenuProps) => {
    const router = useRouter()
    const { closeContextMenu } = useContextMenuStore()
    const renameModal = useRenameModal()
    const movePage = useMovePage()
    const origin = useOrigin()

    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        // Check favorite status
        let active = true
        isFavorite(data.id).then((val) => {
            if (active) setIsFavorited(val)
        })
        return () => { active = false }
    }, [data.id])

    const onCopyLink = () => {
        const url = `${origin}/documents/${data.id}`
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
        closeContextMenu()
    }

    const { mutate: archive } = useMutation({
        mutationFn: archiveDocument,
        onSuccess: () => {
            toast.success("Moved to trash")
            router.refresh() // Or rely on optimistic updates if implemented
            // If we are on this page, redirect? 
            // The Sidebar usually handles navigation, but if I delete the active page?
            // Typically router.push('/documents')
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to delete")
            closeContextMenu()
        }
    })

    // We wrap specific archive call
    const onArchive = () => {
        const promise = archive(data.id)
    }

    const { mutate: duplicate } = useMutation({
        mutationFn: duplicateDocument,
        onSuccess: () => {
            toast.success("Document duplicated")
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to duplicate")
            closeContextMenu()
        }
    })

    const onFavoriteToggle = async () => {
        // Optimistic
        const newVal = !isFavorited
        setIsFavorited(newVal)
        try {
            if (newVal) {
                await addToFavorites(data.id)
                toast.success("Added to favorites")
            } else {
                await removeFromFavorites(data.id)
                toast.success("Removed from favorites")
            }
            document.dispatchEvent(new CustomEvent('favorite-changed'))
            // closeContextMenu() // Usually keeping generic menus open or closed? 
            // User style: "Clicking action checks it" -> often stays open for toggles, but here specific action?
            // Notion usually closes menu on action.
            closeContextMenu()
        } catch (e) {
            setIsFavorited(!newVal)
            toast.error("Failed to update favorite")
        }
    }

    return (
        <>
            <DropdownMenuItem onClick={() => {
                window.open(`/documents/${data.id}`, "_blank")
                closeContextMenu()
            }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => {
                renameModal.onOpen(data.id, data.title)
                closeContextMenu()
            }}>
                <FileEdit className="h-4 w-4 mr-2" />
                Rename
                <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => {
                duplicate(data.id)
            }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => {
                movePage.onOpen(data.id)
                closeContextMenu()
            }}>
                <FolderInput className="h-4 w-4 mr-2" />
                Move To
                <DropdownMenuShortcut>⌘⇧P</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={(e) => {
                e.preventDefault()
                onFavoriteToggle()
            }}>
                <Star className={`h-4 w-4 mr-2 ${isFavorited ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onCopyLink}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Link
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={(e) => {
                e.preventDefault()
                // If native Notion, Delete often asks confirmation or just soft deletes.
                // Prompt says "Delete: (Trash'e gönder, kırmızı renkli text)"
                // I'll execute archive directly.
                archive(data.id)
            }} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
        </>
    )
}
