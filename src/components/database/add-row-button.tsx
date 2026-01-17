
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addRow } from "@/app/(main)/_actions/database"

interface AddRowButtonProps {
    databaseId: string
    onAdd?: () => void
}

export function AddRowButton({ databaseId, onAdd }: AddRowButtonProps) {
    const [loading, setLoading] = useState(false)

    const onClick = async () => {
        setLoading(true)
        try {
            await addRow(databaseId)
            onAdd?.()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="flex items-center text-muted-foreground hover:bg-muted/50 cursor-pointer p-2 border-t mt-1 text-sm select-none"
            onClick={onClick}
        >
            <Plus className="h-4 w-4 mr-2" />
            New
        </div>
    )
}
