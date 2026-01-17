
import { useState, useEffect } from "react"
import { CellProps } from "./types"

export function UrlCell({ getValue, updateValue, startEditing, stopEditing, isEditing }: CellProps) {
    const initialValue = getValue()
    const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
    const [value, setValue] = useState(val || "")

    useEffect(() => {
        const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
        setValue(val || "")
    }, [initialValue])

    const onBlur = () => {
        stopEditing()
        if (value !== val) {
            updateValue({ value: value })
        }
    }

    return (
        <div className="h-full w-full py-1.5 px-2">
            {value && !isEditing ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block">
                    {value}
                </a>
            ) : (
                <input
                    type="url"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    onFocus={startEditing}
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Empty"
                />
            )}
        </div>
    )
}

// Helper to determine if we are editing? 
// The prop `isEditing` is passed but typically simple inputs handle their own focus state unless we want to control it strictly.
// `startEditing` is called on focus.
// But for URL we want to show Link OR Input.
// We can use a local state for `isFocused` or rely on `isEditing`.
// But `isEditing` comes from global store which ensures only one cell is editing?
// Yes.
function isEditingCheck(isEditing: boolean | undefined) {
    return !!isEditing
}
