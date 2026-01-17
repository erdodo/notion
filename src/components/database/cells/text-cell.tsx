
import { useState, useEffect } from "react"
import { CellProps } from "./types"
import TextareaAutosize from "react-textarea-autosize"

export function TextCell({
    getValue,
    updateValue,
    startEditing,
    stopEditing
}: CellProps) {
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
        <div className="h-full w-full py-1.5 px-2 min-h-[32px]">
            <TextareaAutosize
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onFocus={startEditing}
                className="w-full resize-none bg-transparent outline-none text-sm leading-relaxed"
                minRows={1}
                placeholder="Empty"
            />
        </div>
    )
}
