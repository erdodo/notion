"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToFavorites, removeFromFavorites, isFavorite } from "@/app/(main)/_actions/navigation"
import { cn } from "@/lib/utils"
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface FavoriteButtonProps {
    pageId: string
    className?: string
}

export function FavoriteButton({ pageId, className }: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        isFavorite(pageId)
            .then(setFavorited)
            .finally(() => setLoading(false))
    }, [pageId])

    const handleToggle = async () => {
        // Optimistic update
        const previousState = favorited
        setFavorited(!favorited)

        try {
            if (previousState) {
                await removeFromFavorites(pageId)
            } else {
                await addToFavorites(pageId)
            }

            // Dispatch event for sidebar to update
            document.dispatchEvent(new CustomEvent('favorite-changed'))
        } catch (error) {
            setFavorited(previousState) // Rollback
        }
    }

    if (loading) return null

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn("h-8 w-8 hover:bg-transparent", className)}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Star
                className={cn(
                    "h-4 w-4 transition-colors",
                    favorited
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-foreground"
                )}
            />
        </Button>
    )
}
