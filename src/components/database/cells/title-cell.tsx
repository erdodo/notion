
import { useState, useEffect, useRef } from "react"
import { CellProps } from "./types"
import TextareaAutosize from "react-textarea-autosize"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Maximize2 } from "lucide-react"

export function TitleCell({
    getValue,
    rowId,
    column,
    updateValue,
    isEditing,
    startEditing,
    stopEditing,
    row
}: CellProps) {
    const initialValue = getValue()
    // Title value is expected to be a string or object.
    // If object {value: "..."}.
    const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
    const [value, setValue] = useState(val || "")

    useEffect(() => {
        // Sync external value
        const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
        setValue(val || "")
    }, [initialValue])

    const onBlur = () => {
        stopEditing()
        if (value !== val) {
            updateValue({ value: value })
        }
    }

    // Get pageId from the row data
    // row.original is the data object constructed in TableView (id, originalRow, properties...)
    // originalRow is the Prisma DatabaseRow object which contains pageId
    const pageId = row?.original?.originalRow?.pageId || rowId

    return (
        <div className="flex items-center group relative h-full w-full min-h-[32px]">
            <Link
                href={`/documents/${pageId}`}
                className="absolute left-[-20px] opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
            >
                <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </Link>

            {/* Icon */}
            <div className="mr-2 flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
            </div>

            <TextareaAutosize
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onFocus={startEditing}
                className="w-full resize-none bg-transparent outline-none text-sm font-medium"
                minRows={1}
            />
        </div>
    )
}
