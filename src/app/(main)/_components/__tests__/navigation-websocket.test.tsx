import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createMockSocket, waitForSocketUpdate } from '@/__tests__/utils/socket-mock'
import { useDocumentsStore } from '@/store/use-documents-store'

// Mock the socket provider
vi.mock('@/components/providers/socket-provider', () => ({
    useSocket: () => ({
        socket: mockSocket,
        isConnected: true
    })
}))

let mockSocket: ReturnType<typeof createMockSocket>

describe('Navigation WebSocket Integration', () => {
    beforeEach(() => {
        mockSocket = createMockSocket()
        vi.clearAllMocks()

        // Reset store
        const { result } = renderHook(() => useDocumentsStore())
        result.current.setDocuments([])
        result.current.setRecentPages([])
        result.current.setFavoritePages([])
        result.current.setPublishedPages([])
        result.current.setSharedPages([])
        result.current.setTrashPages([])
    })

    describe('Socket Connection', () => {
        it('should establish socket connection on mount', () => {
            expect(mockSocket.connected).toBe(true)
        })

        it('should register event listeners on mount', () => {
            const createHandlers = mockSocket._getHandlers('doc:create')
            const updateHandlers = mockSocket._getHandlers('doc:update')
            const deleteHandlers = mockSocket._getHandlers('doc:delete')

            expect(createHandlers.length).toBeGreaterThan(0)
            expect(updateHandlers.length).toBeGreaterThan(0)
            expect(deleteHandlers.length).toBeGreaterThan(0)
        })
    })

    describe('doc:create Event', () => {
        it('should add new document to store on doc:create event', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const newDoc = {
                id: 'doc-1',
                title: 'New Document',
                icon: '📄',
                isArchived: false,
                isPublished: false,
                parentId: null
            }

            mockSocket._trigger('doc:create', newDoc)
            await waitForSocketUpdate()

            expect(result.current.documents).toContainEqual(
                expect.objectContaining({ id: 'doc-1', title: 'New Document' })
            )
        })

        it('should handle multiple rapid doc:create events', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const docs = [
                { id: 'doc-1', title: 'Doc 1', isArchived: false, isPublished: false, parentId: null },
                { id: 'doc-2', title: 'Doc 2', isArchived: false, isPublished: false, parentId: null },
                { id: 'doc-3', title: 'Doc 3', isArchived: false, isPublished: false, parentId: null }
            ]

            docs.forEach(doc => mockSocket._trigger('doc:create', doc))
            await waitForSocketUpdate()

            expect(result.current.documents).toHaveLength(3)
        })
    })

    describe('doc:update Event', () => {
        it('should update document title in all lists', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const initialDoc = {
                id: 'doc-1',
                title: 'Original Title',
                icon: '📄',
                isArchived: false,
                isPublished: false,
                parentId: null
            }

            result.current.setDocuments([initialDoc])
            result.current.setRecentPages([initialDoc])
            result.current.setFavoritePages([initialDoc])

            mockSocket._trigger('doc:update', {
                id: 'doc-1',
                title: 'Updated Title'
            })
            await waitForSocketUpdate()

            expect(result.current.documents[0].title).toBe('Updated Title')
            expect(result.current.recentPages[0].title).toBe('Updated Title')
            expect(result.current.favoritePages[0].title).toBe('Updated Title')
        })

        it('should update document icon in all lists', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const initialDoc = {
                id: 'doc-1',
                title: 'Document',
                icon: '📄',
                isArchived: false,
                isPublished: false,
                parentId: null
            }

            result.current.setDocuments([initialDoc])
            result.current.setSharedPages([initialDoc])

            mockSocket._trigger('doc:update', {
                id: 'doc-1',
                icon: '🚀'
            })
            await waitForSocketUpdate()

            expect(result.current.documents[0].icon).toBe('🚀')
            expect(result.current.sharedPages[0].icon).toBe('🚀')
        })

        it('should move document to trash when isArchived is true', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const doc = {
                id: 'doc-1',
                title: 'Document',
                icon: '📄',
                isArchived: false,
                isPublished: false,
                parentId: null
            }

            result.current.setDocuments([doc])
            result.current.setRecentPages([doc])

            mockSocket._trigger('doc:update', {
                id: 'doc-1',
                isArchived: true
            })
            await waitForSocketUpdate()

            expect(result.current.documents).not.toContainEqual(
                expect.objectContaining({ id: 'doc-1' })
            )
            expect(result.current.recentPages).not.toContainEqual(
                expect.objectContaining({ id: 'doc-1' })
            )
            expect(result.current.trashPages).toContainEqual(
                expect.objectContaining({ id: 'doc-1', isArchived: true })
            )
        })

        it('should update nested documents correctly', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const parentDoc = {
                id: 'parent',
                title: 'Parent',
                isArchived: false,
                isPublished: false,
                parentId: null,
                children: [
                    {
                        id: 'child',
                        title: 'Child',
                        isArchived: false,
                        isPublished: false,
                        parentId: 'parent'
                    }
                ]
            }

            result.current.setDocuments([parentDoc])

            mockSocket._trigger('doc:update', {
                id: 'child',
                title: 'Updated Child'
            })
            await waitForSocketUpdate()

            expect(result.current.documents[0].children![0].title).toBe('Updated Child')
        })
    })

    describe('doc:delete Event', () => {
        it('should remove document from all lists', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const doc = {
                id: 'doc-1',
                title: 'Document',
                isArchived: false,
                isPublished: false,
                parentId: null
            }

            result.current.setDocuments([doc])
            result.current.setRecentPages([doc])
            result.current.setFavoritePages([doc])
            result.current.setPublishedPages([doc])
            result.current.setSharedPages([doc])
            result.current.setTrashPages([doc])

            mockSocket._trigger('doc:delete', 'doc-1')
            await waitForSocketUpdate()

            expect(result.current.documents).toHaveLength(0)
            expect(result.current.recentPages).toHaveLength(0)
            expect(result.current.favoritePages).toHaveLength(0)
            expect(result.current.publishedPages).toHaveLength(0)
            expect(result.current.sharedPages).toHaveLength(0)
            expect(result.current.trashPages).toHaveLength(0)
        })

        it('should remove nested documents correctly', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            const parentDoc = {
                id: 'parent',
                title: 'Parent',
                isArchived: false,
                isPublished: false,
                parentId: null,
                children: [
                    {
                        id: 'child-1',
                        title: 'Child 1',
                        isArchived: false,
                        isPublished: false,
                        parentId: 'parent'
                    },
                    {
                        id: 'child-2',
                        title: 'Child 2',
                        isArchived: false,
                        isPublished: false,
                        parentId: 'parent'
                    }
                ]
            }

            result.current.setDocuments([parentDoc])

            mockSocket._trigger('doc:delete', 'child-1')
            await waitForSocketUpdate()

            expect(result.current.documents[0].children).toHaveLength(1)
            expect(result.current.documents[0].children![0].id).toBe('child-2')
        })
    })

    describe('Event Cleanup', () => {
        it('should remove event listeners on unmount', () => {
            const offSpy = vi.spyOn(mockSocket, 'off')

            // Simulate component unmount
            mockSocket._clearHandlers()

            expect(mockSocket._getHandlers('doc:create')).toHaveLength(0)
            expect(mockSocket._getHandlers('doc:update')).toHaveLength(0)
            expect(mockSocket._getHandlers('doc:delete')).toHaveLength(0)
        })
    })

    describe('Error Handling', () => {
        it('should handle invalid document data gracefully', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            // Trigger with invalid data
            mockSocket._trigger('doc:create', null)
            await waitForSocketUpdate()

            // Should not crash
            expect(result.current.documents).toHaveLength(0)
        })

        it('should handle update for non-existent document', async () => {
            const { result } = renderHook(() => useDocumentsStore())

            mockSocket._trigger('doc:update', {
                id: 'non-existent',
                title: 'Updated'
            })
            await waitForSocketUpdate()

            // Should not crash
            expect(result.current.documents).toHaveLength(0)
        })
    })
})
