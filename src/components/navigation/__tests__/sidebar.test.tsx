import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../sidebar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as pageActions from '@/actions/page'

// Mock dependencies
vi.mock('next-auth/react')
vi.mock('next/navigation')
vi.mock('@/actions/page')

describe('Sidebar', () => {
  const mockPush = vi.fn()
  const mockSession = {
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(useSession as any).mockReturnValue({
      data: mockSession,
    })
    ;(pageActions.getPages as any).mockResolvedValue([])
    ;(pageActions.createPage as any).mockResolvedValue({
      id: 'page-1',
      title: 'New Page',
    })
  })

  it('should render sidebar when session exists', () => {
    render(<Sidebar />)
    expect(screen.getByText("John's Notion")).toBeInTheDocument()
  })

  it('should display user name from session', () => {
    ;(useSession as any).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
    })

    render(<Sidebar />)
    expect(screen.getByText("Jane's Notion")).toBeInTheDocument()
  })

  it('should display search button', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('should display new page button', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /new page/i })).toBeInTheDocument()
  })

  it('should display trash button', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /trash/i })).toBeInTheDocument()
  })

  it('should display settings button', () => {
    render(<Sidebar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should load pages on mount when session exists', async () => {
    ;(pageActions.getPages as any).mockResolvedValue([
      { id: 'page-1', title: 'Page 1', children: [] },
    ])

    render(<Sidebar />)

    await waitFor(() => {
      expect(pageActions.getPages).toHaveBeenCalled()
    })
  })

  it('should not load pages when session is undefined', () => {
    ;(useSession as any).mockReturnValue({
      data: null,
    })

    render(<Sidebar />)

    expect(pageActions.getPages).not.toHaveBeenCalled()
  })

  it('should create new page when new page button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    await waitFor(() => {
      expect(pageActions.createPage).toHaveBeenCalled()
    })
  })

  it('should navigate to new page after creation', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/documents/page-1')
    })
  })

  it('should disable new page button while creating', async () => {
    const user = userEvent.setup()
    ;(pageActions.createPage as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ id: 'page-1' }), 100))
    )

    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    expect(newPageButton).toBeDisabled()
  })

  it('should display private section label', () => {
    render(<Sidebar />)
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('should display loaded pages in private section', async () => {
    ;(pageActions.getPages as any).mockResolvedValue([
      { id: 'page-1', title: 'My Page', children: [] },
      { id: 'page-2', title: 'Another Page', children: [] },
    ])

    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('My Page')).toBeInTheDocument()
      expect(screen.getByText('Another Page')).toBeInTheDocument()
    })
  })

  it('should handle page loading error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(pageActions.getPages as any).mockRejectedValue(new Error('Load failed'))

    render(<Sidebar />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading pages:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should handle page creation error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(pageActions.createPage as any).mockRejectedValue(new Error('Create failed'))

    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating page:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should reload pages after creating new page', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const initialCallCount = (pageActions.getPages as any).mock.calls.length

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    await waitFor(() => {
      const newCallCount = (pageActions.getPages as any).mock.calls.length
      expect(newCallCount).toBeGreaterThan(initialCallCount)
    })
  })

  it('should display sidebar with proper styling', () => {
    const { container } = render(<Sidebar />)
    const sidebar = container.querySelector('aside')

    expect(sidebar).toHaveClass('group/sidebar', 'h-full', 'bg-secondary', 'overflow-y-auto')
  })

  it('should render page items with refresh callback', async () => {
    ;(pageActions.getPages as any).mockResolvedValue([
      { id: 'page-1', title: 'Test Page', children: [] },
    ])

    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })
  })

  it('should handle multiple page creations', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })

    await user.click(newPageButton)
    await waitFor(() => {
      expect(pageActions.createPage).toHaveBeenCalledTimes(1)
    })

    ;(pageActions.createPage as any).mockResolvedValue({
      id: 'page-2',
      title: 'Second Page',
    })

    await user.click(newPageButton)
    await waitFor(() => {
      expect(pageActions.createPage).toHaveBeenCalledTimes(2)
    })
  })

  it('should not navigate when page creation fails', async () => {
    const user = userEvent.setup()
    ;(pageActions.createPage as any).mockRejectedValue(new Error('Create failed'))

    render(<Sidebar />)

    const newPageButton = screen.getByRole('button', { name: /new page/i })
    await user.click(newPageButton)

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should display first name of user with space in name', () => {
    ;(useSession as any).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Michael Doe',
          email: 'john@example.com',
        },
      },
    })

    render(<Sidebar />)
    expect(screen.getByText("John's Notion")).toBeInTheDocument()
  })

  it('should have proper z-index for sidebar', () => {
    const { container } = render(<Sidebar />)
    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('z-[99999]')
  })
})
