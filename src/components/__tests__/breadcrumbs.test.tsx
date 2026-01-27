import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getPageBreadcrumbs } from '@/app/(main)/_actions/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';

vi.mock('@/app/(main)/_actions/navigation', () => ({
  getPageBreadcrumbs: vi.fn(),
}));

vi.mock('@/hooks/use-context-menu', () => ({
  useContextMenu: () => ({
    onContextMenu: vi.fn(),
  }),
}));

describe('Breadcrumbs', () => {
  const pageId = 'page-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (getPageBreadcrumbs as any).mockReturnValue(new Promise(() => {}));
    const { container } = render(<Breadcrumbs pageId={pageId} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders nothing if empty list', async () => {
    (getPageBreadcrumbs as any).mockResolvedValue([]);
    const { container } = render(<Breadcrumbs pageId={pageId} />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders breadcrumb items', async () => {
    (getPageBreadcrumbs as any).mockResolvedValue([
      { id: 'root', title: 'Root Page', icon: '🏠' },
      { id: 'child', title: 'Child Page', icon: null },
    ]);

    render(<Breadcrumbs pageId={pageId} />);

    await waitFor(() => {
      expect(screen.getByText('Root Page')).toBeInTheDocument();
      expect(screen.getByText('Child Page')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
    });

    const container = screen.getByLabelText('Breadcrumb');
    expect(container.querySelectorAll('.lucide-chevron-right')).toHaveLength(2);
  });
});
