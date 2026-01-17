
import { useState, useEffect } from "react"
import { CellProps } from "./types"
import { Checkbox } from "@/components/ui/checkbox"

export function CheckboxCell({ getValue, updateValue }: CellProps) {
    const initialValue = getValue()
    const val = typeof initialValue === 'object' ? initialValue?.value : (initialValue === true)

    // Handle if value is stored as boolean natively or inside value object

    const [checked, setChecked] = useState(!!val)

    useEffect(() => {
        const val = typeof initialValue === 'object' ? initialValue?.value : (initialValue === true)
        setChecked(!!val)
    }, [initialValue])

    const onChange = (v: boolean) => {
        setChecked(v)
        updateValue({ value: v })
    }

    return (
        <div className="flex h-full w-full items-center justify-center py-1.5">
            <Checkbox
                checked={checked}
                onCheckedChange={onChange}
            />
        </div>
    )
}
