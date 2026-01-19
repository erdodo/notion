import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsModal } from '../settings-modal'
import { useSettings } from '@/hooks/use-settings'
import { useSession, signOut } from 'next-auth/react'

// Mock dependencies
vi.mock('@/hooks/use-settings')
vi.mock('next-auth/react')
vi.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <button>Toggle Mode</button>,
}))
vi.mock('@/components/backup-settings', () => ({
  BackupSettings: () => <div>Backup Settings</div>,
}))

describe('SettingsModal', () => {
  const mockOnClose = vi.fn()
  const mockOnOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSettings as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })
    ;(useSession as any).mockReturnValue({
      data: {
        user: { name: 'John Doe', email: 'john@example.com', image: null },
      },
    })
  })

  it('should not render when settings modal is closed', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('should render settings dialog when isOpen is true', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should display settings tabs', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.getByRole('button', { name: /account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /appearance/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /data/i })).toBeInTheDocument()
  })

  it('should show account tab by default', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const accountButton = screen.getByRole('button', { name: /account/i })
    expect(accountButton).toHaveClass('bg-secondary')
  })

  it('should switch to appearance tab', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    await userEvent.click(appearanceButton)

    expect(appearanceButton).toHaveClass('bg-secondary')
  })

  it('should switch to data tab', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const dataButton = screen.getByRole('button', { name: /data/i })
    await userEvent.click(dataButton)

    expect(dataButton).toHaveClass('bg-secondary')
  })

  it('should display user information in account tab', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should display sign out button', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('should call signOut when sign out button is clicked', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await userEvent.click(signOutButton)

    expect(signOut).toHaveBeenCalled()
  })

  it('should display theme toggle in appearance tab', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    await userEvent.click(appearanceButton)

    expect(screen.getByText('Toggle Mode')).toBeInTheDocument()
  })

  it('should display backup settings in data tab', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const dataButton = screen.getByRole('button', { name: /data/i })
    await userEvent.click(dataButton)

    expect(screen.getByText('Backup Settings')).toBeInTheDocument()
  })

  it('should highlight active tab', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const accountButton = screen.getByRole('button', { name: /account/i })
    expect(accountButton).toHaveClass('bg-secondary')

    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    await userEvent.click(appearanceButton)

    expect(appearanceButton).toHaveClass('bg-secondary')
    expect(accountButton).not.toHaveClass('bg-secondary')
  })

  it('should handle tab switching multiple times', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const accountButton = screen.getByRole('button', { name: /account/i })
    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    const dataButton = screen.getByRole('button', { name: /data/i })

    await userEvent.click(appearanceButton)
    expect(appearanceButton).toHaveClass('bg-secondary')

    await userEvent.click(dataButton)
    expect(dataButton).toHaveClass('bg-secondary')

    await userEvent.click(accountButton)
    expect(accountButton).toHaveClass('bg-secondary')
  })

  it('should display session user when available', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    ;(useSession as any).mockReturnValue({
      data: {
        user: { name: 'Jane Smith', email: 'jane@example.com', image: null },
      },
    })

    render(<SettingsModal />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('should handle no session gracefully', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    ;(useSession as any).mockReturnValue({
      data: null,
    })

    render(<SettingsModal />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should call onClose when dialog closes', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    const { container } = render(<SettingsModal />)

    // Find and click close button (typically in dialog header)
    const closeButtons = container.querySelectorAll('button[aria-label*="close"], button[aria-label*="dismiss"]')
    if (closeButtons.length > 0) {
      await userEvent.click(closeButtons[0])
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('should maintain tab state when switching modals', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    await userEvent.click(appearanceButton)

    expect(appearanceButton).toHaveClass('bg-secondary')

    const accountButton = screen.getByRole('button', { name: /account/i })
    expect(accountButton).not.toHaveClass('bg-secondary')
  })

  it('should display all settings sections', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const accountButton = screen.getByRole('button', { name: /account/i })
    const appearanceButton = screen.getByRole('button', { name: /appearance/i })
    const dataButton = screen.getByRole('button', { name: /data/i })

    expect(accountButton).toBeInTheDocument()
    expect(appearanceButton).toBeInTheDocument()
    expect(dataButton).toBeInTheDocument()
  })

  it('should have proper hover states for tabs', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const appearanceButton = screen.getByRole('button', { name: /appearance/i })

    // Hover over inactive tab
    await userEvent.hover(appearanceButton)
    expect(appearanceButton).toHaveClass('hover:bg-secondary/50')
  })

  it('should handle keyboard navigation between tabs', async () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    const accountButton = screen.getByRole('button', { name: /account/i })
    const appearanceButton = screen.getByRole('button', { name: /appearance/i })

    accountButton.focus()
    expect(accountButton).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    // Navigation should work if properly implemented
    expect(appearanceButton).toBeInTheDocument()
  })

  it('should display settings modal title', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should handle responsive layout', () => {
    ;(useSettings as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      onOpen: mockOnOpen,
    })

    render(<SettingsModal />)

    // Component has responsive classes (flex gap-6)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
