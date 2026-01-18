"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ============ FAVORITES ============

// Favorilere ekle
export async function addToFavorites(pageId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db.favorite.create({
        data: {
            userId: session.user.id,
            pageId
        }
    })

    revalidatePath('/documents')
}

// Favorilerden çıkar
export async function removeFromFavorites(pageId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db.favorite.delete({
        where: {
            userId_pageId: {
                userId: session.user.id,
                pageId
            }
        }
    })

    revalidatePath('/documents')
}

// Favorileri getir
export async function getFavorites() {
    const session = await auth()
    if (!session?.user?.id) return []

    const favorites = await db.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            page: {
                select: {
                    id: true,
                    title: true,
                    icon: true,
                    isArchived: true,
                    parentId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return favorites
        .filter(f => !f.page.isArchived)
        .map(f => f.page)
}

// Favorilerde mi kontrol et
export async function isFavorite(pageId: string): Promise<boolean> {
    const session = await auth()
    if (!session?.user?.id) return false

    const favorite = await db.favorite.findUnique({
        where: {
            userId_pageId: {
                userId: session.user.id,
                pageId
            }
        }
    })

    return !!favorite
}

// ============ PUBLISHED PAGES ============

// Yayınlanan sayfaları getir
export async function getPublishedPages() {
    const session = await auth()
    if (!session?.user?.id) return []

    const publishedPages = await db.page.findMany({
        where: {
            userId: session.user.id,
            isPublished: true,
            isArchived: false
        },
        select: {
            id: true,
            title: true,
            icon: true,
            parentId: true
        },
        orderBy: { updatedAt: 'desc' }
    })

    return publishedPages
}


// ============ RECENT PAGES ============

// Sayfa ziyaretini kaydet
export async function recordPageView(pageId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) return

    await db.pageView.upsert({
        where: {
            userId_pageId: {
                userId: session.user.id,
                pageId
            }
        },
        update: {
            viewedAt: new Date()
        },
        create: {
            userId: session.user.id,
            pageId
        }
    })
}

// Son ziyaret edilen sayfaları getir
export async function getRecentPages(limit: number = 10) {
    const session = await auth()
    if (!session?.user?.id) return []

    const recentViews = await db.pageView.findMany({
        where: {
            userId: session.user.id,
            page: {
                isArchived: false
            }
        },
        include: {
            page: {
                select: {
                    id: true,
                    title: true,
                    icon: true,
                    parentId: true,
                    _count: { select: { children: true } }
                }
            }
        },
        orderBy: { viewedAt: 'desc' },
        take: limit
    })

    return recentViews.map(v => v.page)
}

// ============ BREADCRUMBS ============

interface BreadcrumbItem {
    id: string
    title: string
    icon: string | null
}

// Sayfa yolunu getir (root'tan bu sayfaya)
export async function getPageBreadcrumbs(pageId: string): Promise<BreadcrumbItem[]> {
    const session = await auth()
    if (!session?.user?.id) return []

    const breadcrumbs: BreadcrumbItem[] = []
    let currentId: string | null = pageId

    // Maximum 10 seviye (sonsuz döngü koruması)
    let depth = 0
    while (currentId && depth < 10) {
        const page: { id: string; title: string; icon: string | null; parentId: string | null } | null = await db.page.findUnique({
            where: { id: currentId },
            select: {
                id: true,
                title: true,
                icon: true,
                parentId: true
            }
        })

        if (!page) break

        breadcrumbs.unshift({
            id: page.id,
            title: page.title,
            icon: page.icon
        })

        currentId = page.parentId
        depth++
    }

    return breadcrumbs
}

// ============ PAGE LINKS (Backlinks için) ============

// Sayfa linki oluştur
export async function createPageLink(
    sourcePageId: string,
    targetPageId: string
): Promise<void> {
    await db.pageLink.upsert({
        where: {
            sourcePageId_targetPageId: {
                sourcePageId,
                targetPageId
            }
        },
        update: {},
        create: {
            sourcePageId,
            targetPageId
        }
    })
}

// Sayfa linkini sil
export async function removePageLink(
    sourcePageId: string,
    targetPageId: string
): Promise<void> {
    await db.pageLink.delete({
        where: {
            sourcePageId_targetPageId: {
                sourcePageId,
                targetPageId
            }
        }
    }).catch(() => { }) // Link yoksa hata verme
}

interface BacklinkItem {
    pageId: string
    title: string
    icon: string | null
    context?: string
}

// Content'ten mention context'ini çıkar
function extractMentionContext(content: string | null, targetPageId: string): string | undefined {
    if (!content) return undefined

    try {
        const blocks = JSON.parse(content)
        // PageMention block'u bul ve çevresindeki text'i döndür
        // Simple implementation for now - just returns first occurrence roughly
        // Real implementation would parse block structure more deeply
        return undefined
    } catch {
        return undefined
    }
}

// Sayfanın backlink'lerini getir (bu sayfaya link veren sayfalar)
export async function getBacklinks(pageId: string): Promise<BacklinkItem[]> {
    const session = await auth()
    if (!session?.user?.id) return []

    const links = await db.pageLink.findMany({
        where: {
            targetPageId: pageId,
            sourcePage: {
                userId: session.user.id,
                isArchived: false
            }
        },
        include: {
            sourcePage: {
                select: {
                    id: true,
                    title: true,
                    icon: true,
                    content: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return links.map(link => ({
        pageId: link.sourcePage.id,
        title: link.sourcePage.title,
        icon: link.sourcePage.icon,
        // İçerikten mention'ın context'ini çıkar (opsiyonel)
        context: extractMentionContext(link.sourcePage.content, pageId)
    }))
}

// ============ PAGE REORDERING ============

// Sayfa sırasını güncelle
export async function updatePageOrder(
    pageId: string,
    newOrder: number,
    newParentId: string | null
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Sayfa sahibini kontrol et
    const page = await db.page.findUnique({
        where: { id: pageId, userId: session.user.id }
    })

    if (!page) throw new Error("Page not found")

    // Parent değiştiyse
    const parentChanged = page.parentId !== newParentId

    await db.$transaction(async (tx) => {
        // Eski parent'taki sıralamayı güncelle
        if (parentChanged) {
            await tx.page.updateMany({
                where: {
                    parentId: page.parentId,
                    order: { gt: page.order }
                },
                data: {
                    order: { decrement: 1 }
                }
            })
        }

        // Yeni parent'taki sıralamayı güncelle
        await tx.page.updateMany({
            where: {
                parentId: newParentId,
                order: { gte: newOrder }
            },
            data: {
                order: { increment: 1 }
            }
        })

        // Sayfayı güncelle
        await tx.page.update({
            where: { id: pageId },
            data: {
                parentId: newParentId,
                order: newOrder
            }
        })
    })

    revalidatePath('/documents')
}

// Birden fazla sayfanın sırasını güncelle (bulk)
export async function reorderPages(
    parentId: string | null,
    orderedPageIds: string[]
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db.$transaction(
        orderedPageIds.map((pageId, index) =>
            db.page.update({
                where: { id: pageId, userId: session.user.id },
                data: { order: index }
            })
        )
    )

    revalidatePath('/documents')
}

// Sayfayı başka parent'a taşı
export async function movePage(
    pageId: string,
    newParentId: string | null
): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Kendi kendine parent olamaz
    if (pageId === newParentId) {
        throw new Error("Cannot move page to itself")
    }

    // Circular dependency kontrolü
    if (newParentId) {
        let currentId: string | null = newParentId
        while (currentId) {
            if (currentId === pageId) {
                throw new Error("Cannot create circular reference")
            }
            const parent: { parentId: string | null } | null = await db.page.findUnique({
                where: { id: currentId },
                select: { parentId: true }
            })
            currentId = parent?.parentId || null
        }
    }

    // Yeni parent'ta son sıraya ekle
    const maxOrder = await db.page.aggregate({
        where: { parentId: newParentId, userId: session.user.id },
        _max: { order: true }
    })

    await db.page.update({
        where: { id: pageId, userId: session.user.id },
        data: {
            parentId: newParentId,
            order: (maxOrder._max.order ?? -1) + 1
        }
    })

    revalidatePath('/documents')
}
