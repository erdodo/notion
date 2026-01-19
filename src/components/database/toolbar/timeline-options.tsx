import { Database, Property } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"

interface TimelineOptionsProps {
    database: Database & { properties: Property[] }
}

export function TimelineOptions({ database }: TimelineOptionsProps) {
    const {
        timelineDateProperty,
        setTimelineDateProperty,
        timelineScale,
        setTimelineScale
    } = useDatabase()

    const dateProperties = database.properties.filter(p => p.type === 'DATE' || p.type === 'CREATED_TIME' || p.type === 'UPDATED_TIME')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 md:px-2 px-0 gap-1 text-muted-foreground">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden md:inline">Timeline Settings</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Date Property</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={timelineDateProperty || dateProperties[0]?.id || ""}
                    onValueChange={(val) => setTimelineDateProperty(val)}
                >
                    {dateProperties.map(property => (
                        <DropdownMenuRadioItem key={property.id} value={property.id}>
                            {property.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Scale</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={timelineScale} onValueChange={(val) => setTimelineScale(val as any)}>
                    <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">Week</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="month">Month</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="year">Year</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
