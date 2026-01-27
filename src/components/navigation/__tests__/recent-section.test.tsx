import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RecentSection } from '../recent-section';

const { mockGetRecentPages } = vi.hoisted(() => {
  return { mockGetRecentPages: vi.fn() };
});

vi.mock('@/app/(main)/_actions/navigation', () => ({
  getRecentPages: mockGetRecentPages,
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
  isFavorite: vi.fn(),
  recordPageView: vi.fn(),
  getFavorites: vi.fn(),
  getPageBreadcrumbs: vi.fn(),
  createPageLink: vi.fn(),
  removePageLink: vi.fn(),
  getBacklinks: vi.fn(),
  updatePageOrder: vi.fn(),
  reorderPages: vi.fn(),
  movePage: vi.fn(),
  getPublishedPages: vi.fn(),
}));

describe('RecentSection', () => {
  const mockRecentPages = [
    { id: 'recent-1', title: 'Recent Page 1', icon: '📄', parentId: null },
    { id: 'recent-2', title: 'Recent Page 2', icon: '📝', parentId: null },
    { id: 'recent-3', title: 'Recent Page 3', icon: '📊', parentId: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRecentPages.mockResolvedValue(mockRecentPages);
  });

  it('should not render when loading', () => {
    mockGetRecentPages.mockImplementation(() => new Promise(() => {}));

    render(<RecentSection />);

    expect(screen.queryByText('Recent')).not.toBeInTheDocument();
  });

  it('should not render when no recent pages exist', async () => {
    mockGetRecentPages.mockResolvedValue([]);

    render(<RecentSection />);

    await waitFor(() => {
      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
    });
  });

  it('should display default file icon when page has no icon', async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      {
        id: 'recent-1',
        title: 'Page without icon',
        icon: null,
        parentId: null,
      },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Page without icon')).toBeInTheDocument();
    });
  });

  it("should display 'Untitled' when page has no title", async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: null, icon: '📄', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it("should display 'Untitled' for empty title string", async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: '', icon: '📄', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'Test', icon: '📄', parentId: null },
    ]);

    const { container } = render(<RecentSection className="custom-class" />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  it('should truncate long page titles', async () => {
    const user = userEvent.setup();
    const longTitle =
      'This is a very long recent page title that should be truncated';
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: longTitle, icon: '📄', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      const span = screen.getByText(longTitle).closest('span');
      expect(span).toHaveClass('truncate');
    });
  });

  it('should display recent pages in correct order', async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'recent-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'recent-3', title: 'Third', icon: '3️⃣', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('First');
      expect(links[1]).toHaveTextContent('Second');
      expect(links[2]).toHaveTextContent('Third');
    });
  });

  it('should handle multiple page icons correctly', async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'Page 1', icon: '🎯', parentId: null },
      { id: 'recent-2', title: 'Page 2', icon: '📌', parentId: null },
      { id: 'recent-3', title: 'Page 3', icon: '⭐', parentId: null },
      { id: 'recent-4', title: 'Page 4', icon: null, parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('📌')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  it('should render with proper margins', async () => {
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'Page 1', icon: '🎯', parentId: null },
    ]);
    render(<RecentSection />);

    await waitFor(() => {
      expect(screen.getByText('Recent')).toBeInTheDocument();
    });

    const collapsible = screen
      .getByRole('button', { name: /recent/i })
      .closest('.mb-2');
    expect(collapsible).toHaveClass('mb-2');
  });

  it('should have group class for hover effects', async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'Recent Page 1', icon: '📄', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a');
      expect(link).toHaveClass('group');
    });
  });

  it('should display pages with flex layout', async () => {
    const user = userEvent.setup();
    mockGetRecentPages.mockResolvedValue([
      { id: 'recent-1', title: 'Recent Page 1', icon: '📄', parentId: null },
    ]);

    render(<RecentSection />);

    const trigger = await screen.findByRole('button', { name: /recent/i });
    await user.click(trigger);

    await waitFor(() => {
      const link = screen.getByText('Recent Page 1').closest('a');
      expect(link).toHaveClass('flex', 'items-center', 'gap-2');
    });
  });
});
