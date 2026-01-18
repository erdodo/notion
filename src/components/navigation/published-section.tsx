"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Globe, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { getPublishedPages } from "@/app/(main)/_actions/navigation"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface Page {
    id: string
    title: string
    icon: string | null
    parentId: string | null
}

interface PublishedSectionProps {
    className?: string
}

export function PublishedSection({ className }: PublishedSectionProps) {
    const [publishedPages, setPublishedPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fetchPublished = () => {
            getPublishedPages()
                .then(setPublishedPages)
                .finally(() => setLoading(false))
        }

        fetchPublished()

        // Listen for generic document updates which might effectively indicate publish changes 
        // if we decide to trigger full reloads. 
        // For now, simpler to just fetch on mount. 
        // A reload is needed to see changes unless we add a specific event which is out of scope for "just displaying list" request unless specified.
    }, [])

    if (loading || publishedPages.length === 0) return null

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn("mb-2", className)}
        >
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2 py-1 h-7 text-muted-foreground hover:text-foreground"
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                        <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    <Globe className="h-4 w-4 mr-2 text-sky-500" />
                    <span className="text-xs font-medium">Published</span>
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="ml-4 space-y-0.5">
                    {publishedPages.map(page => (
                        <Link
                            key={page.id}
                            href={`/documents/${page.id}`}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm group"
                        >
                            <span>{page.icon || <FileText className="h-4 w-4 text-muted-foreground" />}</span>
                            <span className="truncate flex-1">{page.title || 'Untitled'}</span>
                        </Link>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
