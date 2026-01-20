import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMockSocket, waitForSocketUpdate } from '@/__tests__/utils/socket-mock'
import { Breadcrumbs } from '@/components/breadcrumbs'

// Mock dependencies
vi.mock('@/components/providers/socket-provider', () => ({
    useSocket: () => ({
        socket: mockSocket,
        isConnected: true
    })
}))

vi.mock('@/app/(main)/_actions/navigation', () => ({
    getPageBreadcrumbs: vi.fn(() => Promise.resolve([
        { id: 'root', title: 'Root', icon: '📁' },
        { id: 'parent', title: 'Parent', icon: '📄' },
        { id: 'current', title: 'Current', icon: '📝' }
    ]))
}))

let mockSocket: ReturnType<typeof createMockSocket>

describe('Breadcrumbs WebSocket Integration', () => {
    beforeEach(() => {
        mockSocket = createMockSocket()
        vi.clearAllMocks()
    })

    describe('Socket Connection', () => {
        it('should register doc:update listener on mount', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                const updateHandlers = mockSocket._getHandlers('doc:update')
                expect(updateHandlers.length).toBeGreaterThan(0)
            })
        })

        it('should cleanup listeners on unmount', async () => {
            const { unmount } = render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            unmount()

            expect(mockSocket.off).toHaveBeenCalledWith('doc:update', expect.any(Function))
        })
    })

    describe('Title Updates', () => {
        it('should update breadcrumb title when receiving doc:update event', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Update parent page title
            mockSocket._trigger('doc:update', {
                id: 'parent',
                title: 'Updated Parent'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('Updated Parent')).toBeInTheDocument()
                expect(screen.queryByText('Parent')).not.toBeInTheDocument()
            })
        })

        it('should update current page title', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            mockSocket._trigger('doc:update', {
                id: 'current',
                title: 'Updated Current'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('Updated Current')).toBeInTheDocument()
            })
        })

        it('should update root page title', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Root')).toBeInTheDocument()
            })

            mockSocket._trigger('doc:update', {
                id: 'root',
                title: 'Updated Root'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('Updated Root')).toBeInTheDocument()
            })
        })
    })

    describe('Icon Updates', () => {
        it('should update breadcrumb icon when receiving doc:update event', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('📄')).toBeInTheDocument()
            })

            mockSocket._trigger('doc:update', {
                id: 'parent',
                icon: '🚀'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('🚀')).toBeInTheDocument()
                expect(screen.queryByText('📄')).not.toBeInTheDocument()
            })
        })

        it('should handle icon removal', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('📄')).toBeInTheDocument()
            })

            mockSocket._trigger('doc:update', {
                id: 'parent',
                icon: null
            })

            await waitForSocketUpdate()

            // Should show default icon or no icon
            await waitFor(() => {
                expect(screen.queryByText('📄')).not.toBeInTheDocument()
            })
        })
    })

    describe('Multiple Updates', () => {
        it('should handle multiple breadcrumb updates', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Root')).toBeInTheDocument()
            })

            // Update multiple pages
            mockSocket._trigger('doc:update', {
                id: 'root',
                title: 'New Root'
            })

            mockSocket._trigger('doc:update', {
                id: 'parent',
                title: 'New Parent'
            })

            mockSocket._trigger('doc:update', {
                id: 'current',
                title: 'New Current'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('New Root')).toBeInTheDocument()
                expect(screen.getByText('New Parent')).toBeInTheDocument()
                expect(screen.getByText('New Current')).toBeInTheDocument()
            })
        })

        it('should ignore updates for pages not in breadcrumb path', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Update unrelated page
            mockSocket._trigger('doc:update', {
                id: 'unrelated-page',
                title: 'Unrelated'
            })

            await waitForSocketUpdate()

            // Should not affect breadcrumbs
            expect(screen.queryByText('Unrelated')).not.toBeInTheDocument()
            expect(screen.getByText('Current')).toBeInTheDocument()
        })
    })

    describe('Rapid Updates', () => {
        it('should handle rapid successive updates', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Rapid updates to same page
            mockSocket._trigger('doc:update', { id: 'current', title: 'Update 1' })
            mockSocket._trigger('doc:update', { id: 'current', title: 'Update 2' })
            mockSocket._trigger('doc:update', { id: 'current', title: 'Update 3' })
            mockSocket._trigger('doc:update', { id: 'current', title: 'Final Update' })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('Final Update')).toBeInTheDocument()
            })
        })
    })

    describe('Error Handling', () => {
        it('should handle malformed update events', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Trigger with invalid data
            mockSocket._trigger('doc:update', null)
            mockSocket._trigger('doc:update', {})
            mockSocket._trigger('doc:update', { id: 'current' }) // No updates

            await waitForSocketUpdate()

            // Should not crash
            expect(screen.getByText('Current')).toBeInTheDocument()
        })

        it('should handle partial update data', async () => {
            render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Update with only title
            mockSocket._trigger('doc:update', {
                id: 'current',
                title: 'Only Title'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('Only Title')).toBeInTheDocument()
            })

            // Update with only icon
            mockSocket._trigger('doc:update', {
                id: 'current',
                icon: '🎯'
            })

            await waitForSocketUpdate()

            await waitFor(() => {
                expect(screen.getByText('🎯')).toBeInTheDocument()
            })
        })
    })

    describe('Page Navigation', () => {
        it('should refetch breadcrumbs when pageId changes', async () => {
            const { getPageBreadcrumbs } = await import('@/app/(main)/_actions/navigation')

            const { rerender } = render(<Breadcrumbs pageId="current" />)

            await waitFor(() => {
                expect(screen.getByText('Current')).toBeInTheDocument()
            })

            // Change to different page
            rerender(<Breadcrumbs pageId="different-page" />)

            await waitFor(() => {
                expect(getPageBreadcrumbs).toHaveBeenCalledWith('different-page')
            })
        })
    })
})
