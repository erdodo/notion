
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
    stopEditing
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

    // Create link to page. rowId is currently the databaseRow ID.
    // The row has a pageId. We usually access it via row.original.pageId or similar.
    // We need to access the row object.
    const pageId = (column.columnDef.meta as any)?.getPageId?.(rowId)
        || rowId // If rowId is pageId? No rowId is databaseRow id.
    // We need access to the full row data.
    // Using `cell.row.original`. But `cell` prop is available.

    // But wait, the prompt says "Row = Page". 
    // DatabaseRow has pageId.
    // We usually construct the cell renderer to have access to `row`.

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
