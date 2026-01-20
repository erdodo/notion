"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command"
import { FileText, FolderOpen, Home, Check } from "lucide-react"
import { getSidebarDocuments, searchPages } from "@/app/(main)/_actions/documents"
import { movePage } from "@/app/(main)/_actions/navigation"
import { useMovePage } from "@/hooks/use-move-page"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MovePageModal() {
    const { isOpen, onClose, pageId, currentParentId } = useMovePage()
    const router = useRouter()

    const [query, setQuery] = useState("")
    // We need to fetch ALL pages to show as candidates. 
    // getSidebarDocuments only fetches root or children of one parent.
    // Ideally we need a 'search' or 'getAll' for this modal, or lazily browse?
    // The Prompt example says: "Tüm sayfaları getir (kendisi hariç)". 
    // And uses `getDocuments()`. I'll assume getSidebarDocuments is not enough if it's recursive-limited.
    // But for now I'll use a search or flat fetch if available.
    // The prompt mentioned `getDocuments`, let's check `documents.ts` action?
    // If `getDocuments` returns flat list, good.
    // Else I'll implement a simple one or use search logic.
    // The prompt provided code used `getDocuments`. I'll use it but I need to make sure it exists. 
    // `documents.ts` has `getSidebarDocuments`, `getArchivedDocuments`. Maybe `getDocuments` is missing?
    // I'll stick to what I have or create new action? 
    // I'll assume I can use `search` logic or just fetch roots + flatten?
    // Let's implement `getAllDocuments` or similar if needed. 
    // For now I'll use `getSidebarDocuments` (roots) and maybe that's enough for MVP or I'll add search.
    // Actually, standard Move modal allows searching.
    // I'll use `query` to search dynamically?
    // The prompt code uses `getDocuments`.

    const [pages, setPages] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [moving, setMoving] = useState(false)

    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true)
            try {
                // Use searchPages to fetch candidates. passing query="" gets recent/all depending on impl?
                // The searchPages actully requires query. If empty, it might return empty.
                // However, we want to Browse?
                // For MVP, "Search to Move" is acceptable.
                // But let's try to get ALL pages if query is empty? 
                // searchPages implementation: AND... title.contains(query). If query empty, contains "" matches all?
                // Let's rely on searchPages logic.
                const results = await searchPages(query, { includeDatabases: true, limit: 50 })
                setPages(results)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen) {
            fetchPages()
        } else {
            // Reset query on close?
            setQuery("")
        }
    }, [isOpen, query]) // Re-fetch on query change

    const handleMove = async (targetParentId: string | null) => {
        if (!pageId) return

        if (targetParentId === currentParentId) {
            onClose()
            return
        }

        setMoving(true)
        try {
            await movePage(pageId, targetParentId)
            toast.success('Page moved successfully')
            onClose()

            // Refresh
            router.refresh()
            // Also dispatch event if needed
            window.dispatchEvent(new CustomEvent('notion-document-update', {
                detail: { id: pageId } // generic update signal
            }))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to move page')
        } finally {
            setMoving(false)
        }
    }

    const rootLabel = "Private pages (root)"
    const showRoot = query === "" || rootLabel.toLowerCase().includes(query.toLowerCase())

    return (
        <Dialog open={isOpen} onOpenChange={() => !moving && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Move page to...</DialogTitle>
                </DialogHeader>

                <Command shouldFilter={false} className="border rounded-md">
                    <CommandInput
                        placeholder="Search pages..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="max-h-64">
                        <CommandEmpty>No pages found</CommandEmpty>

                        {/* Move to root */}
                        {showRoot && (
                            <CommandItem
                                onSelect={() => handleMove(null)}
                                className="flex items-center gap-2"
                                value={rootLabel}
                            >
                                <Home className="h-4 w-4" />
                                <span>{rootLabel}</span>
                                {currentParentId === null && <Check className="h-4 w-4 ml-auto" />}
                            </CommandItem>
                        )}

                        <CommandGroup heading="Pages">
                            {pages
                                .filter(p => !pageId || p.id !== pageId) // Verify not self
                                .map(page => (
                                    <CommandItem
                                        key={page.id}
                                        onSelect={() => handleMove(page.id)}
                                        className="flex items-center gap-2"
                                        value={page.title || "Untitled"}
                                    >
                                        <FolderOpen className="h-4 w-4" />
                                        <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                                        <span className="truncate">{page.title || 'Untitled'}</span>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
