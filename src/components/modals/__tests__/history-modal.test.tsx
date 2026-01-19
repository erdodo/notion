import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryModal } from '../history-modal'
import { useHistory } from '@/hooks/use-history'
import * as actions from '@/app/(main)/_actions/documents'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/hooks/use-history')
vi.mock('@/app/(main)/_actions/documents')
vi.mock('sonner')
vi.mock('@/components/editor/blocknote-editor', () => ({
  BlockNoteEditorComponent: () => <div>Editor Mock</div>,
}))

describe('HistoryModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useHistory as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      documentId: null,
    })
  })

  it('should not render when history modal is closed', () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      documentId: null,
    })

    render(<HistoryModal />)

    expect(screen.queryByText('Page History')).not.toBeInTheDocument()
  })

  it('should render modal when history is open', async () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue([])

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument()
    })
  })

  it('should fetch history when modal opens', async () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue([])

    render(<HistoryModal />)

    await waitFor(() => {
      expect(actions.getPageHistory).toHaveBeenCalledWith('doc-123')
    })
  })

  it('should display loading state while fetching history', () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<HistoryModal />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display version list with timestamps', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
      {
        id: 'v2',
        savedAt: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Jane Smith', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('should select first version by default', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      const versionItem = screen.getByText('John Doe').closest('div')
      expect(versionItem).toHaveClass('bg-secondary')
    })
  })

  it('should select version on click', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'Version 1', image: null },
      },
      {
        id: 'v2',
        savedAt: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Version 2', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument()
    })

    const version2 = screen.getByText('Version 2')
    await userEvent.click(version2)

    await waitFor(() => {
      const selectedItem = version2.closest('div')
      expect(selectedItem).toHaveClass('bg-secondary')
    })
  })

  it('should show restore button', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restore this version/i })).toBeInTheDocument()
    })
  })

  it('should disable restore button when no version selected', () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue([])

    render(<HistoryModal />)

    const restoreButton = screen.getByRole('button', { name: /restore this version/i })
    expect(restoreButton).toBeDisabled()
  })

  it('should call restorePage when restore button is clicked', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)
    ;(actions.restorePage as any).mockResolvedValue({})

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restore this version/i })).toBeInTheDocument()
    })

    const restoreButton = screen.getByRole('button', { name: /restore this version/i })
    await userEvent.click(restoreButton)

    await waitFor(() => {
      expect(actions.restorePage).toHaveBeenCalledWith('doc-123', 'v1')
    })
  })

  it('should show success toast and close on successful restore', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)
    ;(actions.restorePage as any).mockResolvedValue({})

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restore this version/i })).toBeInTheDocument()
    })

    const restoreButton = screen.getByRole('button', { name: /restore this version/i })
    await userEvent.click(restoreButton)

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show error toast on restore failure', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)
    ;(actions.restorePage as any).mockRejectedValue(new Error('Restore failed'))

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restore this version/i })).toBeInTheDocument()
    })

    const restoreButton = screen.getByRole('button', { name: /restore this version/i })
    await userEvent.click(restoreButton)

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
  })

  it('should display "No history found" when empty', async () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue([])

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('No history found.')).toBeInTheDocument()
    })
  })

  it('should show error message if history fetch fails', async () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockRejectedValue(new Error('Failed'))

    render(<HistoryModal />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load history')
    })
  })

  it('should display editor preview for selected version', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('Editor Mock')).toBeInTheDocument()
    })
  })

  it('should handle multiple versions with different users', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'Alice', image: null },
      },
      {
        id: 'v2',
        savedAt: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Bob', image: null },
      },
      {
        id: 'v3',
        savedAt: new Date(Date.now() - 7200000).toISOString(),
        user: { name: 'Charlie', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })

  it('should show preview text when no version is selected', () => {
    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue([])

    render(<HistoryModal />)

    expect(screen.getByText('Select a version')).toBeInTheDocument()
  })

  it('should show preview text when version is selected', async () => {
    const mockVersions = [
      {
        id: 'v1',
        savedAt: new Date().toISOString(),
        user: { name: 'John Doe', image: null },
      },
    ]

    ;(useHistory as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
    })

    ;(actions.getPageHistory as any).mockResolvedValue(mockVersions)

    render(<HistoryModal />)

    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })
  })
})
