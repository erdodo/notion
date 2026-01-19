
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as sharingActions from '@/app/(main)/_actions/sharing'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db', () => ({
    db: {
        page: {
            findUnique: vi.fn()
        },
        user: {
            findUnique: vi.fn()
        },
        pageShare: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn()
        },
        notification: {
            create: vi.fn()
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

describe('Sharing Actions', () => {
    const mockUser = { id: 'user-1', email: 'me@example.com', name: 'Me' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
    })

    describe('checkPageAccess', () => {
        it('grants owner access', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({
                id: 'p-1',
                userId: 'user-1',
                isPublished: false,
                shares: []
            } as any)

            const result = await sharingActions.checkPageAccess('p-1')
            expect(result).toEqual({ hasAccess: true, role: 'OWNER', isOwner: true })
        })

        it('grants shared access', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({
                id: 'p-1',
                userId: 'other',
                shares: [{ role: 'EDITOR' }]
            } as any)

            const result = await sharingActions.checkPageAccess('p-1')
            expect(result).toEqual({ hasAccess: true, role: 'EDITOR', isOwner: false })
        })

        it('grants public view access', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({
                id: 'p-1',
                userId: 'other',
                isPublished: true, // Public
                shares: []
            } as any)

            const result = await sharingActions.checkPageAccess('p-1')
            expect(result).toEqual({ hasAccess: true, role: 'VIEWER', isOwner: false })
        })

        it('denies access', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({
                id: 'p-1',
                userId: 'other',
                shares: []
            } as any)

            const result = await sharingActions.checkPageAccess('p-1')
            expect(result).toEqual({ hasAccess: false, role: null, isOwner: false })
        })
    })

    describe('sharePage', () => {
        it('shares page with new user', async () => {
            // Setup permissions (owner)
            vi.mocked(db.page.findUnique).mockResolvedValue({ userId: 'user-1', shares: [] } as any)
            vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'target-user' } as any)
            vi.mocked(db.pageShare.findFirst).mockResolvedValue(null) // No existing share

            const result = await sharingActions.sharePage('p-1', { email: 'target@example.com', role: 'EDITOR' })

            expect(result.success).toBe(true)
            expect(db.pageShare.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    pageId: 'p-1',
                    userId: 'target-user',
                    role: 'EDITOR'
                })
            }))
            expect(db.notification.create).toHaveBeenCalled()
        })

        it('updates existing share', async () => {
            vi.mocked(db.page.findUnique).mockResolvedValue({ userId: 'user-1', shares: [] } as any)
            vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'target-user' } as any)
            vi.mocked(db.pageShare.findFirst).mockResolvedValue({ id: 'share-1' } as any)

            await sharingActions.sharePage('p-1', { email: 'target@example.com', role: 'VIEWER' })

            expect(db.pageShare.update).toHaveBeenCalledWith({
                where: { id: 'share-1' },
                data: { role: 'VIEWER' }
            })
        })
    })

    describe('removeShare', () => {
        it('removes if owner', async () => {
            vi.mocked(db.pageShare.findUnique).mockResolvedValue({
                id: 'share-1',
                page: { userId: 'user-1' }
            } as any)

            await sharingActions.removeShare('share-1')
            expect(db.pageShare.delete).toHaveBeenCalledWith({ where: { id: 'share-1' } })
        })

        it('throws if unauthorized', async () => {
            vi.mocked(db.pageShare.findUnique).mockResolvedValue({
                id: 'share-1',
                invitedBy: 'other',
                page: { userId: 'other' }
            } as any)

            await expect(sharingActions.removeShare('share-1')).rejects.toThrow('Unauthorized')
        })
    })
})
