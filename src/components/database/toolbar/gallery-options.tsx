"use client"

import { Database, Property } from "@prisma/client"
import { useDatabase } from "@/hooks/use-database"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"

interface GalleryOptionsProps {
    database: Database & { properties: Property[] }
}

export function GalleryOptions({ database }: GalleryOptionsProps) {
    // TODO: Implement actual gallery options

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Options
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Gallery Options</h4>
                    <p className="text-sm text-muted-foreground">
                        Configure gallery card size and cover.
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    )
}
