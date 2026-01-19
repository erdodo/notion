
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as navActions from '@/app/(main)/_actions/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db', () => ({
    db: {
        favorite: {
            create: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn()
        },
        page: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            aggregate: vi.fn()
        },
        pageView: {
            upsert: vi.fn(),
            findMany: vi.fn()
        },
        pageLink: {
            upsert: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn()
        },
        $transaction: vi.fn(async (cb) => {
            // Mock transaction context
            const tx = {
                page: { update: vi.fn(), updateMany: vi.fn() }
            }
            if (cb) await cb(tx)
        })
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Navigation Actions', () => {
    const mockUser = { id: 'user-1' }
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
    })

    describe('Favorites', () => {
        it('adds to favorites', async () => {
            await navActions.addToFavorites('p-1')
            expect(db.favorite.create).toHaveBeenCalledWith(expect.objectContaining({
                data: { userId: 'user-1', pageId: 'p-1' }
            }))
        })

        it('removes from favorites', async () => {
            await navActions.removeFromFavorites('p-1')
            expect(db.favorite.delete).toHaveBeenCalled()
        })

        it('checks if favorite', async () => {
            vi.mocked(db.favorite.findUnique).mockResolvedValue({ id: 'f-1' } as any)
            const result = await navActions.isFavorite('p-1')
            expect(result).toBe(true)
        })
    })

    describe('getBreadcrumbs', () => {
        it('returns breadcrumb path', async () => {
            const child = { id: 'child', title: 'Child', parentId: 'parent', icon: null }
            const parent = { id: 'parent', title: 'Parent', parentId: null, icon: null }

            vi.mocked(db.page.findUnique)
                .mockResolvedValueOnce(child as any)
                .mockResolvedValueOnce(parent as any)

            const crumbs = await navActions.getPageBreadcrumbs('child')
            expect(crumbs).toHaveLength(2)
            expect(crumbs[0].title).toBe('Parent')
            expect(crumbs[1].title).toBe('Child')
        })
    })

    describe('movePage', () => {
        it('moves page to new parent and updates order', async () => {
            vi.mocked(db.page.aggregate).mockResolvedValue({ _max: { order: 5 } } as any)

            await navActions.movePage('p-1', 'new-parent')

            expect(db.page.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'p-1', userId: 'user-1' },
                data: { parentId: 'new-parent', order: 6 }
            }))
        })

        it('prevents circular move', async () => {
            // Mock loop: p-1 -> p-2 -> p-1
            vi.mocked(db.page.findUnique).mockResolvedValue({ parentId: 'p-1' } as any)

            await expect(navActions.movePage('p-1', 'p-2')).rejects.toThrow('circular reference')
        })
    })
})
