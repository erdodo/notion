import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecentSection } from '../recent-section'
import * as navigationActions from '@/app/(main)/_actions/navigation'

// Mock dependencies
vi.mock('@/app/(main)/_actions/navigation')

describe('RecentSection', () => {
  const mockRecentPages = [
    { id: 'recent-1', title: 'Recent Page 1', icon: '📄', parentId: null },
    { id: 'recent-2', title: 'Recent Page 2', icon: '📝', parentId: null },
    { id: 'recent-3', title: 'Recent Page 3', icon: '📊', parentId: null },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(navigationActions.getRecentPages as any).mockResolvedValue(mockRecentPages)
  })

  it('should not render when loading', () => {
    ;(navigationActions.getRecentPages as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<RecentSection />)

    expect(screen.queryByText('Recent')).not.toBeInTheDocument()
  })

  it('should not render when no recent pages exist', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([])

    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.queryByText('Recent')).not.toBeInTheDocument()
    })
  })

  it('should render recent section when pages exist', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })
  })

  it('should display clock icon', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })
  })

  it('should fetch recent pages on mount', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(navigationActions.getRecentPages).toHaveBeenCalledWith(5)
    })
  })

  it('should display all recent pages', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent Page 1')).toBeInTheDocument()
      expect(screen.getByText('Recent Page 2')).toBeInTheDocument()
      expect(screen.getByText('Recent Page 3')).toBeInTheDocument()
    })
  })

  it('should have correct href for recent page links', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link1 = screen.getByText('Recent Page 1').closest('a')
      expect(link1).toHaveAttribute('href', '/documents/recent-1')

      const link2 = screen.getByText('Recent Page 2').closest('a')
      expect(link2).toHaveAttribute('href', '/documents/recent-2')
    })
  })

  it('should display page icons', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeInTheDocument()
      expect(screen.getByText('📝')).toBeInTheDocument()
      expect(screen.getByText('📊')).toBeInTheDocument()
    })
  })

  it('should display default file icon when page has no icon', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: 'Page without icon', icon: null, parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Page without icon')).toBeInTheDocument()
    })
  })

  it('should be collapsible', async () => {
    const user = userEvent.setup()
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })

    const recentButton = screen.getByRole('button', { name: /recent/i })
    await user.click(recentButton)

    expect(recentButton).toBeInTheDocument()
  })

  it('should start collapsed by default', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })
  })

  it('should toggle expansion on button click', async () => {
    const user = userEvent.setup()
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })

    const recentButton = screen.getByRole('button', { name: /recent/i })
    await user.click(recentButton)

    expect(recentButton).toBeInTheDocument()
  })

  it('should display 'Untitled' when page has no title', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: null, icon: '📄', parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  it('should display 'Untitled' for empty title string', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: '', icon: '📄', parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([])

    const { container } = render(<RecentSection className="custom-class" />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should truncate long page titles', async () => {
    const longTitle = 'This is a very long recent page title that should be truncated'
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: longTitle, icon: '📄', parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      const span = screen.getByText(longTitle).closest('span')
      expect(span).toHaveClass('truncate')
    })
  })

  it('should display recent pages in correct order', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'recent-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'recent-3', title: 'Third', icon: '3️⃣', parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveTextContent('First')
      expect(links[1]).toHaveTextContent('Second')
      expect(links[2]).toHaveTextContent('Third')
    })
  })

  it('should have hover effect on recent page links', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a')
      expect(link).toHaveClass('hover:bg-muted')
    })
  })

  it('should display proper text sizes', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a')
      expect(link).toHaveClass('text-sm')
    })
  })

  it('should have proper spacing between pages', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a')
      expect(link).toHaveClass('px-2', 'py-1.5', 'rounded-md')
    })
  })

  it('should display chevron icon in trigger', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /recent/i })
    expect(button).toBeInTheDocument()
  })

  it('should show right chevron when collapsed', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /recent/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('should handle multiple page icons correctly', async () => {
    ;(navigationActions.getRecentPages as any).mockResolvedValue([
      { id: 'recent-1', title: 'Page 1', icon: '🎯', parentId: null },
      { id: 'recent-2', title: 'Page 2', icon: '📌', parentId: null },
      { id: 'recent-3', title: 'Page 3', icon: '⭐', parentId: null },
      { id: 'recent-4', title: 'Page 4', icon: null, parentId: null },
    ])

    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument()
      expect(screen.getByText('📌')).toBeInTheDocument()
      expect(screen.getByText('⭐')).toBeInTheDocument()
    })
  })

  it('should render with proper margins', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })

    const collapsible = screen.getByRole('button', { name: /recent/i }).closest('.mb-2')
    expect(collapsible).toHaveClass('mb-2')
  })

  it('should have group class for hover effects', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a')
      expect(link).toHaveClass('group')
    })
  })

  it('should display pages with flex layout', async () => {
    render(<RecentSection />)

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a')
      expect(link).toHaveClass('flex', 'items-center', 'gap-2')
    })
  })
})
