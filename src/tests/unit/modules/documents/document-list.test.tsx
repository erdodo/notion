import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentList } from '@/app/(main)/_components/document-list'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as DocumentActions from '@/app/(main)/_actions/documents'

// Mock icons
vi.mock('lucide-react', () => ({
    FileText: () => <div data-testid="file-icon" />,
    Search: () => <div />,
    Plus: () => <div />,
    MoreHorizontal: () => <div />,
    Trash: () => <div />,
    ChevronRight: () => <div />,
    ChevronDown: () => <div />,
    Hash: () => <div />,
    Layout: () => <div />,
}))

// Mock router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    useParams: vi.fn(() => ({})),
    usePathname: vi.fn(() => ''),
}))

// Mock Utils
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: any[]) => inputs.join(' '),
}))

// Mock Actions
vi.mock('@/app/(main)/_actions/documents', () => ({
    getSidebarDocuments: vi.fn(),
    createDocument: vi.fn(),
    archiveDocument: vi.fn(),
}))

// Mock Item component to avoid deep rendering issues, although integration testing suggests real components, Item has many deps
// But for DocumentList logic, we want to see if it renders Items.
// Let's actually NOT mock Item to test interactions if possible, or mock it if it's too complex.
// The Item component imports many things. Let's shallow mock it for now to test list logic.
vi.mock('@/app/(main)/_components/item', () => ({
    Item: ({ title, onExpand, hasChildren, level }: any) => (
        <div data-testid="document-item" style={{ paddingLeft: level ? level * 12 : 0 }}>
            <span>{title}</span>
            {hasChildren && <button data-testid={`expand-${title}`} onClick={onExpand}>Expand</button>}
        </div>
    )
}))

describe('DocumentList', () => {
    it('renders "No pages inside" when data is empty', () => {
        render(<DocumentList data={[]} />)
        expect(screen.getByText('No pages inside')).toBeInTheDocument()
    })

    it('renders list of documents', () => {
        const docs = [
            { id: '1', title: 'Page 1', _count: { children: 0 } },
            { id: '2', title: 'Page 2', _count: { children: 1 } },
        ]
        render(<DocumentList data={docs as any} />)
        expect(screen.getByText('Page 1')).toBeInTheDocument()
        expect(screen.getByText('Page 2')).toBeInTheDocument()
    })

    it('fetches children on expand', async () => {
        const docs = [
            { id: '1', title: 'Parent', _count: { children: 1 } },
        ]
        const childDocs = [
            { id: '2', title: 'Child', _count: { children: 0 } }
        ]

        // Mock return value
        vi.mocked(DocumentActions.getSidebarDocuments).mockResolvedValue(childDocs as any)

        render(<DocumentList data={docs as any} />)

        const expandButton = screen.getByTestId('expand-Parent')
        fireEvent.click(expandButton)

        await waitFor(() => {
            expect(DocumentActions.getSidebarDocuments).toHaveBeenCalledWith('1')
            expect(screen.getByText('Child')).toBeInTheDocument()
        })
    })
})
