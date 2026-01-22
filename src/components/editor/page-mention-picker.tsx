"use client"

import { useState, useEffect } from "react"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { FileText } from "lucide-react"
import { getRecentPages } from "@/app/(main)/_actions/navigation"
import { searchPages } from "@/app/(main)/_actions/documents"
import { useDebounceValue } from "usehooks-ts"

interface PageMentionPickerProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (pageId: string) => void
    position: { top: number; left: number }
    currentPageId?: string
}

interface Page {
    id: string
    title: string
    icon: string | null
    parentId: string | null
}

export function PageMentionPicker({
    isOpen,
    onClose,
    onSelect,
    position,
    currentPageId
}: PageMentionPickerProps) {
    const [query, setQuery] = useState("")
    const [debouncedQuery] = useDebounceValue(query, 500)
    const [results, setResults] = useState<Page[]>([])
    const [loading, setLoading] = useState(false)

    // Search logic
    useEffect(() => {
        // If empty query, show recent
        if (!debouncedQuery) {
            setLoading(true)
            getRecentPages(5)
                .then(pages => setResults(pages.map(p => ({
                    id: p.id,
                    title: p.title,
                    icon: p.icon,
                    parentId: p.parentId
                }))))
                .finally(() => setLoading(false))
            return
        }

        setLoading(true)
        searchPages(debouncedQuery)
            .then(docs => {
                setResults(docs.map(d => ({
                    id: d.id,
                    title: d.title,
                    icon: d.icon,
                    parentId: d.parentId,
                })))
            })
            .finally(() => setLoading(false))
    }, [debouncedQuery, currentPageId])

    const handleSelect = (pageId: string) => {
        onSelect(pageId)
        onClose()
        setQuery("")
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <PopoverAnchor
                style={{
                    position: 'fixed',
                    top: position.top,
                    left: position.left
                }}
            />
            <PopoverContent
                className="w-72 p-0"
                align="start"
                sideOffset={5}
            >
                <Command>

                    <CommandInput
                        placeholder="Search pages..."
                        value={query}
                        onValueChange={setQuery}
                        autoFocus
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? 'Searching...' : 'No pages found'}
                        </CommandEmpty>

                        {!query && results.filter(p => p.id !== currentPageId).length > 0 && (
                            <CommandGroup heading="Recent">
                                {results.filter(p => p.id !== currentPageId).map(page => (
                                    <CommandItem
                                        key={page.id}
                                        onSelect={() => handleSelect(page.id)}
                                        className="flex items-center gap-2"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                                        <span className="truncate">{page.title || 'Untitled'}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {query && results.filter(p => p.id !== currentPageId).map(page => (
                            <CommandItem
                                key={page.id}
                                onSelect={() => handleSelect(page.id)}
                                className="flex items-center gap-2"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="truncate block">{page.title || 'Untitled'}</span>
                                    {/* Show parent info if available? */}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
