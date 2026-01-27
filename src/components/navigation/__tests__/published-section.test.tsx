import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PublishedSection } from '../published-section';

const { mockGetPublishedPages } = vi.hoisted(() => {
  return { mockGetPublishedPages: vi.fn() };
});

vi.mock('@/app/(main)/_actions/navigation', () => ({
  getPublishedPages: mockGetPublishedPages,
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
  isFavorite: vi.fn(),
  recordPageView: vi.fn(),
  getRecentPages: vi.fn(),
  getPageBreadcrumbs: vi.fn(),
  createPageLink: vi.fn(),
  removePageLink: vi.fn(),
  getBacklinks: vi.fn(),
  updatePageOrder: vi.fn(),
  reorderPages: vi.fn(),
  movePage: vi.fn(),
  getFavorites: vi.fn(),
}));

describe('PublishedSection', () => {
  const mockPublishedPages = [
    { id: 'pub-1', title: 'Published Page 1', icon: '🌐', parentId: null },
    { id: 'pub-2', title: 'Published Page 2', icon: '📡', parentId: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublishedPages.mockResolvedValue(mockPublishedPages);
  });

  it('should not render when loading', () => {
    mockGetPublishedPages.mockImplementation(() => new Promise(() => {}));

    render(<PublishedSection />);

    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });

  it('should not render when no published pages exist', async () => {
    mockGetPublishedPages.mockResolvedValue([]);

    render(<PublishedSection />);

    await waitFor(() => {
      expect(screen.queryByText('Published')).not.toBeInTheDocument();
    });
  });

  it('should display default file icon when page has no icon', async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: 'Page without icon', icon: null, parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Page without icon')).toBeInTheDocument();
    });
  });

  it("should display 'Untitled' when page has no title", async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: null, icon: '🌐', parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it("should display 'Untitled' for empty title string", async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: '', icon: '🌐', parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: 'Test', icon: '🌐', parentId: null },
    ]);

    const { container } = render(<PublishedSection className="custom-class" />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  it('should truncate long page titles', async () => {
    const user = userEvent.setup();
    const longTitle =
      'This is a very long published page title that should be truncated';
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: longTitle, icon: '🌐', parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      const span = screen.getByText(longTitle).closest('span');
      expect(span).toHaveClass('truncate');
    });
  });

  it('should display published pages in correct order', async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'pub-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'pub-3', title: 'Third', icon: '3️⃣', parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('First');
      expect(links[1]).toHaveTextContent('Second');
      expect(links[2]).toHaveTextContent('Third');
    });
  });

  it('should handle multiple published pages correctly', async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: 'Page 1', icon: '🎯', parentId: null },
      { id: 'pub-2', title: 'Page 2', icon: '📌', parentId: null },
      { id: 'pub-3', title: 'Page 3', icon: '⭐', parentId: null },
      { id: 'pub-4', title: 'Page 4', icon: '🚀', parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('📌')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });
  });

  it('should handle pages with various icon types', async () => {
    const user = userEvent.setup();
    mockGetPublishedPages.mockResolvedValue([
      { id: 'pub-1', title: 'Text Icon', icon: '📄', parentId: null },
      { id: 'pub-2', title: 'Image Icon', icon: '🖼️', parentId: null },
      { id: 'pub-3', title: 'Video Icon', icon: '🎬', parentId: null },
      { id: 'pub-4', title: 'No Icon', icon: null, parentId: null },
    ]);

    render(<PublishedSection />);

    const trigger = await screen.findByRole('button', { name: /published/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeInTheDocument();
      expect(screen.getByText('🖼️')).toBeInTheDocument();
      expect(screen.getByText('🎬')).toBeInTheDocument();
    });
  });
});
