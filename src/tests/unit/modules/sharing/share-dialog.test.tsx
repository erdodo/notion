import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareDialog } from '@/components/share-dialog'
import { vi, describe, it, expect } from 'vitest'
import * as SharingActions from '@/app/(main)/_actions/sharing'

// Mock Actions
vi.mock('@/app/(main)/_actions/sharing', () => ({
    getPageShares: vi.fn(),
    sharePage: vi.fn(),
    updateShareRole: vi.fn(),
    removeShare: vi.fn(),
    createGuestLink: vi.fn(),
}))

// Mock UI Components
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/switch', () => ({
    Switch: ({ checked, onCheckedChange }: any) => (
        <input
            type="checkbox"
            data-testid="publish-switch"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
        />
    )
}))

// Mock Icons
vi.mock('lucide-react', () => ({
    Globe: () => <div />,
    Lock: () => <div />,
    Copy: () => <div />,
    Check: () => <div />,
    Link: () => <div />,
    Users: () => <div />,
    X: () => <div />,
    Loader2: () => <div />,
    ChevronDown: () => <div />,
    ChevronUp: () => <div />,
}))

describe('ShareDialog', () => {
    const defaultProps = {
        pageId: '123',
        pageTitle: 'Test Page',
        isPublished: false,
        isOpen: true,
        onClose: vi.fn(),
        onPublishChange: vi.fn(),
    }

    it('renders dialog content', () => {
        vi.mocked(SharingActions.getPageShares).mockResolvedValue([])
        render(<ShareDialog {...defaultProps} />)
        expect(screen.getByText('Share "Test Page"')).toBeInTheDocument()
        expect(screen.getByText('Invite people')).toBeInTheDocument()
    })

    it('displays private status when not published', () => {
        vi.mocked(SharingActions.getPageShares).mockResolvedValue([])
        render(<ShareDialog {...defaultProps} />)
        expect(screen.getByText('Private')).toBeInTheDocument()
    })

    it('calls onPublishChange when switch is toggled', () => {
        vi.mocked(SharingActions.getPageShares).mockResolvedValue([])
        render(<ShareDialog {...defaultProps} />)

        const switchEl = screen.getByTestId('publish-switch')
        fireEvent.click(switchEl)

        expect(defaultProps.onPublishChange).toHaveBeenCalledWith(true)
    })
})
