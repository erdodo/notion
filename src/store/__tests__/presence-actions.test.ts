
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as presenceActions from '@/app/(main)/_actions/presence'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'

vi.mock('@/lib/db', () => ({
    db: {
        userPresence: {
            upsert: vi.fn(),
            updateMany: vi.fn(),
            findMany: vi.fn()
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

describe('Presence Actions', () => {
    const mockUser = { id: 'user-1', name: 'User 1', image: 'img.png' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
    })

    describe('updatePresence', () => {
        it('upserts presence and triggers pusher', async () => {
            const pageId = 'p-1'
            const cursor = { blockId: 'b-1', offset: 0 }

            await presenceActions.updatePresence(pageId, cursor)

            expect(db.userPresence.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId_pageId: { userId: 'user-1', pageId } },
                create: expect.objectContaining({ status: 'ONLINE', cursorPosition: cursor }),
                update: expect.objectContaining({ status: 'ONLINE', cursorPosition: cursor })
            }))

            expect(pusherServer.trigger).toHaveBeenCalledWith(
                `page-${pageId}`,
                'presence-update',
                expect.objectContaining({
                    userId: 'user-1',
                    cursorPosition: cursor
                })
            )
        })

        it('does nothing if unauthenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            await presenceActions.updatePresence('p-1')
            expect(db.userPresence.upsert).not.toHaveBeenCalled()
            expect(pusherServer.trigger).not.toHaveBeenCalled()
        })
    })

    describe('leavePresence', () => {
        it('updates presence to OFFLINE and triggers pusher', async () => {
            const pageId = 'p-1'
            await presenceActions.leavePresence(pageId)

            expect(db.userPresence.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', pageId },
                data: expect.objectContaining({ status: 'OFFLINE' })
            })

            expect(pusherServer.trigger).toHaveBeenCalledWith(
                `page-${pageId}`,
                'presence-leave',
                { userId: 'user-1' }
            )
        })
    })

    describe('getPagePresence', () => {
        it('returns active users', async () => {
            const mockPresence = [{ userId: 'u2' }]
            vi.mocked(db.userPresence.findMany).mockResolvedValue(mockPresence as any)

            const result = await presenceActions.getPagePresence('p-1')

            expect(result).toEqual(mockPresence)
            expect(db.userPresence.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    pageId: 'p-1',
                    status: { not: 'OFFLINE' }
                })
            }))
        })
    })
})
