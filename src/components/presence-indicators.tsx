"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { pusherClient } from "@/lib/pusher"
import { getPagePresence, updatePresence, leavePresence } from "@/app/(main)/_actions/presence"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface PresenceIndicatorsProps {
    pageId: string
    className?: string
}

interface ActiveUser {
    id: string
    name: string
    image: string | null
    cursorPosition?: { blockId: string; offset: number }
}

export function PresenceIndicators({ pageId, className }: PresenceIndicatorsProps) {
    const { data: session } = useSession()
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])

    // Presence yükle ve güncelle
    useEffect(() => {
        if (!session?.user?.id) return

        // İlk yükleme
        getPagePresence(pageId).then(presence => {
            setActiveUsers(
                presence
                    .filter(p => p.userId !== session.user.id)
                    .map((p: any) => ({
                        id: p.user.id,
                        name: p.user.name || 'Unknown',
                        image: p.user.image,
                        cursorPosition: p.cursorPosition as any
                    }))
            )
        })

        // Kendi presence'ımızı kaydet
        updatePresence(pageId)

        // Periyodik güncelleme
        const interval = setInterval(() => {
            updatePresence(pageId)
        }, 30000) // 30 saniyede bir

        // Sayfadan ayrılınca
        return () => {
            clearInterval(interval)
            leavePresence(pageId)
        }
    }, [pageId, session?.user?.id])

    // Real-time presence güncellemeleri
    useEffect(() => {
        const channel = pusherClient.subscribe(`page-${pageId}`)

        channel.bind("presence-update", (data: any) => {
            if (data.userId === session?.user?.id) return

            setActiveUsers(prev => {
                const existing = prev.find(u => u.id === data.userId)
                if (existing) {
                    return prev.map(u =>
                        u.id === data.userId
                            ? { ...u, cursorPosition: data.cursorPosition }
                            : u
                    )
                }
                return [...prev, {
                    id: data.userId,
                    name: data.userName,
                    image: data.userImage,
                    cursorPosition: data.cursorPosition
                }]
            })
        })

        channel.bind("presence-leave", (data: any) => {
            setActiveUsers(prev => prev.filter(u => u.id !== data.userId))
        })

        return () => {
            pusherClient.unsubscribe(`page-${pageId}`)
        }
    }, [pageId, session?.user?.id])

    if (activeUsers.length === 0) return null

    // Renk paleti - her kullanıcıya tutarlı renk
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-orange-500",
        "bg-cyan-500"
    ]

    const getColorForUser = (userId: string) => {
        const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[index % colors.length]
    }

    return (
        <TooltipProvider>
            <div className={cn("flex items-center -space-x-2", className)}>
                {activeUsers.slice(0, 5).map(user => (
                    <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                            <div className="relative cursor-pointer transition-transform hover:z-10 hover:scale-105">
                                <Avatar className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback className={cn("text-white text-[10px]", getColorForUser(user.id))}>
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Online indicator */}
                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user.name}</p>
                            <p className="text-xs text-muted-foreground">Viewing this page</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {activeUsers.length > 5 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background cursor-pointer hover:z-10">
                                +{activeUsers.length - 5}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{activeUsers.length - 5} more viewing</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    )
}
