
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as CommentActions from '@/app/(main)/_actions/comments'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'
import { checkPageAccess } from '@/app/(main)/_actions/sharing'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        comment: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn()
        },
        userMention: {
            createMany: vi.fn()
        },
        notification: {
            create: vi.fn()
        },
        page: {
            findUnique: vi.fn()
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

vi.mock('@/app/(main)/_actions/sharing', () => ({
    checkPageAccess: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Comment Actions', () => {
    const mockUser = {
        id: 'user-1',
        name: 'Test User',
        image: 'avatar.png'
    }

    const mockSession = { user: mockUser }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue(mockSession as any)
    })

    describe('addComment', () => {
        const pageId = 'page-1'
        const commentData = { content: 'Test Comment' }

        it('creates a comment successfully', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: true, role: 'editor' } as any)
            vi.mocked(db.comment.create).mockResolvedValue({ id: 'comment-1', ...commentData } as any)
            vi.mocked(db.page.findUnique).mockResolvedValue({ id: pageId, userId: 'owner-1', title: 'Page' } as any)

            const result = await CommentActions.addComment(pageId, commentData)

            expect(checkPageAccess).toHaveBeenCalledWith(pageId)
            expect(db.comment.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    content: 'Test Comment',
                    pageId,
                    userId: mockUser.id
                })
            }))
            expect(db.notification.create).toHaveBeenCalled() // Owner notification
            expect(pusherServer.trigger).toHaveBeenCalled()
            expect(result).toEqual(expect.objectContaining({ id: 'comment-1' }))
        })

        it('throws if unauthorized', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            await expect(CommentActions.addComment(pageId, commentData)).rejects.toThrow('Unauthorized')
        })

        it('throws if no page access', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: false } as any)
            await expect(CommentActions.addComment(pageId, commentData)).rejects.toThrow("You don't have permission")
        })

        it('handles mentions correctly', async () => {
            const mentionedData = { ...commentData, mentionedUserIds: ['user-2'] }
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: true } as any)
            vi.mocked(db.comment.create).mockResolvedValue({ id: 'comment-1' } as any)
            vi.mocked(db.page.findUnique).mockResolvedValue({ userId: mockUser.id } as any) // Self page, no owner notif

            await CommentActions.addComment(pageId, mentionedData)

            expect(db.userMention.createMany).toHaveBeenCalled()
            expect(db.notification.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ type: 'MENTION', userId: 'user-2' })
            }))
        })
    })

    describe('getComments', () => {
        it('returns comments if has access', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: true } as any)
            const mockComments = [{ id: 'c1' }]
            vi.mocked(db.comment.findMany).mockResolvedValue(mockComments as any)

            const result = await CommentActions.getComments('page-1')
            expect(result).toEqual(mockComments)
        })

        it('throws if no access', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: false } as any)
            await expect(CommentActions.getComments('page-1')).rejects.toThrow('Unauthorized')
        })
    })

    describe('updateComment', () => {
        it('updates comment if owner', async () => {
            const commentId = 'c1'
            vi.mocked(db.comment.findUnique).mockResolvedValue({ id: commentId, userId: mockUser.id, pageId: 'page-1' } as any)

            await CommentActions.updateComment(commentId, 'New Content')

            expect(db.comment.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: commentId },
                data: expect.objectContaining({ content: 'New Content' })
            }))
            expect(pusherServer.trigger).toHaveBeenCalled()
        })

        it('throws if not owner', async () => {
            const commentId = 'c1'
            vi.mocked(db.comment.findUnique).mockResolvedValue({ id: commentId, userId: 'other-user', pageId: 'page-1' } as any)
            await expect(CommentActions.updateComment(commentId, 'New Content')).rejects.toThrow('Unauthorized')
        })
    })

    describe('deleteComment', () => {
        it('allows deletion by comment owner', async () => {
            const commentId = 'c1'
            vi.mocked(db.comment.findUnique).mockResolvedValue({
                id: commentId,
                userId: mockUser.id,
                pageId: 'page-1',
                page: { userId: 'other-owner' }
            } as any)

            await CommentActions.deleteComment(commentId)

            expect(db.comment.delete).toHaveBeenCalledWith({ where: { id: commentId } })
        })

        it('allows deletion by page owner', async () => {
            const commentId = 'c1'
            vi.mocked(db.comment.findUnique).mockResolvedValue({
                id: commentId,
                userId: 'other-user',
                pageId: 'page-1',
                page: { userId: mockUser.id }
            } as any)

            await CommentActions.deleteComment(commentId)

            expect(db.comment.delete).toHaveBeenCalledWith({ where: { id: commentId } })
        })

        it('throws if neither comment nor page owner', async () => {
            const commentId = 'c1'
            vi.mocked(db.comment.findUnique).mockResolvedValue({
                id: commentId,
                userId: 'other-user',
                pageId: 'page-1',
                page: { userId: 'other-owner' }
            } as any)

            await expect(CommentActions.deleteComment(commentId)).rejects.toThrow('Unauthorized')
        })
    })

    describe('resolveComment', () => {
        it('resolves comment successfully', async () => {
            vi.mocked(db.comment.findUnique).mockResolvedValue({ id: 'c1', pageId: 'p1' } as any)

            await CommentActions.resolveComment('c1')

            expect(db.comment.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'c1' },
                data: expect.objectContaining({ resolved: true, resolvedBy: mockUser.id })
            }))
        })
    })

    describe('getCommentCount', () => {
        it('returns count if access granted', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: true } as any)
            vi.mocked(db.comment.count).mockResolvedValue(5)

            const count = await CommentActions.getCommentCount('page-1')
            expect(count).toBe(5)
        })

        it('returns 0 if no access', async () => {
            vi.mocked(checkPageAccess).mockResolvedValue({ hasAccess: false } as any)
            const count = await CommentActions.getCommentCount('page-1')
            expect(count).toBe(0)
        })
    })
})
