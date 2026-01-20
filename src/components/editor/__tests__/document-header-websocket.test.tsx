import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMockSocket, waitForSocketUpdate } from '@/__tests__/utils/socket-mock'
import { DocumentHeader } from '@/components/editor/document-header'

// Mock dependencies
vi.mock('@/components/providers/socket-provider', () => ({
    useSocket: () => ({
        socket: mockSocket,
        isConnected: true
    })
}))

vi.mock('@/app/(main)/_actions/documents', () => ({
    updateDocument: vi.fn()
}))

let mockSocket: ReturnType<typeof createMockSocket>

describe('DocumentHeader WebSocket Integration', () => {
    beforeEach(() => {
        mockSocket = createMockSocket()
        vi.clearAllMocks()
    })

    const mockPage = {
        id: 'page-1',
        title: 'Test Page',
        icon: '📄',
        coverImage: null,
        coverImagePosition: null,
        isPublished: false
    }

    describe('Socket Connection', () => {
        it('should register doc:update listener on mount', () => {
            render(<DocumentHeader page={mockPage} />)

            const updateHandlers = mockSocket._getHandlers('doc:update')
            expect(updateHandlers.length).toBeGreaterThan(0)
        })

        it('should cleanup listeners on unmount', () => {
            const { unmount } = render(<DocumentHeader page={mockPage} />)

            unmount()

            // Verify off was called
            expect(mockSocket.off).toHaveBeenCalledWith('doc:update', expect.any(Function))
        })
    })

    describe('Remote Title Updates', () => {
        it('should update title when receiving doc:update event', async () => {
            const { rerender } = render(<DocumentHeader page={mockPage} />)

            // Simulate remote update
            mockSocket._trigger('doc:update', {
                id: 'page-1',
                title: 'Updated Title'
            })

            await waitForSocketUpdate()

            // Re-render with updated page prop (simulating parent component update)
            rerender(<DocumentHeader page={{ ...mockPage, title: 'Updated Title' }} />)

            const titleInput = screen.getByDisplayValue('Updated Title')
            expect(titleInput).toBeInTheDocument()
        })

        it('should not update title when user is actively editing', async () => {
            render(<DocumentHeader page={mockPage} />)

            const titleInput = screen.getByDisplayValue('Test Page') as HTMLTextAreaElement

            // Simulate user typing
            titleInput.focus()
            titleInput.value = 'User is typing...'

            // Remote update arrives
            mockSocket._trigger('doc:update', {
                id: 'page-1',
                title: 'Remote Update'
            })

            await waitForSocketUpdate()

            // User's input should not be overwritten
            expect(titleInput.value).toBe('User is typing...')
        })
    })

    describe('Remote Icon Updates', () => {
        it('should update icon when receiving doc:update event', async () => {
            const { rerender } = render(<DocumentHeader page={mockPage} />)

            mockSocket._trigger('doc:update', {
                id: 'page-1',
                icon: '🚀'
            })

            await waitForSocketUpdate()

            rerender(<DocumentHeader page={{ ...mockPage, icon: '🚀' }} />)

            expect(screen.getByText('🚀')).toBeInTheDocument()
        })

        it('should handle icon removal', async () => {
            const pageWithIcon = { ...mockPage, icon: '📄' }
            const { rerender } = render(<DocumentHeader page={pageWithIcon} />)

            mockSocket._trigger('doc:update', {
                id: 'page-1',
                icon: null
            })

            await waitForSocketUpdate()

            rerender(<DocumentHeader page={{ ...mockPage, icon: null }} />)

            expect(screen.queryByText('📄')).not.toBeInTheDocument()
        })
    })

    describe('Remote Cover Image Updates', () => {
        it('should update cover image when receiving doc:update event', async () => {
            const { rerender } = render(<DocumentHeader page={mockPage} />)

            const newCoverUrl = 'https://example.com/cover.jpg'

            mockSocket._trigger('doc:update', {
                id: 'page-1',
                coverImage: newCoverUrl
            })

            await waitForSocketUpdate()

            rerender(<DocumentHeader page={{ ...mockPage, coverImage: newCoverUrl }} />)

            // Cover component should receive the new URL
            const coverElement = screen.getByRole('img', { hidden: true })
            expect(coverElement).toHaveAttribute('src', expect.stringContaining('cover.jpg'))
        })

        it('should update cover position', async () => {
            const pageWithCover = {
                ...mockPage,
                coverImage: 'https://example.com/cover.jpg',
                coverImagePosition: 0.5
            }

            const { rerender } = render(<DocumentHeader page={pageWithCover} />)

            mockSocket._trigger('doc:update', {
                id: 'page-1',
                coverImagePosition: 0.75
            })

            await waitForSocketUpdate()

            rerender(<DocumentHeader page={{ ...pageWithCover, coverImagePosition: 0.75 }} />)

            // Position should be updated
            expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
        })
    })

    describe('Debounced Input Handling', () => {
        it('should debounce title updates', async () => {
            const { updateDocument } = await import('@/app/(main)/_actions/documents')

            render(<DocumentHeader page={mockPage} />)

            const titleInput = screen.getByDisplayValue('Test Page') as HTMLTextAreaElement

            // Rapid typing
            titleInput.value = 'A'
            titleInput.dispatchEvent(new Event('change', { bubbles: true }))

            titleInput.value = 'AB'
            titleInput.dispatchEvent(new Event('change', { bubbles: true }))

            titleInput.value = 'ABC'
            titleInput.dispatchEvent(new Event('change', { bubbles: true }))

            // Should not call updateDocument immediately
            expect(updateDocument).not.toHaveBeenCalled()

            // Wait for debounce
            await waitFor(() => {
                expect(updateDocument).toHaveBeenCalledWith('page-1', { title: 'ABC' })
            }, { timeout: 600 })
        })

        it('should save immediately on blur', async () => {
            const { updateDocument } = await import('@/app/(main)/_actions/documents')

            render(<DocumentHeader page={mockPage} />)

            const titleInput = screen.getByDisplayValue('Test Page') as HTMLTextAreaElement

            titleInput.value = 'New Title'
            titleInput.dispatchEvent(new Event('change', { bubbles: true }))
            titleInput.blur()

            // Should save immediately on blur
            await waitFor(() => {
                expect(updateDocument).toHaveBeenCalledWith('page-1', { title: 'New Title' })
            })
        })
    })

    describe('Multiple Document Updates', () => {
        it('should only update when event matches page id', async () => {
            const { rerender } = render(<DocumentHeader page={mockPage} />)

            // Update for different page
            mockSocket._trigger('doc:update', {
                id: 'different-page',
                title: 'Different Title'
            })

            await waitForSocketUpdate()

            // Should not update
            expect(screen.getByDisplayValue('Test Page')).toBeInTheDocument()

            // Update for correct page
            mockSocket._trigger('doc:update', {
                id: 'page-1',
                title: 'Correct Update'
            })

            await waitForSocketUpdate()

            rerender(<DocumentHeader page={{ ...mockPage, title: 'Correct Update' }} />)

            expect(screen.getByDisplayValue('Correct Update')).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        it('should handle malformed update events', async () => {
            render(<DocumentHeader page={mockPage} />)

            // Trigger with invalid data
            mockSocket._trigger('doc:update', null)
            mockSocket._trigger('doc:update', {})
            mockSocket._trigger('doc:update', { id: 'page-1' }) // No updates

            await waitForSocketUpdate()

            // Should not crash
            expect(screen.getByDisplayValue('Test Page')).toBeInTheDocument()
        })
    })
})
