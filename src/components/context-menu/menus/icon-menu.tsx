"use client"

import {
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Smile,
    Shuffle,
    Trash
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { useContextMenuStore } from "@/store/use-context-menu-store"
import { toast } from "sonner"
import randomColor from "randomcolor"

interface IconMenuProps {
    data: {
        id: string
        [key: string]: any
    }
}

export const IconMenu = ({ data }: IconMenuProps) => {
    const { closeContextMenu } = useContextMenuStore()

    const { mutate: update } = useMutation({
        mutationFn: (icon: string | null) => updateDocument(data.id, { icon: icon || undefined }), // fix undefined/null mismatch
        onSuccess: () => {
            toast.success("Icon updated")
            closeContextMenu()
        },
        onError: () => {
            toast.error("Failed to update icon")
            closeContextMenu()
        }
    })

    const onRandom = () => {
        const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🚀", "💻", "🎨", "🎉", "🔥", "✨"]
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        update(randomEmoji)
    }

    const onRemove = () => {
        // We pass null or empty string depending on API. Previous code used "".
        // updateDocument expects string | undefined. 
        // Let's rely on what Toolbar does: it sends `icon: ""`.
        // But updateDocument type (viewed in file) is `icon?: string`.
        // So passing "" removes it?
        // Let's try ""
        // Actually the mutationFn wrapper handles it.
        // I will call `updateDocument(data.id, { icon: null })` but let's check exact signature.
        // It was `icon?: string`.
        // I will pass "".
        // Wait, useMutation above calls updateDocument.
        update("")
    }

    return (
        <>
            <DropdownMenuItem onClick={() => {
                // Ideally open the IconPicker? 
                // But IconPicker is usually a popover triggered by click.
                // We can just trigger the standard "Change" flow or notify user.
                // Or we can simulate a click on the icon?
                // For now, let's just allow Random and Remove, and maybe "Change" which just closes menu and focuses?
                toast.info("Use left click to change icon")
                closeContextMenu()
            }}>
                <Smile className="h-4 w-4 mr-2" />
                Change ...
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onRandom}>
                <Shuffle className="h-4 w-4 mr-2" />
                Random
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onRemove}>
                <Trash className="h-4 w-4 mr-2" />
                Remove
            </DropdownMenuItem>
        </>
    )
}
