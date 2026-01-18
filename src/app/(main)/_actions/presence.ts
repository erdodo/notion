"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { UserPresence } from "@prisma/client"

// Presence güncelle
export async function updatePresence(
    pageId: string,
    cursorPosition?: { blockId: string; offset: number }
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) return

    // Upsert presence (assuming DB is used, otherwise just Pusher)
    // We use DB for initial load too
    await db.userPresence.upsert({
        where: {
            userId_pageId: {
                userId: session.user.id,
                pageId
            }
        },
        update: {
            status: "ONLINE",
            lastSeen: new Date(),
            cursorPosition: cursorPosition || undefined
        },
        create: {
            userId: session.user.id,
            pageId,
            status: "ONLINE",
            cursorPosition: cursorPosition || undefined
        }
    })

    // Real-time broadcast
    await pusherServer.trigger(`page-${pageId}`, "presence-update", {
        userId: session.user.id,
        userName: session.user.name,
        userImage: session.user.image,
        cursorPosition,
        status: "ONLINE"
    })
}

// Sayfadan ayrıl
export async function leavePresence(pageId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) return

    await db.userPresence.updateMany({
        where: {
            userId: session.user.id,
            pageId
        },
        data: {
            status: "OFFLINE",
            lastSeen: new Date()
        }
    })

    // Real-time broadcast
    await pusherServer.trigger(`page-${pageId}`, "presence-leave", {
        userId: session.user.id
    })
}

// Sayfadaki aktif kullanıcıları al
export async function getPagePresence(pageId: string): Promise<UserPresence[]> { // Returns slightly complex type in practice, simplified here.
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    return db.userPresence.findMany({
        where: {
            pageId,
            lastSeen: { gt: fiveMinutesAgo },
            status: { not: "OFFLINE" }
        },
        include: {
            user: {
                select: { id: true, name: true, image: true }
            }
        }
    }) as unknown as UserPresence[]
}
