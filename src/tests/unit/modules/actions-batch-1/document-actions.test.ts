
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as docActions from '@/app/(main)/_actions/documents'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'

vi.mock('@/lib/db', () => ({
    db: {
        page: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            delete: vi.fn(),
        },
        pageHistory: {
            findFirst: vi.fn(),
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
        user: { upsert: vi.fn() }
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

describe('Document Actions', () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any)
        vi.mocked(db.user.upsert).mockResolvedValue(mockUser as any)
    })

    describe('createDocument', () => {
        it('creates a document', async () => {
            vi.mocked(db.page.create).mockResolvedValue({ id: 'p-1', title: 'Untitled' } as any)
            const res = await docActions.createDocument()
            expect(db.page.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ userId: mockUser.id })
            }))
            expect(res).toEqual({ id: 'p-1', title: 'Untitled' })
        })
    })

    describe('archiveDocument', () => {
        it('archives document and children recursively', async () => {
            // Mock recursion findMany (first call return children, subsequent empty)
            vi.mocked(db.page.findFirst).mockResolvedValue({ id: 'p-1' } as any)
            vi.mocked(db.page.findMany)
                .mockResolvedValueOnce([{ id: 'child-1' }] as any)
                .mockResolvedValue([])

            await docActions.archiveDocument('p-1')

            // Check child update
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'child-1' },
                data: { isArchived: true }
            })
            // Check parent update
            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'p-1' },
                data: { isArchived: true }
            })
        })
    })

    describe('restoreDocument', () => {
        it('restores document to root if parent is archived', async () => {
            const mockDoc = { id: 'doc-1', parentId: 'parent-1' }
            const mockParent = { id: 'parent-1', isArchived: true }

            vi.mocked(db.page.findFirst)
                .mockResolvedValueOnce(mockDoc as any) // findFirst for doc
                .mockResolvedValueOnce(mockParent as any) // findFirst for parent

            await docActions.restoreDocument('doc-1')

            expect(db.page.update).toHaveBeenCalledWith({
                where: { id: 'doc-1' },
                data: {
                    isArchived: false,
                    parentId: null // Moved to root
                }
            })
        })
    })

    describe('updateDocument', () => {
        it('updates document and triggers pusher', async () => {
            const updateData = { title: 'New Title' }
            vi.mocked(db.page.updateMany).mockResolvedValue({ count: 1 } as any)

            await docActions.updateDocument('doc-1', updateData)

            expect(db.page.updateMany).toHaveBeenCalled()
            expect(pusherServer.trigger).toHaveBeenCalledWith(
                'document-doc-1',
                'document-update',
                updateData
            )
        })

        it('creates snapshot if content changed', async () => {
            const updateData = { content: 'New Content' }
            vi.mocked(db.page.findUnique).mockResolvedValue({
                id: 'doc-1',
                content: 'Old Content'
            } as any)
            // No recent snapshot
            vi.mocked(db.pageHistory.findFirst).mockResolvedValue(null)

            await docActions.updateDocument('doc-1', updateData)

            expect(db.pageHistory.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ content: 'Old Content' })
            }))
        })
    })
})
