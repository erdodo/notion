import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovePageModal } from '../move-page-modal'
import { useMovePage } from '@/hooks/use-move-page'
import * as actions from '@/app/(main)/_actions/documents'
import * as navActions from '@/app/(main)/_actions/navigation'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@/hooks/use-move-page')
vi.mock('@/app/(main)/_actions/documents')
vi.mock('@/app/(main)/_actions/navigation')
vi.mock('sonner')
vi.mock('next/navigation')

describe('MovePageModal', () => {
  const mockOnClose = vi.fn()
  const mockRouter = { refresh: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(useMovePage as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      pageId: null,
      currentParentId: null,
    })
  })

  it('should not render when modal is closed', () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      pageId: null,
      currentParentId: null,
    })

    render(<MovePageModal />)

    expect(screen.queryByText('Move page to...')).not.toBeInTheDocument()
  })

  it('should render dialog when modal is open', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Move page to...')).toBeInTheDocument()
    })
  })

  it('should display search input for pages', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument()
    })
  })

  it('should show root (Private pages) option', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Private pages (root)')).toBeInTheDocument()
    })
  })

  it('should fetch and display pages', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-1', title: 'Page 1', icon: null },
      { id: 'page-2', title: 'Page 2', icon: null },
    ])

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument()
      expect(screen.getByText('Page 2')).toBeInTheDocument()
    })
  })

  it('should search pages on input change', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    const searchInput = await screen.findByPlaceholderText('Search pages...')
    await userEvent.type(searchInput, 'test')

    await waitFor(() => {
      expect(actions.searchPages).toHaveBeenCalledWith('test', expect.any(Object))
    })
  })

  it('should exclude current page from search results', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-123', title: 'Current Page', icon: null },
      { id: 'page-456', title: 'Other Page', icon: null },
    ])

    render(<MovePageModal />)

    await waitFor(() => {
      // Current page should not be clickable
      expect(screen.queryByText('Current Page')).not.toBeInTheDocument()
      expect(screen.getByText('Other Page')).toBeInTheDocument()
    })
  })

  it('should show checkmark for current parent', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: null,
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    await waitFor(() => {
      // Root should have checkmark when currentParentId is null
      const rootOption = screen.getByText('Private pages (root)').closest('div')
      expect(rootOption?.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('should call movePage when selecting a destination', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination Page', icon: null },
    ])

    ;(navActions.movePage as any).mockResolvedValue({})

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination Page')).toBeInTheDocument()
    })

    const destinationOption = screen.getByText('Destination Page')
    await userEvent.click(destinationOption)

    await waitFor(() => {
      expect(navActions.movePage).toHaveBeenCalledWith('page-123', 'page-456')
    })
  })

  it('should show success toast on successful move', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination', icon: null },
    ])

    ;(navActions.movePage as any).mockResolvedValue({})

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Destination'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Page moved successfully')
    })
  })

  it('should close modal after successful move', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination', icon: null },
    ])

    ;(navActions.movePage as any).mockResolvedValue({})

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Destination'))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should refresh router after successful move', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination', icon: null },
    ])

    ;(navActions.movePage as any).mockResolvedValue({})

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Destination'))

    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('should close modal when moving to same parent', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'parent-123', title: 'Current Parent', icon: null },
    ])

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Current Parent')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Current Parent'))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show error toast on move failure', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination', icon: null },
    ])

    ;(navActions.movePage as any).mockRejectedValue(
      new Error('Move failed')
    )

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Destination'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Move failed')
    })
  })

  it('should move to root (null parent)', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    ;(navActions.movePage as any).mockResolvedValue({})

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Private pages (root)')).toBeInTheDocument()
    })

    const rootOption = screen.getByText('Private pages (root)')
    await userEvent.click(rootOption)

    await waitFor(() => {
      expect(navActions.movePage).toHaveBeenCalledWith('page-123', null)
    })
  })

  it('should disable modal when moving is in progress', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-456', title: 'Destination', icon: null },
    ])

    ;(navActions.movePage as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<MovePageModal />)

    await waitFor(() => {
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })

    const destinationOption = screen.getByText('Destination')
    await userEvent.click(destinationOption)

    // Should not be able to close while moving
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should handle search with multiple matching results', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([
      { id: 'page-1', title: 'Test Document 1', icon: null },
      { id: 'page-2', title: 'Test Document 2', icon: null },
      { id: 'page-3', title: 'Test Document 3', icon: null },
    ])

    render(<MovePageModal />)

    const searchInput = await screen.findByPlaceholderText('Search pages...')
    await userEvent.type(searchInput, 'Test')

    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument()
      expect(screen.getByText('Test Document 2')).toBeInTheDocument()
      expect(screen.getByText('Test Document 3')).toBeInTheDocument()
    })
  })

  it('should show empty state when no pages found', async () => {
    ;(useMovePage as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      pageId: 'page-123',
      currentParentId: 'parent-123',
    })

    ;(actions.searchPages as any).mockResolvedValue([])

    render(<MovePageModal />)

    const searchInput = await screen.findByPlaceholderText('Search pages...')
    await userEvent.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('No pages found')).toBeInTheDocument()
    })
  })
})
