import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getBacklinks } from '@/app/(main)/_actions/navigation';
import { BacklinksPanel } from '@/components/backlinks-panel';

vi.mock('@/app/(main)/_actions/navigation', () => ({
  getBacklinks: vi.fn(),
}));

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open }: any) => (
    <div data-state={open ? 'open' : 'closed'}>{children}</div>
  ),
  CollapsibleTrigger: ({ children }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
}));

describe('BacklinksPanel', () => {
  const pageId = 'page-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (getBacklinks as any).mockReturnValue(new Promise(() => {}));
    const { container } = render(<BacklinksPanel pageId={pageId} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state (null) if no backlinks', async () => {
    (getBacklinks as any).mockResolvedValue([]);
    const { container } = render(<BacklinksPanel pageId={pageId} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders list of backlinks when data is present', async () => {
    (getBacklinks as any).mockResolvedValue([
      { pageId: 'b1', title: 'Backlink 1', icon: '🔗' },
      { pageId: 'b2', title: 'Backlink 2', icon: null },
    ]);

    render(<BacklinksPanel pageId={pageId} />);

    await waitFor(() => {
      expect(screen.getByText('2 Backlinks')).toBeInTheDocument();
      expect(screen.getByText('Backlink 1')).toBeInTheDocument();
      expect(screen.getByText('Backlink 2')).toBeInTheDocument();
      expect(screen.getByText('🔗')).toBeInTheDocument();
      expect(screen.getByText('📄')).toBeInTheDocument();
    });
  });
});
