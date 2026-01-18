
import { CellProps } from "./types"
import { format } from "date-fns"

export function CreatedTimeCell({ row }: CellProps) {
    // Access originalRow from the TableView data structure
    const value = row?.original?.originalRow?.createdAt

    if (!value) return <div className="text-xs text-muted-foreground pl-2 h-full flex items-center">-</div>

    try {
        return (
            <div className="px-2 h-full flex items-center text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(value), "MMM d, yyyy HH:mm")}
            </div>
        )
    } catch (e) {
        return <div className="px-2 h-full flex items-center text-sm">-</div>
    }
}

export function UpdatedTimeCell({ row }: CellProps) {
    const value = row?.original?.originalRow?.updatedAt

    if (!value) return <div className="text-xs text-muted-foreground pl-2 h-full flex items-center">-</div>
    try {
        return (
            <div className="px-2 h-full flex items-center text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(value), "MMM d, yyyy HH:mm")}
            </div>
        )
    } catch (e) {
        return <div className="px-2 h-full flex items-center text-sm">-</div>
    }
}
