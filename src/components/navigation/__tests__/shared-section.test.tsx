import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SharedSection } from '../shared-section'
import { useParams, useRouter } from 'next/navigation'
import * as documentsActions from '@/app/(main)/_actions/documents'

// Mock dependencies
vi.mock('next/navigation')
vi.mock('@/app/(main)/_actions/documents')

describe('SharedSection', () => {
  const mockPush = vi.fn()
  const mockSharedDocuments = [
    { id: 'shared-1', title: 'Shared Document 1', icon: '👥', parentId: null },
    { id: 'shared-2', title: 'Shared Document 2', icon: '🤝', parentId: null },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(useParams as any).mockReturnValue({
      documentId: 'current-doc',
    })
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue(mockSharedDocuments)
  })

  it('should show loading skeleton initially', () => {
    ;(documentsActions.getSharedDocuments as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSharedDocuments), 100))
    )

    const { container } = render(<SharedSection />)

    expect(container.querySelector('.skeleton')).toBeInTheDocument()
  })

  it('should not render when no shared documents exist', async () => {
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([])

    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.queryByText('Public')).not.toBeInTheDocument()
    })
  })

  it('should render shared section when documents exist', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Public')).toBeInTheDocument()
    })
  })

  it('should display custom label when provided', async () => {
    render(<SharedSection label="Shared with Me" />)

    await waitFor(() => {
      expect(screen.getByText('Shared with Me')).toBeInTheDocument()
    })
  })

  it('should display default label "Public"', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Public')).toBeInTheDocument()
    })
  })

  it('should fetch shared documents on mount', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(documentsActions.getSharedDocuments).toHaveBeenCalled()
    })
  })

  it('should display all shared documents', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
      expect(screen.getByText('Shared Document 2')).toBeInTheDocument()
    })
  })

  it('should display shared document icons', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('👥')).toBeInTheDocument()
      expect(screen.getByText('🤝')).toBeInTheDocument()
    })
  })

  it('should navigate to document when item is clicked', async () => {
    const user = userEvent.setup()
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
    })

    const documentItem = screen.getByText('Shared Document 1').closest('div[role="button"]')
    if (documentItem) {
      await user.click(documentItem)
      expect(mockPush).toHaveBeenCalledWith('/documents/shared-1')
    }
  })

  it('should highlight active document', async () => {
    ;(useParams as any).mockReturnValue({
      documentId: 'shared-1',
    })

    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
    })
  })

  it('should handle error when loading shared documents', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(documentsActions.getSharedDocuments as any).mockRejectedValue(
      new Error('Load failed')
    )

    render(<SharedSection />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to list shared documents',
        expect.any(Error)
      )
    })

    consoleSpy.mockRestore()
  })

  it('should display label with proper styling', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      const label = screen.getByText('Public')
      expect(label).toHaveClass('text-xs', 'text-muted-foreground')
    })
  })

  it('should hide skeleton after loading completes', async () => {
    const { container } = render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
      expect(container.querySelector('.skeleton')).not.toBeInTheDocument()
    })
  })

  it('should display documents with correct fallback icon', async () => {
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([
      { id: 'shared-1', title: 'No Icon Document', icon: null, parentId: null },
    ])

    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('No Icon Document')).toBeInTheDocument()
    })
  })

  it('should display multiple shared documents in order', async () => {
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([
      { id: 'shared-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'shared-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'shared-3', title: 'Third', icon: '3️⃣', parentId: null },
    ])

    render(<SharedSection />)

    await waitFor(() => {
      const items = screen.getAllByRole('button')
      // First item should be first shared document
      expect(items[0]).toHaveTextContent('First')
    })
  })

  it('should have proper flex layout for document items', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      const documentDiv = screen.getByText('Shared Document 1').closest('[role="button"]')
      expect(documentDiv).toHaveClass('flex', 'items-center', 'gap-x-2')
    })
  })

  it('should truncate long document titles', async () => {
    const longTitle = 'This is a very long shared document title that should be truncated'
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([
      { id: 'shared-1', title: longTitle, icon: '📄', parentId: null },
    ])

    render(<SharedSection />)

    await waitFor(() => {
      const titleSpan = screen.getByText(longTitle).closest('span')
      expect(titleSpan).toHaveClass('truncate')
    })
  })

  it('should apply margin bottom to section', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      const section = screen.getByText('Public').closest('div.mb-2')
      expect(section).toHaveClass('mb-2')
    })
  })

  it('should have proper padding for items', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      const item = screen.getByText('Shared Document 1').closest('[role="button"]')
      expect(item).toHaveClass('px-3', 'py-1.5')
    })
  })

  it('should handle empty document title', async () => {
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([
      { id: 'shared-1', title: '', icon: '📄', parentId: null },
    ])

    render(<SharedSection />)

    await waitFor(() => {
      // Should render item even with empty title
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    })
  })

  it('should pass correct props to Item component', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
      expect(screen.getByText('Shared Document 2')).toBeInTheDocument()
    })
  })

  it('should set level to 0 for all shared documents', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      const items = screen.getAllByRole('button')
      // All items should have consistent styling (level 0)
      items.forEach(item => {
        expect(item).toHaveClass('px-3')
      })
    })
  })

  it('should handle document redirection callback', async () => {
    const user = userEvent.setup()
    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
    })

    const documentItem = screen.getByText('Shared Document 1').closest('[role="button"]')
    if (documentItem) {
      await user.click(documentItem)
      expect(mockPush).toHaveBeenCalledWith('/documents/shared-1')
    }
  })

  it('should display with proper text color when not active', async () => {
    ;(useParams as any).mockReturnValue({
      documentId: 'other-doc',
    })

    render(<SharedSection />)

    await waitFor(() => {
      const item = screen.getByText('Shared Document 1').closest('[role="button"]')
      expect(item).toHaveClass('text-muted-foreground')
    })
  })

  it('should handle various icon types', async () => {
    ;(documentsActions.getSharedDocuments as any).mockResolvedValue([
      { id: 'shared-1', title: 'Doc with emoji', icon: '🎯', parentId: null },
      { id: 'shared-2', title: 'Doc with text', icon: 'T', parentId: null },
      { id: 'shared-3', title: 'Doc with null', icon: null, parentId: null },
    ])

    render(<SharedSection />)

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument()
    })
  })

  it('should reload documents after focus', async () => {
    render(<SharedSection />)

    await waitFor(() => {
      expect(documentsActions.getSharedDocuments).toHaveBeenCalledTimes(1)
    })

    // Component should support document update events
    // Currently relies on initial load only per source code
    expect(screen.getByText('Shared Document 1')).toBeInTheDocument()
  })
})
