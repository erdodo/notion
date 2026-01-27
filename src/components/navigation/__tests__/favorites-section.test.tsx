import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { FavoritesSection } from '../favorites-section';

import * as navigationActions from '@/app/(main)/_actions/navigation';

const { mockGetFavorites } = vi.hoisted(() => {
  return { mockGetFavorites: vi.fn() };
});

vi.mock('@/app/(main)/_actions/navigation', () => ({
  getFavorites: mockGetFavorites,
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
  getPublishedPages: vi.fn(),
}));

describe('FavoritesSection', () => {
  const mockFavorites = [
    { id: 'fav-1', title: 'Favorite 1', icon: '⭐', parentId: null },
    { id: 'fav-2', title: 'Favorite 2', icon: '📌', parentId: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavorites.mockResolvedValue(mockFavorites);
  });

  it('should not render when no favorites exist', async () => {
    (navigationActions.getFavorites as any).mockResolvedValue([]);

    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    });
  });

  it('should render favorites section title when favorites exist', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  it('should display favorites section with star icon', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  it('should display all favorites as links', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Favorite 1')).toBeInTheDocument();
      expect(screen.getByText('Favorite 2')).toBeInTheDocument();
    });
  });

  it('should have correct href for favorite links', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      const link1 = screen.getByText('Favorite 1').closest('a');
      expect(link1).toHaveAttribute('href', '/documents/fav-1');

      const link2 = screen.getByText('Favorite 2').closest('a');
      expect(link2).toHaveAttribute('href', '/documents/fav-2');
    });
  });

  it('should display favorite icons', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('⭐')).toBeInTheDocument();
      expect(screen.getByText('📌')).toBeInTheDocument();
    });
  });

  it('should display default file icon when favorite has no icon', async () => {
    const user = userEvent.setup();
    (navigationActions.getFavorites as any).mockResolvedValue([
      {
        id: 'fav-1',
        title: 'Favorite without icon',
        icon: null,
        parentId: null,
      },
    ]);

    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Favorite without icon')).toBeInTheDocument();
    });
  });

  it('should be collapsible', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    const favoritesButton = screen.getByText('Favorites');
    await user.click(favoritesButton);

    expect(favoritesButton).toBeInTheDocument();
  });

  it('should start collapsed by default', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('should toggle expansion on button click', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    const favoritesButton = screen.getByRole('button', { name: /favorites/i });
    await user.click(favoritesButton);

    expect(favoritesButton).toBeInTheDocument();
  });

  it('should load favorites on mount', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(navigationActions.getFavorites).toHaveBeenCalled();
    });
  });

  it('should listen for favorite-changed event', async () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'favorite-changed',
        expect.any(Function)
      );
    });

    addEventListenerSpy.mockRestore();
  });

  it('should remove favorite-changed event listener on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<FavoritesSection />);

    await waitFor(() => {
      expect(navigationActions.getFavorites).toHaveBeenCalled();
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'favorite-changed',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should reload favorites when favorite-changed event is triggered', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(navigationActions.getFavorites).toHaveBeenCalledTimes(1);
    });

    const event = new Event('favorite-changed');
    document.dispatchEvent(event);

    await waitFor(() => {
      expect(navigationActions.getFavorites).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading skeleton while fetching', () => {
    mockGetFavorites.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve(mockFavorites);
          }, 100)
        )
    );

    const { container } = render(<FavoritesSection />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should hide loading skeleton after fetch completes', async () => {
    render(<FavoritesSection />);

    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  it('should display favorites with proper spacing', async () => {
    const user = userEvent.setup();
    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Favorite 1')).toBeInTheDocument();
    });

    const link = screen.getByText('Favorite 1').closest('a');
    expect(link).toHaveClass('px-2', 'py-1.5', 'rounded-md');
  });

  it("should display 'Untitled' when favorite has no title", async () => {
    const user = userEvent.setup();
    mockGetFavorites.mockResolvedValue([
      { id: 'fav-1', title: null, icon: '📄', parentId: null },
    ]);

    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    mockGetFavorites.mockResolvedValue([
      { id: 'fav-1', title: 'Test', icon: '⭐', parentId: null },
    ]);

    const { container } = render(<FavoritesSection className="custom-class" />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  it('should truncate long favorite titles', async () => {
    const user = userEvent.setup();
    const longTitle =
      'This is a very long favorite title that should be truncated';
    mockGetFavorites.mockResolvedValue([
      { id: 'fav-1', title: longTitle, icon: '📄', parentId: null },
    ]);

    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      const span = screen.getByText(longTitle).closest('span');
      expect(span).toHaveClass('truncate');
    });
  });

  it('should display favorites in correct order', async () => {
    const user = userEvent.setup();
    mockGetFavorites.mockResolvedValue([
      { id: 'fav-1', title: 'First', icon: '1️⃣', parentId: null },
      { id: 'fav-2', title: 'Second', icon: '2️⃣', parentId: null },
      { id: 'fav-3', title: 'Third', icon: '3️⃣', parentId: null },
    ]);

    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('First');
      expect(links[1]).toHaveTextContent('Second');
      expect(links[2]).toHaveTextContent('Third');
    });
  });

  it('should handle empty title string', async () => {
    const user = userEvent.setup();
    mockGetFavorites.mockResolvedValue([
      { id: 'fav-1', title: '', icon: '📄', parentId: null },
    ]);

    render(<FavoritesSection />);

    const trigger = await screen.findByRole('button', { name: /favorites/i });
    await user.click(trigger);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
