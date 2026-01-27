
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as PageActions from '@/actions/page'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        user: { upsert: vi.fn() },
        page: {
            create: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Page Actions', () => {
    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'avatar.png'
    }

    const mockSession = {
        user: mockUser
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue(mockSession as any)
        vi.mocked(db.user.upsert).mockResolvedValue(mockUser as any)
    })

    describe('createPage', () => {
        it('creates a page for authenticated user', async () => {
            const mockPage = { id: 'page-1', title: 'Untitled', userId: mockUser.id, parentId: null }
            vi.mocked(db.page.create).mockResolvedValue(mockPage as any)

            const result = await PageActions.createPage()

            expect(db.user.upsert).toHaveBeenCalled()
            expect(db.page.create).toHaveBeenCalledWith({
                data: {
                    title: 'Untitled',
                    userId: mockUser.id,
                    parentId: null
                }
            })
            expect(revalidatePath).toHaveBeenCalledWith('/')
            expect(result).toEqual(mockPage)
        })

        it('creates a page with parentId', async () => {
            const parentId = 'parent-1'
            const mockPage = { id: 'page-1', title: 'Untitled', userId: mockUser.id, parentId }
            vi.mocked(db.page.create).mockResolvedValue(mockPage as any)

            const result = await PageActions.createPage(parentId)

            expect(db.page.create).toHaveBeenCalledWith({
                data: {
                    title: 'Untitled',
                    userId: mockUser.id,
                    parentId
                }
            })
            expect(result).toEqual(mockPage)
        })

        it('throws error if user not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            await expect(PageActions.createPage()).rejects.toThrow('Unauthorized')
        })
    })

    describe('getPages', () => {
        it('returns pages for authenticated user', async () => {
            const mockPages = [{ id: 'page-1', title: 'Page 1' }]
            vi.mocked(db.page.findMany).mockResolvedValue(mockPages as any)

            const result = await PageActions.getPages()

            expect(db.page.findMany).toHaveBeenCalledWith({
                where: {
                    userId: mockUser.id,
                    parentId: null,
                    isArchived: false
                },
                orderBy: { createdAt: 'desc' },
                include: { children: true }
            })
            expect(result).toEqual(mockPages)
        })

        it('returns pages for specific parent', async () => {
            await PageActions.getPages('parent-1')
            expect(db.page.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ parentId: 'parent-1' })
            }))
        })

        it('returns empty array if not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            const result = await PageActions.getPages()
            expect(result).toEqual([])
        })
    })

    describe('getPageById', () => {
        it('returns page if found and belongs to user', async () => {
            const mockPage = { id: 'page-1', title: 'Test' }
            vi.mocked(db.page.findFirst).mockResolvedValue(mockPage as any)

            const result = await PageActions.getPageById('page-1')

            expect(db.page.findFirst).toHaveBeenCalledWith({
                where: { id: 'page-1', userId: mockUser.id },
                include: { children: true }
            })
            expect(result).toEqual(mockPage)
        })

        it('throws unauthorized if user not logged in', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            await expect(PageActions.getPageById('page-1')).rejects.toThrow('Unauthorized')
        })
    })

    describe('updatePage', () => {
        it('updates page properties', async () => {
            const updateData = { title: 'New Title', isPublished: true }
            vi.mocked(db.page.updateMany).mockResolvedValue({ count: 1 } as any)

            await PageActions.updatePage('page-1', updateData)

            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'page-1', userId: mockUser.id },
                data: expect.objectContaining({
                    ...updateData,
                    updatedAt: expect.any(Date),
                    publishedAt: expect.any(Date)
                })
            })
            expect(revalidatePath).toHaveBeenCalledWith('/')
        })
    })

    describe('archivePage', () => {
        it('archives page and children recursively', async () => {
            const mockChildren = [{ id: 'child-1' }]
            vi.mocked(db.page.findMany).mockResolvedValueOnce(mockChildren as any) // first call for children
            vi.mocked(db.page.findMany).mockResolvedValue([]) // subsequent calls (recusion base case)

            await PageActions.archivePage('parent-1')

            // Should fetch children
            expect(db.page.findMany).toHaveBeenCalledWith({
                where: { parentId: 'parent-1', userId: mockUser.id }
            })

            // Should update parent and child
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'child-1' },
                data: { isArchived: true }
            })
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'parent-1' },
                data: { isArchived: true }
            })
            expect(revalidatePath).toHaveBeenCalledWith('/')
        })
    })

    describe('restorePage', () => {
        it('restores page and parents if archived', async () => {
            const mockPage = { id: 'child-1', parentId: 'parent-1' }
            const mockParent = { id: 'parent-1', isArchived: true, parentId: null }

            vi.mocked(db.page.findFirst)
                .mockResolvedValueOnce(mockPage as any) // page lookup
                .mockResolvedValueOnce(mockParent as any) // parent lookup

            await PageActions.restorePage('child-1')

            // Restore parent
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'parent-1' },
                data: { isArchived: false }
            })
            // Restore page
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'child-1' },
                data: { isArchived: false }
            })
        })

        it('throws if page not found', async () => {
            vi.mocked(db.page.findFirst).mockResolvedValue(null)
            await expect(PageActions.restorePage('missing-id')).rejects.toThrow('Page not found')
        })
    })

    describe('deletePage', () => {
        it('deletes page permanently', async () => {
            await PageActions.deletePage('page-1')
            expect(db.page.delete).toHaveBeenCalledWith({
                where: { id: 'page-1' } // Prisma delete usually requires unique ID
            })
            expect(revalidatePath).toHaveBeenCalledWith('/')
        })
    })

    describe('getArchivedPages', () => {
        it('returns archived pages', async () => {
            const mockArchived = [{ id: 'archived-1' }]
            vi.mocked(db.page.findMany).mockResolvedValue(mockArchived as any)

            const result = await PageActions.getArchivedPages()

            expect(db.page.findMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id, isArchived: true },
                orderBy: { updatedAt: 'desc' }
            })
            expect(result).toEqual(mockArchived)
        })
    })

    describe('searchPages', () => {
        it('returns matching pages', async () => {
            const mockResults = [{ id: 'res-1', title: 'Test Result' }]
            vi.mocked(db.page.findMany).mockResolvedValue(mockResults as any)

            const result = await PageActions.searchPages('test')

            expect(db.page.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    userId: mockUser.id,
                    isArchived: false
                }),
                take: 50
            }))
            expect(result).toEqual(mockResults)
        })

        it('returns empty if query is empty', async () => {
            const result = await PageActions.searchPages('   ')
            expect(result).toEqual([])
            expect(db.page.findMany).not.toHaveBeenCalled()
        })
    })
})
