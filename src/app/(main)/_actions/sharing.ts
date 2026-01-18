"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { ShareRole, Page, PageShare, User } from "@prisma/client"

// ============ SHARE PERMISSIONS ============

// Sayfayı kullanıcı ile paylaş
export async function sharePage(
    pageId: string,
    data: {
        email: string
        role: ShareRole
        message?: string
    }
): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Sayfa sahibi mi veya admin mi kontrol et
    const page = await db.page.findUnique({
        where: { id: pageId },
        include: { shares: true }
    })

    if (!page) return { success: false, error: "Page not found" }

    const hasPermission =
        page.userId === session.user.id ||
        page.shares.some(s =>
            s.userId === session.user.id && s.role === "ADMIN"
        )

    if (!hasPermission) {
        return { success: false, error: "You don't have permission to share this page" }
    }

    // Kullanıcıyı bul veya email olarak kaydet
    const targetUser = await db.user.findUnique({
        where: { email: data.email }
    })

    // Zaten paylaşılmış mı kontrol et
    const existingShare = await db.pageShare.findFirst({
        where: {
            pageId,
            OR: [
                { email: data.email },
                { userId: targetUser?.id }
            ]
        }
    })

    if (existingShare) {
        // Rolü güncelle
        await db.pageShare.update({
            where: { id: existingShare.id },
            data: { role: data.role }
        })
    } else {
        // Yeni paylaşım oluştur
        await db.pageShare.create({
            data: {
                pageId,
                userId: targetUser?.id,
                email: targetUser ? undefined : data.email,
                role: data.role,
                invitedBy: session.user.id
            }
        })

        // Bildirim oluştur
        if (targetUser) {
            await db.notification.create({
                data: {
                    userId: targetUser.id,
                    type: "PAGE_SHARED",
                    title: "Page shared with you",
                    message: `${session.user.name} shared "${page.title}" with you`,
                    pageId,
                    actorId: session.user.id
                }
            })

            // Real-time bildirim
            await pusherServer.trigger(
                `user-${targetUser.id}`,
                "notification",
                {
                    type: "PAGE_SHARED",
                    pageId,
                    title: page.title,
                    actor: session.user.name
                }
            )
        } else {
            // Email gönder (TODO: email service entegrasyonu)
            console.log(`Send invite invite to ${data.email}`)
        }
    }

    revalidatePath(`/documents/${pageId}`)
    return { success: true }
}

// Paylaşımı kaldır
export async function removeShare(shareId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const share = await db.pageShare.findUnique({
        where: { id: shareId },
        include: { page: true }
    })

    if (!share) throw new Error("Share not found")

    // Sadece sayfa sahibi veya admin kaldırabilir
    const hasPermission =
        share.page.userId === session.user.id ||
        share.invitedBy === session.user.id

    if (!hasPermission) throw new Error("Unauthorized")

    await db.pageShare.delete({ where: { id: shareId } })

    revalidatePath(`/documents/${share.pageId}`)
}

// Paylaşım rolünü güncelle
export async function updateShareRole(
    shareId: string,
    role: ShareRole
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db.pageShare.update({
        where: { id: shareId },
        data: { role }
    })

    revalidatePath('/documents')
}

// Misafir linki oluştur
export async function createGuestLink(
    pageId: string,
    options: {
        role?: ShareRole
        expiresIn?: number // hours
    } = {}
): Promise<string> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const { role = "VIEWER", expiresIn } = options

    const token = nanoid(32)
    const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 60 * 60 * 1000)
        : undefined

    await db.pageShare.create({
        data: {
            pageId,
            role,
            token,
            tokenExpiresAt: expiresAt,
            invitedBy: session.user.id
        }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/share/${token}`
}

// Paylaşılan sayfaları listele
// Extend Page type to include relationship fields we need for the return type
export async function getSharedPages(): Promise<(Page & { shareRole: ShareRole; sharedBy: User })[]> {
    const session = await auth()
    if (!session?.user?.id) return []

    const shares = await db.pageShare.findMany({
        where: {
            OR: [
                { userId: session.user.id },
                { email: session.user.email }
            ]
        },
        include: {
            page: {
                include: {
                    user: true
                }
            },
            invitedByUser: true
        }
    })

    // shares.filter(s => !s.page.isArchived) returns an array of shares with page included.
    // We map this to Page & { shareRole, sharedBy }.
    return shares
        .filter(s => !s.page.isArchived)
        .map(s => ({
            ...s.page,
            shareRole: s.role,
            sharedBy: s.invitedByUser
        }))
}

// Sayfa için paylaşımları listele
export async function getPageShares(pageId: string): Promise<(PageShare & { user: User | null })[]> {
    const session = await auth()
    if (!session?.user?.id) return []

    return db.pageShare.findMany({
        where: { pageId },
        include: {
            user: true
        }
    })
}

// Sayfa erişim kontrolü
export async function checkPageAccess(
    pageId: string
): Promise<{
    hasAccess: boolean
    role: ShareRole | "OWNER" | null
    isOwner: boolean
}> {
    const session = await auth()

    const page = await db.page.findUnique({
        where: { id: pageId },
        include: {
            shares: {
                where: session?.user?.id ? {
                    OR: [
                        { userId: session.user.id },
                        { email: session.user.email }
                    ]
                } : undefined
            }
        }
    })

    if (!page) return { hasAccess: false, role: null, isOwner: false }

    // Public sayfa
    if (page.isPublished) {
        return { hasAccess: true, role: "VIEWER", isOwner: false }
    }

    if (!session?.user?.id) {
        return { hasAccess: false, role: null, isOwner: false }
    }

    // Sayfa sahibi
    if (page.userId === session.user.id) {
        return { hasAccess: true, role: "OWNER", isOwner: true }
    }

    // Paylaşım kontrolü
    const share = page.shares[0]
    if (share) {
        return { hasAccess: true, role: share.role, isOwner: false }
    }

    return { hasAccess: false, role: null, isOwner: false }
}
