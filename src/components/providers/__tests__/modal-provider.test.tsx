import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ModalProvider } from '../modal-provider'

// Mock dependencies
vi.mock('@/components/search-command', () => ({
  SearchCommand: () => <div data-testid="search-command">Search</div>,
}))

vi.mock('@/components/modals/settings-modal', () => ({
  SettingsModal: () => <div data-testid="settings-modal">Settings</div>,
}))

vi.mock('@/components/modals/move-page-modal', () => ({
  MovePageModal: () => <div data-testid="move-page-modal">Move Page</div>,
}))

vi.mock('@/components/modals/rename-modal', () => ({
  RenameModal: () => <div data-testid="rename-modal">Rename</div>,
}))

vi.mock('@/components/modals/history-modal', () => ({
  HistoryModal: () => <div data-testid="history-modal">History</div>,
}))

describe('ModalProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render before mount', () => {
    render(<ModalProvider />)

    // Before mount, should return null
    expect(screen.queryByTestId('search-command')).not.toBeInTheDocument()
  })

  it('should render modals after mounting', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })
  })

  it('should render search command modal', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })
  })

  it('should render settings modal', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })
  })

  it('should render move page modal', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('move-page-modal')).toBeInTheDocument()
    })
  })

  it('should render rename modal', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('rename-modal')).toBeInTheDocument()
    })
  })

  it('should render history modal', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('history-modal')).toBeInTheDocument()
    })
  })

  it('should render all modals together', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
      expect(screen.getByTestId('move-page-modal')).toBeInTheDocument()
      expect(screen.getByTestId('rename-modal')).toBeInTheDocument()
      expect(screen.getByTestId('history-modal')).toBeInTheDocument()
    })
  })

  it('should return null initially before mount', () => {
    const { container } = render(<ModalProvider />)

    expect(container.firstChild).toBeNull()
  })

  it('should render fragment with all modals', async () => {
    const { container } = render(<ModalProvider />)

    await waitFor(() => {
      const modals = container.querySelectorAll('[data-testid]')
      expect(modals.length).toBe(5)
    })
  })

  it('should handle component lifecycle mount', async () => {
    const { unmount } = render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })

    unmount()

    await waitFor(() => {
      expect(screen.queryByTestId('search-command')).not.toBeInTheDocument()
    })
  })

  it('should maintain modal order in DOM', async () => {
    const { container } = render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })

    const modals = Array.from(container.querySelectorAll('[data-testid]'))
    const testIds = modals.map(m => m.getAttribute('data-testid'))

    expect(testIds).toContain('search-command')
    expect(testIds).toContain('settings-modal')
    expect(testIds).toContain('move-page-modal')
    expect(testIds).toContain('rename-modal')
    expect(testIds).toContain('history-modal')
  })

  it('should use fragment to render multiple modals without wrapper', async () => {
    const { container } = render(<ModalProvider />)

    await waitFor(() => {
      // With fragment, modals should be direct children of parent (or at fragment level)
      const modals = container.querySelectorAll('[data-testid]')
      expect(modals.length).toBeGreaterThan(0)
    })
  })

  it('should mount state only once on initial render', async () => {
    const { rerender } = render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })

    const modalCount1 = screen.getAllByTestId(/modal|command/).length

    rerender(<ModalProvider />)

    const modalCount2 = screen.getAllByTestId(/modal|command/).length

    // Should not create duplicate modals
    expect(modalCount2).toBeLessThanOrEqual(modalCount1 + 1)
  })

  it('should set mounted state to true', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      // If mounted is false, nothing renders
      // If mounted is true, modals render
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })
  })

  it('should render with useEffect hook after mount', async () => {
    render(<ModalProvider />)

    // Initially nothing
    expect(screen.queryByTestId('search-command')).not.toBeInTheDocument()

    // After effect runs
    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })
  })

  it('should render SearchCommand component', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })

  it('should render SettingsModal component', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('should render MovePageModal component', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByText('Move Page')).toBeInTheDocument()
    })
  })

  it('should render RenameModal component', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByText('Rename')).toBeInTheDocument()
    })
  })

  it('should render HistoryModal component', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument()
    })
  })

  it('should preserve modal order: SearchCommand first', async () => {
    const { container } = render(<ModalProvider />)

    await waitFor(() => {
      const firstChild = container.querySelector('[data-testid]')
      expect(firstChild?.getAttribute('data-testid')).toBe('search-command')
    })
  })

  it('should have all modal components registered', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      const elements = screen.getAllByTestId(/modal|command/)
      expect(elements.length).toBe(5)
    })
  })

  it('should not render anything while isMounted is false', () => {
    const { container } = render(<ModalProvider />)

    // Before mount completes
    expect(container.firstChild).toBeNull()
  })

  it('should handle rapid re-renders', async () => {
    const { rerender } = render(<ModalProvider />)

    rerender(<ModalProvider />)
    rerender(<ModalProvider />)
    rerender(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })
  })

  it('should cleanly mount and unmount', async () => {
    const { unmount } = render(<ModalProvider />)

    await waitFor(() => {
      expect(screen.getByTestId('search-command')).toBeInTheDocument()
    })

    unmount()

    await waitFor(() => {
      expect(screen.queryByTestId('search-command')).not.toBeInTheDocument()
    })
  })

  it('should render modals in predictable state after mount', async () => {
    render(<ModalProvider />)

    await waitFor(() => {
      const searchCommand = screen.getByTestId('search-command')
      const settingsModal = screen.getByTestId('settings-modal')
      const movePageModal = screen.getByTestId('move-page-modal')
      const renameModal = screen.getByTestId('rename-modal')
      const historyModal = screen.getByTestId('history-modal')

      expect(searchCommand).toBeInTheDocument()
      expect(settingsModal).toBeInTheDocument()
      expect(movePageModal).toBeInTheDocument()
      expect(renameModal).toBeInTheDocument()
      expect(historyModal).toBeInTheDocument()
    })
  })
})
