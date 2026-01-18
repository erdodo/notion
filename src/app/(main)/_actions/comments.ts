"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"
import { Comment, Comment as PrismaComment } from "@prisma/client" // Fix import if needed or just use type inference
import { checkPageAccess } from "./sharing"

// ============ COMMENTS ============

// Yorum ekle
export async function addComment(
    pageId: string,
    data: {
        content: string
        parentId?: string
        blockId?: string
        mentionedUserIds?: string[]
    }
) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Erişim kontrolü (en az COMMENTER olmalı)
    const access = await checkPageAccess(pageId)
    if (!access.hasAccess || access.role === "VIEWER") {
        throw new Error("You don't have permission to comment")
    }

    // Yorum oluştur
    const comment = await db.comment.create({
        data: {
            content: data.content,
            pageId,
            userId: session.user.id,
            parentId: data.parentId,
            blockId: data.blockId
        },
        include: {
            user: { select: { id: true, name: true, image: true } },
            replies: true
        }
    })

    // Mention'ları kaydet
    if (data.mentionedUserIds?.length) {
        await db.userMention.createMany({
            data: data.mentionedUserIds.map(userId => ({
                commentId: comment.id,
                userId,
                mentionedBy: session.user.id
            }))
        })

        // Mention bildirimleri
        for (const userId of data.mentionedUserIds) {
            if (userId !== session.user.id) {
                await db.notification.create({
                    data: {
                        userId,
                        type: "MENTION",
                        title: "You were mentioned",
                        message: `${session.user.name} mentioned you in a comment`,
                        pageId,
                        commentId: comment.id,
                        actorId: session.user.id
                    }
                })

                // Real-time
                await pusherServer.trigger(`user-${userId}`, "notification", {
                    type: "MENTION",
                    commentId: comment.id
                })
            }
        }
    }

    // Parent yoruma yanıt ise, sahibine bildir
    if (data.parentId) {
        const parentComment = await db.comment.findUnique({
            where: { id: data.parentId }
        })

        if (parentComment && parentComment.userId !== session.user.id) {
            await db.notification.create({
                data: {
                    userId: parentComment.userId,
                    type: "COMMENT_REPLY",
                    title: "New reply to your comment",
                    message: `${session.user.name} replied to your comment`,
                    pageId,
                    commentId: comment.id,
                    actorId: session.user.id
                }
            })
        }
    }

    // Sayfa sahibine yeni yorum bildirimi
    const page = await db.page.findUnique({ where: { id: pageId } })
    if (page && page.userId !== session.user.id && !data.parentId) {
        await db.notification.create({
            data: {
                userId: page.userId,
                type: "COMMENT_ADDED",
                title: "New comment",
                message: `${session.user.name} commented on "${page.title}"`,
                pageId,
                commentId: comment.id,
                actorId: session.user.id
            }
        })
    }

    // Real-time güncelleme
    await pusherServer.trigger(`page-${pageId}`, "comment-added", {
        comment: {
            ...comment,
            user: { id: session.user.id, name: session.user.name, image: session.user.image }
        }
    })

    revalidatePath(`/documents/${pageId}`)
    return comment
}

// Yorumları listele
export async function getComments(pageId: string) {
    const session = await auth()

    // Erişim kontrolü
    const access = await checkPageAccess(pageId)
    if (!access.hasAccess) {
        throw new Error("Unauthorized")
    }

    const comments = await db.comment.findMany({
        where: {
            pageId,
            parentId: null // Sadece root yorumlar
        },
        include: {
            user: { select: { id: true, name: true, image: true } },
            replies: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                    mentions: {
                        include: {
                            user: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
            mentions: {
                include: {
                    user: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return comments
}

// Blok yorumlarını al
export async function getBlockComments(
    pageId: string,
    blockId: string
) {
    return db.comment.findMany({
        where: { pageId, blockId },
        include: {
            user: { select: { id: true, name: true, image: true } },
            replies: {
                include: {
                    user: { select: { id: true, name: true, image: true } }
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    })
}

// Yorum düzenle
export async function updateComment(
    commentId: string,
    content: string
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const comment = await db.comment.findUnique({
        where: { id: commentId }
    })

    if (!comment || comment.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await db.comment.update({
        where: { id: commentId },
        data: {
            content,
            editedAt: new Date()
        }
    })

    // Real-time güncelleme
    await pusherServer.trigger(`page-${comment.pageId}`, "comment-updated", {
        commentId,
        content
    })

    revalidatePath(`/documents/${comment.pageId}`)
}

// Yorum sil
export async function deleteComment(commentId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const comment = await db.comment.findUnique({
        where: { id: commentId },
        include: { page: true }
    })

    if (!comment) throw new Error("Comment not found")

    // Sadece yorum sahibi veya sayfa sahibi silebilir
    if (comment.userId !== session.user.id && comment.page.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await db.comment.delete({ where: { id: commentId } })

    // Real-time güncelleme
    await pusherServer.trigger(`page-${comment.pageId}`, "comment-deleted", {
        commentId
    })

    revalidatePath(`/documents/${comment.pageId}`)
}

// Yorumu çözümlenmiş olarak işaretle
export async function resolveComment(commentId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const comment = await db.comment.findUnique({
        where: { id: commentId }
    })

    if (!comment) throw new Error("Comment not found")

    await db.comment.update({
        where: { id: commentId },
        data: {
            resolved: true,
            resolvedBy: session.user.id,
            resolvedAt: new Date()
        }
    })

    revalidatePath(`/documents/${comment.pageId}`)
}
