"use client"

import { useCollaboration } from "@/components/providers/collaboration-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


interface PresenceIndicatorsProps {
    pageId?: string // Kept for compatibility, though we use context
    className?: string
}

export const PresenceIndicators = ({ pageId, className }: PresenceIndicatorsProps) => {
    const { activeUsers } = useCollaboration()

    // Limit shown users
    const DISPLAY_LIMIT = 3
    const others = activeUsers.filter(u => true) // Display all? Usually display others. 
    // Context usually provides "activeUsers" including self if we want, OR we can filter self in the context.
    // In Provider I implemented: `if (member.id !== session.user?.email)` -> So `activeUsers` in context ONLY contains OTHERS.

    if (others.length === 0) return null

    const shownUsers = others.slice(0, DISPLAY_LIMIT)
    const remainingCount = others.length - DISPLAY_LIMIT

    return (
        <div className={`flex items-center -space-x-2 ${className || ""}`}>
            <TooltipProvider>
                {shownUsers.map((user, i) => (
                    <Tooltip key={user.email || i}>
                        <TooltipTrigger asChild>
                            <div
                                className="relative inline-block border-2 border-background rounded-full transition-transform hover:-translate-y-1"
                                style={{ zIndex: shownUsers.length - i }}
                            >
                                <Avatar className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback style={{ backgroundColor: user.color }} className="text-white text-[10px]">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user.name} {user.email ? `(${user.email})` : ""}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {remainingCount > 0 && (
                    <div
                        className="relative flex items-center justify-center h-7 w-7 rounded-full bg-muted border-2 border-background text-[10px] font-medium"
                        style={{ zIndex: 0 }}
                    >
                        +{remainingCount}
                    </div>
                )}
            </TooltipProvider>
        </div>
    )
}
