import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FavoriteButton } from "@/components/favorite-button";
import { isFavorite, addToFavorites, removeFromFavorites } from "@/app/(main)/_actions/navigation";

// Mocks
vi.mock("@/app/(main)/_actions/navigation", () => ({
    isFavorite: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
}));

vi.mock("@/hooks/use-context-menu", () => ({
    useContextMenu: () => ({ onContextMenu: vi.fn() }),
}));

describe("FavoriteButton", () => {
    const pageId = "p1";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders nothing while loading", () => {
        (isFavorite as any).mockReturnValue(new Promise(() => { }));
        const { container } = render(<FavoriteButton pageId={pageId} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders filled star if favorited", async () => {
        (isFavorite as any).mockResolvedValue(true);
        render(<FavoriteButton pageId={pageId} />);

        await waitFor(() => {
            expect(screen.getByLabelText("Remove from favorites")).toBeInTheDocument();
            const star = screen.getByLabelText("Remove from favorites").querySelector(".fill-yellow-400");
            expect(star).toBeInTheDocument();
        });
    });

    it("toggles favorite status on click", async () => {
        (isFavorite as any).mockResolvedValue(false);
        render(<FavoriteButton pageId={pageId} />);

        await waitFor(() => {
            expect(screen.getByLabelText("Add to favorites")).toBeInTheDocument();
        });

        const btn = screen.getByLabelText("Add to favorites");
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(addToFavorites).toHaveBeenCalledWith(pageId);

        // Test remove
        // (Simulating state flip would require rerender or waiting for state update depending on impl)
        // The component optimistically updates local state.
        expect(screen.getByLabelText("Remove from favorites")).toBeInTheDocument();
    });
});
