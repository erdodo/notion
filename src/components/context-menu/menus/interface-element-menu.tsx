"use client"

import {
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
    Link2,
    StarOff
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { removeFromFavorites } from "@/app/(main)/_actions/navigation"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { toast } from "sonner"
import { useOrigin } from "@/hooks/use-origin"
import { useRouter } from "next/navigation"

interface InterfaceElementMenuProps {
    data: {
        type: 'favorite' | 'breadcrumb'
        id?: string // Page ID
        url?: string
        [key: string]: any
    }
}

export const InterfaceElementMenu = ({ data }: InterfaceElementMenuProps) => {
    const router = useRouter()
    const origin = useOrigin()
    const { closeContextMenu } = useContextMenuStore()

    const { mutate: removeFavorite } = useMutation({
        mutationFn: () => removeFromFavorites(data.id!),
        onSuccess: () => {
            toast.success("Removed from favorites")
            window.dispatchEvent(new CustomEvent("favorite-changed", { detail: { id: data.id, isFavorite: false } }))
            router.refresh()
            closeContextMenu()
        },
        onError: () => toast.error("Failed to remove favorite")
    })

    const onCopyLink = () => {
        const url = data.url || (data.id ? `${origin}/documents/${data.id}` : "")
        if (url) {
            navigator.clipboard.writeText(url)
            toast.success("Link copied")
        }
        closeContextMenu()
    }

    if (data.type === 'favorite') {
        return (
            <DropdownMenuItem onClick={() => removeFavorite()}>
                <StarOff className="h-4 w-4 mr-2" />
                Remove from Favorites
            </DropdownMenuItem>
        )
    }

    if (data.type === 'breadcrumb') {
        return (
            <DropdownMenuItem onClick={onCopyLink}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Link
            </DropdownMenuItem>
        )
    }

    return null
}
