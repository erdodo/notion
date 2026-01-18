"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { getFavorites } from "@/app/(main)/_actions/navigation"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface Page {
    id: string
    title: string
    icon: string | null
    parentId: string | null
}

interface FavoritesSectionProps {
    className?: string
}

export function FavoritesSection({ className }: FavoritesSectionProps) {
    const [favorites, setFavorites] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(true)

    // Custom event listener for updates
    useEffect(() => {
        const fetchFavorites = () => {
            getFavorites()
                .then(setFavorites)
                .finally(() => setLoading(false))
        }

        fetchFavorites()

        const handleFavoriteChange = () => {
            fetchFavorites()
        }

        document.addEventListener('favorite-changed', handleFavoriteChange)
        return () => document.removeEventListener('favorite-changed', handleFavoriteChange)
    }, [])

    if (loading || favorites.length === 0) return null

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
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="text-xs font-medium">Favorites</span>
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="ml-4 space-y-0.5">
                    {favorites.map(page => (
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
