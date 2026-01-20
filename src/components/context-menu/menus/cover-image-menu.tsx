"use client"

import {
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    ImageIcon,
    Shuffle,
    Trash,
    Move
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { useEdgeStore } from "@/lib/edgestore"
import { toast } from "sonner"

interface CoverImageMenuProps {
    data: {
        id: string
        url?: string
        [key: string]: any
    }
}

export const CoverImageMenu = ({ data }: CoverImageMenuProps) => {
    const { closeContextMenu } = useContextMenuStore()
    const { edgestore } = useEdgeStore()

    const { mutate: update } = useMutation({
        mutationFn: (url: string) => updateDocument(data.id, { coverImage: url }),
        onSuccess: () => {
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to update cover")
        }
    })

    const onRemove = async () => {
        if (data.url) {
            try {
                await edgestore.coverImages.delete({ url: data.url })
            } catch (e) {
                console.error(e)
            }
        }
        update("") // Clear it
        toast.success("Cover removed")
    }

    const onRandom = () => {
        // Random Unsplash or gradient?
        // Let's use a placeholder service for random
        const randomId = Math.floor(Math.random() * 1000)
        const url = `https://picsum.photos/seed/${randomId}/1200/400`
        update(url)
        toast.success("Random cover applied")
    }

    return (
        <>
            <DropdownMenuItem onClick={() => {
                if (data.onChangeCover) {
                    data.onChangeCover()
                } else {
                    toast.error("Action not available")
                }
                closeContextMenu()
            }}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Change
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => {
                if (data.onReposition) {
                    data.onReposition()
                } else {
                    toast.info("Reposition not available")
                }
                closeContextMenu()
            }}>
                <Move className="h-4 w-4 mr-2" />
                Reposition
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onRemove}>
                <Trash className="h-4 w-4 mr-2" />
                Remove
            </DropdownMenuItem>
        </>
    )
}
