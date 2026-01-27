import { render, screen, waitFor, act } from '@testing-library/react';

import { SharedSection } from '../shared-section';

import { getSharedDocuments } from '@/app/(main)/_actions/documents';

vi.mock('@/app/(main)/_actions/documents', () => ({
  getSharedDocuments: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('SharedSection', () => {
  const mockDocuments = [
    { id: '1', title: 'Doc 1', icon: '📄' },
    { id: '2', title: 'Doc 2', icon: '📝' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getSharedDocuments as any).mockResolvedValue(mockDocuments);
  });

  it('renders shared documents', async () => {
    render(<SharedSection />);

    await waitFor(() => {
      expect(screen.getByText('Doc 1')).toBeInTheDocument();
      expect(screen.getByText('Doc 2')).toBeInTheDocument();
    });
  });

  it("updates list when 'notion-document-update' event is dispatched", async () => {
    (getSharedDocuments as any).mockResolvedValueOnce([
      { id: '1', title: 'Doc 1' },
    ]);

    render(<SharedSection />);

    await waitFor(() => {
      expect(screen.getByText('Doc 1')).toBeInTheDocument();
    });
    (getSharedDocuments as any).mockResolvedValueOnce([]);

    await act(async () => {
      const event = new CustomEvent('notion-document-update', {
        detail: { id: '1' },
      });
      globalThis.dispatchEvent(event);
    });

    await waitFor(
      () => {
        expect(screen.queryByText('Doc 1')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
