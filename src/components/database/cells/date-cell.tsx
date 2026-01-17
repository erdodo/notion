
import { useState, useEffect } from "react"
import { CellProps } from "./types"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DateCell({ getValue, updateValue }: CellProps) {
    const initialValue = getValue()
    const val = typeof initialValue === 'object' ? initialValue?.value : initialValue

    const [date, setDate] = useState<Date | undefined>(val ? new Date(val) : undefined)

    useEffect(() => {
        const val = typeof initialValue === 'object' ? initialValue?.value : initialValue
        setDate(val ? new Date(val) : undefined)
    }, [initialValue])

    const onSelect = (d: Date | undefined) => {
        setDate(d)
        if (d) {
            updateValue({ value: d.toISOString(), includeTime: false })
        } else {
            updateValue(null)
        }
    }

    return (
        <div className="h-full w-full py-1 px-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"ghost"}
                        className={cn(
                            "w-full justify-start text-left font-normal p-0 h-auto hover:bg-transparent",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
