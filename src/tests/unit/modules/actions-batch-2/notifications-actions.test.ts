
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as notificationActions from '@/app/(main)/_actions/notifications'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db', () => ({
    db: {
        notification: {
            findMany: vi.fn(),
            count: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Notification Actions', () => {
    const mockUser = { id: 'user-1' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
    })

    describe('getNotifications', () => {
        it('returns notifications for user', async () => {
            const mockNotifs = [{ id: 'n1' }]
            vi.mocked(db.notification.findMany).mockResolvedValue(mockNotifs as any)

            const result = await notificationActions.getNotifications()

            expect(db.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ userId: 'user-1' })
            }))
            expect(result).toEqual(mockNotifs)
        })

        it('returns empty array if unauthenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            const result = await notificationActions.getNotifications()
            expect(result).toEqual([])
        })
    })

    describe('getUnreadCount', () => {
        it('returns count of unread notifications', async () => {
            vi.mocked(db.notification.count).mockResolvedValue(5)
            const result = await notificationActions.getUnreadCount()
            expect(result).toBe(5)
            expect(db.notification.count).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: 'user-1', read: false }
            }))
        })
    })

    describe('markAsRead', () => {
        it('updates specific notification', async () => {
            await notificationActions.markAsRead('n1')
            expect(db.notification.update).toHaveBeenCalledWith({
                where: { id: 'n1', userId: 'user-1' },
                data: expect.objectContaining({ read: true })
            })
        })
    })

    describe('markAllAsRead', () => {
        it('updates all unread notifications for user', async () => {
            await notificationActions.markAllAsRead()
            expect(db.notification.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', read: false },
                data: expect.objectContaining({ read: true })
            })
        })
    })
})
