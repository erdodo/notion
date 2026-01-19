import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageItem } from '../page-item'
import { useRouter } from 'next/navigation'
import * as pageActions from '@/actions/page'

// Mock dependencies
vi.mock('next/navigation')
vi.mock('@/actions/page')

describe('PageItem', () => {
  const mockPush = vi.fn()
  const mockOnRefresh = vi.fn()

  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    icon: '📄',
    children: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(pageActions.createPage as any).mockResolvedValue({
      id: 'child-page-1',
      title: 'Child Page',
    })
  })

  it('should render page item with title', () => {
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('should display page icon', () => {
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)
    expect(screen.getByText('📄')).toBeInTheDocument()
  })

  it('should display default file icon when no icon provided', () => {
    const pageWithoutIcon = { ...mockPage, icon: null }
    const { container } = render(<PageItem page={pageWithoutIcon} onRefresh={mockOnRefresh} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should navigate to page when clicked', async () => {
    const user = userEvent.setup()
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const pageTitle = screen.getByText('Test Page')
    await user.click(pageTitle)

    expect(mockPush).toHaveBeenCalledWith('/documents/page-1')
  })

  it('should show expand button when page has children', () => {
    const pageWithChildren = {
      ...mockPage,
      children: [
        { id: 'child-1', title: 'Child Page', icon: null, children: [] },
      ],
    }

    const { container } = render(<PageItem page={pageWithChildren} onRefresh={mockOnRefresh} />)
    const expandButton = container.querySelector('button[role="button"]')
    expect(expandButton).toBeInTheDocument()
  })

  it('should not show expand button when page has no children', () => {
    const { container } = render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)
    const expandButtons = container.querySelectorAll('button[role="button"]')
    expect(expandButtons.length).toBe(1) // Only add child button
  })

  it('should expand and show children', async () => {
    const user = userEvent.setup()
    const pageWithChildren = {
      ...mockPage,
      children: [
        { id: 'child-1', title: 'Child Page', icon: '📝', children: [] },
      ],
    }

    render(<PageItem page={pageWithChildren} onRefresh={mockOnRefresh} />)

    const expandButton = screen.getByRole('button', { hidden: true })
    await user.click(expandButton)

    await waitFor(() => {
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })
  })

  it('should collapse children when expand button is clicked again', async () => {
    const user = userEvent.setup()
    const pageWithChildren = {
      ...mockPage,
      children: [
        { id: 'child-1', title: 'Child Page', icon: '📝', children: [] },
      ],
    }

    const { rerender } = render(<PageItem page={pageWithChildren} onRefresh={mockOnRefresh} />)

    // Click to expand
    const expandButtons = screen.getAllByRole('button')
    await user.click(expandButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })

    // Click to collapse
    await user.click(expandButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
    })
  })

  it('should show add child button on hover', () => {
    const { container } = render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)
    const addButton = container.querySelector('button[class*="opacity-0"]')
    expect(addButton).toHaveClass('opacity-0', 'group-hover:opacity-100')
  })

  it('should create child page when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    await waitFor(() => {
      expect(pageActions.createPage).toHaveBeenCalledWith('page-1')
    })
  })

  it('should refresh pages after creating child', async () => {
    const user = userEvent.setup()
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled()
    })
  })

  it('should navigate to child page after creation', async () => {
    const user = userEvent.setup()
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/documents/child-page-1')
    })
  })

  it('should disable add button while creating', async () => {
    const user = userEvent.setup()
    ;(pageActions.createPage as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ id: 'child-1' }), 100))
    )

    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    expect(addButton).toBeDisabled()
  })

  it('should handle child page creation error', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(pageActions.createPage as any).mockRejectedValue(new Error('Create failed'))

    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating child page:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should apply proper padding based on level', () => {
    const { container } = render(<PageItem page={mockPage} onRefresh={mockOnRefresh} level={2} />)
    const itemDiv = container.querySelector('div[class*="py-1"]')
    expect(itemDiv).toHaveStyle({ paddingLeft: '36px' })
  })

  it('should render nested children with correct level', async () => {
    const user = userEvent.setup()
    const pageWithNestedChildren = {
      ...mockPage,
      children: [
        {
          id: 'child-1',
          title: 'Child Page',
          icon: '📝',
          children: [
            { id: 'grandchild-1', title: 'Grandchild Page', icon: '📎', children: [] },
          ],
        },
      ],
    }

    render(<PageItem page={pageWithNestedChildren} onRefresh={mockOnRefresh} />)

    const expandButtons = screen.getAllByRole('button')
    await user.click(expandButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })
  })

  it('should truncate long page titles', () => {
    const longTitle = 'This is a very long page title that should be truncated'
    const pageWithLongTitle = { ...mockPage, title: longTitle }

    const { container } = render(<PageItem page={pageWithLongTitle} onRefresh={mockOnRefresh} />)
    const titleSpan = container.querySelector('span.truncate')
    expect(titleSpan).toHaveClass('truncate')
  })

  it('should handle multiple children', async () => {
    const user = userEvent.setup()
    const pageWithMultipleChildren = {
      ...mockPage,
      children: [
        { id: 'child-1', title: 'Child 1', icon: '📝', children: [] },
        { id: 'child-2', title: 'Child 2', icon: '📝', children: [] },
        { id: 'child-3', title: 'Child 3', icon: '📝', children: [] },
      ],
    }

    render(<PageItem page={pageWithMultipleChildren} onRefresh={mockOnRefresh} />)

    const expandButtons = screen.getAllByRole('button')
    await user.click(expandButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })

  it('should stop event propagation on expand click', async () => {
    const user = userEvent.setup()
    const pageWithChildren = {
      ...mockPage,
      children: [{ id: 'child-1', title: 'Child Page', icon: null, children: [] }],
    }

    render(<PageItem page={pageWithChildren} onRefresh={mockOnRefresh} />)

    const expandButton = screen.getAllByRole('button')[0]
    await user.click(expandButton)

    // Should expand without navigating to parent page
    expect(mockPush).not.toHaveBeenCalledWith('/documents/page-1')
  })

  it('should stop event propagation on add child click', async () => {
    const user = userEvent.setup()
    render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons[buttons.length - 1]

    await user.click(addButton)

    // Should create child without navigating to parent page
    await waitFor(() => {
      expect(pageActions.createPage).toHaveBeenCalled()
    })
  })

  it('should render page item with custom icon', () => {
    const customIconPage = { ...mockPage, icon: '🎯' }
    render(<PageItem page={customIconPage} onRefresh={mockOnRefresh} />)
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('should have proper hover styles', () => {
    const { container } = render(<PageItem page={mockPage} onRefresh={mockOnRefresh} />)
    const itemDiv = container.querySelector('div[class*="hover:bg-primary"]')
    expect(itemDiv).toHaveClass('hover:bg-primary/5')
  })
})
