"use client"

import { useState, useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, MessageSquare, AtSign, Share2, Check } from "lucide-react"
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "@/app/(main)/_actions/notifications"
import { pusherClient } from "@/lib/pusher"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// Define Notification type if not global, usually from @prisma/client
import type { Notification } from "@prisma/client"

export function NotificationsDropdown() {
    const { data: session } = useSession()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // İlk yükleme
    useEffect(() => {
        loadNotifications()
        loadUnreadCount()
    }, [])

    // Real-time bildirimler
    useEffect(() => {
        if (!session?.user?.id) return

        const channel = pusherClient.subscribe(`user-${session.user.id}`)

        channel.bind("notification", (data: any) => {
            loadNotifications()
            setUnreadCount(prev => prev + 1)
        })

        return () => {
            pusherClient.unsubscribe(`user-${session.user.id}`)
        }
    }, [session?.user?.id])

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const data = await getNotifications({ limit: 20 })
            setNotifications(data as any[]) // Type assertion because include relations
        } finally {
            setLoading(false)
        }
    }

    const loadUnreadCount = async () => {
        const count = await getUnreadCount()
        setUnreadCount(count)
    }

    const handleClick = async (notification: Notification & { pageId: string | null }) => {
        if (!notification.read) {
            await markAsRead(notification.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            )
        }

        if (notification.pageId) {
            router.push(`/documents/${notification.pageId}`)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "COMMENT_ADDED":
            case "COMMENT_REPLY":
                return <MessageSquare className="h-4 w-4" />
            case "MENTION":
                return <AtSign className="h-4 w-4" />
            case "PAGE_SHARED":
                return <Share2 className="h-4 w-4" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-1 px-2 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-80">
                    {loading ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification: any) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 cursor-pointer my-1",
                                    !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                                )}
                                onClick={() => handleClick(notification)}
                            >
                                <div className={cn(
                                    "p-2 rounded-full shrink-0",
                                    !notification.read ? "bg-blue-100 text-blue-600 dark:bg-blue-900" : "bg-muted"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none mb-1">{notification.title}</p>
                                    {notification.message && (
                                        <p className="text-xs text-muted-foreground truncate mb-1">
                                            {notification.message}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                            addSuffix: true
                                        })}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
