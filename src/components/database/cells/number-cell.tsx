
import { useState, useEffect } from "react"
import { CellProps } from "./types"

export function NumberCell({ getValue, updateValue, startEditing, stopEditing }: CellProps) {
    const initialValue = getValue()
    const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
    const [value, setValue] = useState(val || "")

    useEffect(() => {
        const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
        setValue(val || "")
    }, [initialValue])

    const onBlur = () => {
        stopEditing()
        // Parse number?
        if (value !== val) {
            updateValue({ value: value === "" ? null : Number(value) })
        }
    }

    return (
        <div className="h-full w-full py-1.5 px-2">
            <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onFocus={startEditing}
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Empty"
            />
        </div>
    )
}
