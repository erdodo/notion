import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addComment, getComments, updateComment, deleteComment } from '@/app/(main)/_actions/comments'
import { getNotifications, markAsRead, markAllAsRead } from '@/app/(main)/_actions/notifications'
import { sharePage, removeShare, checkPageAccess } from '@/app/(main)/_actions/sharing'
import { searchUsers } from '@/app/(main)/_actions/users'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
// import { pusherServer } from '@/lib/pusher'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/db', () => ({
    db: {
        comment: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        userMention: {
            createMany: vi.fn(),
        },
        notification: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            count: vi.fn(),
        },
        page: {
            findUnique: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
        pageShare: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

vi.mock('@/lib/pusher', () => ({
    pusherServer: {
        trigger: vi.fn()
    }
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Server Actions - Batch 4', () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    const mockSession = { user: mockUser }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue(mockSession as any)
    })

    describe('Comments Actions', () => {
        it('addComment should create a comment and trigger pusher', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({ id: 'page-1', userId: 'user-1', isPublished: false, shares: [] } as any)
            vi.mocked(db.pageShare.findFirst).mockResolvedValue(null)
            vi.mocked(db.comment.create).mockResolvedValue({ id: 'comment-1', content: 'Hello' } as any)

            const result = await addComment('page-1', { content: 'Hello' })

            expect(db.comment.create).toHaveBeenCalled()
            expect(pusherServer.trigger).toHaveBeenCalledWith('page-page-1', 'comment-added', expect.any(Object))
            expect(result.id).toBe('comment-1')
        })

        it('getComments should return root comments with replies', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({ id: 'page-1', userId: 'user-1' } as any)
            vi.mocked(db.comment.findMany).mockResolvedValue([{ id: 'c1', content: 'Root' }] as any)

            const result = await getComments('page-1')
            expect(result).toHaveLength(1)
            expect(db.comment.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { pageId: 'page-1', parentId: null }
            }))
        })
    })

    describe('Notifications Actions', () => {
        it('getNotifications should return user notifications', async () => {
            vi.mocked(db.notification.findMany).mockResolvedValue([{ id: 'n1', title: 'Note' }] as any)
            const result = await getNotifications()
            expect(result).toHaveLength(1)
            expect(db.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: 'user-1' }
            }))
        })

        it('markAllAsRead should update many and revalidate', async () => {
            await markAllAsRead()
            expect(db.notification.updateMany).toHaveBeenCalled()
            expect(revalidatePath).toHaveBeenCalledWith('/')
        })
    })

    describe('Sharing Actions', () => {
        it('sharePage should create a share and notify user', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({ id: 'p1', userId: 'user-1', title: 'Title', shares: [] } as any)
            vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'user-2', name: 'Other' } as any)
            vi.mocked(db.pageShare.findFirst).mockResolvedValue(null)

            await sharePage('p1', { email: 'other@example.com', role: 'VIEWER' })

            expect(db.pageShare.create).toHaveBeenCalled()
            expect(db.notification.create).toHaveBeenCalled()
            expect(pusherServer.trigger).toHaveBeenCalledWith('user-user-2', 'notification', expect.any(Object))
        })

        it('checkPageAccess should return OWNER for page owner', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({ id: 'p1', userId: 'user-1', isPublished: false, shares: [] } as any)
            const result = await checkPageAccess('p1')
            expect(result.role).toBe('OWNER')
            expect(result.isOwner).toBe(true)
        })
    })

    describe('Users Actions', () => {
        it('searchUsers should return users matching query', async () => {
            vi.mocked(db.user.findMany).mockResolvedValue([{ id: 'u2', name: 'John' }] as any)
            const result = await searchUsers('John')
            expect(result).toHaveLength(1)
            expect(db.user.findMany).toHaveBeenCalled()
        })
    })
})
