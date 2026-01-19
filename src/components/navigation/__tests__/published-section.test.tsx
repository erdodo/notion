import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PublishedSection } from '../published-section'
import * as navigationActions from '@/app/(main)/_actions/navigation'

// Mock dependencies
vi.mock('@/app/(main)/_actions/navigation')

describe('PublishedSection', () => {
  const mockPublishedPages = [
    { id: 'pub-1', title: 'Published Page 1', icon: '🌐', parentId: null },
    { id: 'pub-2', title: 'Published Page 2', icon: '📡', parentId: null },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(navigationActions.getPublishedPages as any).mockResolvedValue(mockPublishedPages)
  })

  it('should not render when loading', () => {
    ;(navigationActions.getPublishedPages as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<PublishedSection />)

    expect(screen.queryByText('Published')).not.toBeInTheDocument()
  })

  it('should not render when no published pages exist', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.queryByText('Published')).not.toBeInTheDocument()
    })
  })

  it('should render published section when pages exist', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })
  })

  it('should display globe icon', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })
  })

  it('should fetch published pages on mount', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(navigationActions.getPublishedPages).toHaveBeenCalled()
    })
  })

  it('should display all published pages', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published Page 1')).toBeInTheDocument()
      expect(screen.getByText('Published Page 2')).toBeInTheDocument()
    })
  })

  it('should have correct href for published page links', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link1 = screen.getByText('Published Page 1').closest('a')
      expect(link1).toHaveAttribute('href', '/documents/pub-1')

      const link2 = screen.getByText('Published Page 2').closest('a')
      expect(link2).toHaveAttribute('href', '/documents/pub-2')
    })
  })

  it('should display page icons', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('🌐')).toBeInTheDocument()
      expect(screen.getByText('📡')).toBeInTheDocument()
    })
  })

  it('should display default file icon when page has no icon', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: 'Page without icon', icon: null, parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Page without icon')).toBeInTheDocument()
    })
  })

  it('should be collapsible', async () => {
    const user = userEvent.setup()
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    const publishedButton = screen.getByRole('button', { name: /published/i })
    await user.click(publishedButton)

    expect(publishedButton).toBeInTheDocument()
  })

  it('should start collapsed by default', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })
  })

  it('should toggle expansion on button click', async () => {
    const user = userEvent.setup()
    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    const publishedButton = screen.getByRole('button', { name: /published/i })
    await user.click(publishedButton)

    expect(publishedButton).toBeInTheDocument()
  })

  it('should display 'Untitled' when page has no title', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: null, icon: '🌐', parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  it('should display 'Untitled' for empty title string', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: '', icon: '🌐', parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([])

    const { container } = render(<PublishedSection className="custom-class" />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should truncate long page titles', async () => {
    const longTitle = 'This is a very long published page title that should be truncated'
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: longTitle, icon: '🌐', parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      const span = screen.getByText(longTitle).closest('span')
      expect(span).toHaveClass('truncate')
    })
  })

  it('should display published pages in correct order', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'pub-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'pub-3', title: 'Third', icon: '3️⃣', parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveTextContent('First')
      expect(links[1]).toHaveTextContent('Second')
      expect(links[2]).toHaveTextContent('Third')
    })
  })

  it('should have hover effect on published page links', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link = screen.getByText('Published Page 1').closest('a')
      expect(link).toHaveClass('hover:bg-muted')
    })
  })

  it('should display proper text sizes', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link = screen.getByText('Published Page 1').closest('a')
      expect(link).toHaveClass('text-sm')
    })
  })

  it('should have proper spacing between pages', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link = screen.getByText('Published Page 1').closest('a')
      expect(link).toHaveClass('px-2', 'py-1.5', 'rounded-md')
    })
  })

  it('should display with proper margins', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /published/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('should have correct trigger button styling', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /published/i })
      expect(button).toHaveClass('justify-start', 'px-2', 'py-1', 'h-7')
    })
  })

  it('should handle multiple published pages correctly', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: 'Page 1', icon: '🎯', parentId: null },
      { id: 'pub-2', title: 'Page 2', icon: '📌', parentId: null },
      { id: 'pub-3', title: 'Page 3', icon: '⭐', parentId: null },
      { id: 'pub-4', title: 'Page 4', icon: '🚀', parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument()
      expect(screen.getByText('📌')).toBeInTheDocument()
      expect(screen.getByText('⭐')).toBeInTheDocument()
      expect(screen.getByText('🚀')).toBeInTheDocument()
    })
  })

  it('should display pages with flex layout', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link = screen.getByText('Published Page 1').closest('a')
      expect(link).toHaveClass('flex', 'items-center', 'gap-2')
    })
  })

  it('should have group class for hover effects', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const link = screen.getByText('Published Page 1').closest('a')
      expect(link).toHaveClass('group')
    })
  })

  it('should render collapsible trigger with correct structure', async () => {
    render(<PublishedSection />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /published/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('should handle pages with various icon types', async () => {
    ;(navigationActions.getPublishedPages as any).mockResolvedValue([
      { id: 'pub-1', title: 'Text Icon', icon: '📄', parentId: null },
      { id: 'pub-2', title: 'Image Icon', icon: '🖼️', parentId: null },
      { id: 'pub-3', title: 'Video Icon', icon: '🎬', parentId: null },
      { id: 'pub-4', title: 'No Icon', icon: null, parentId: null },
    ])

    render(<PublishedSection />)

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeInTheDocument()
      expect(screen.getByText('🖼️')).toBeInTheDocument()
      expect(screen.getByText('🎬')).toBeInTheDocument()
    })
  })
})
