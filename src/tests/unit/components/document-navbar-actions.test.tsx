import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DocumentNavbarActions } from "@/components/document-navbar-actions";
import { togglePublish } from "@/app/(main)/_actions/documents";
import { getCommentCount } from "@/app/(main)/_actions/comments";

// Mocks
vi.mock("@/app/(main)/_actions/documents", () => ({
    togglePublish: vi.fn(),
}));

vi.mock("@/app/(main)/_actions/comments", () => ({
    getCommentCount: vi.fn(),
}));

vi.mock("@/components/share-dialog", () => ({
    ShareDialog: ({ isOpen, onPublishChange }: any) => (
        isOpen ? <div onClick={() => onPublishChange(true)}>Mock ShareDialog</div> : null
    ),
}));

vi.mock("@/components/comments/comments-panel", () => ({
    CommentsPanel: ({ isOpen }: any) => (
        isOpen ? <div>Mock CommentsPanel</div> : null
    ),
}));

vi.mock("@/components/presence-indicators", () => ({
    PresenceIndicators: () => <div>Mock Presence</div>,
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("DocumentNavbarActions", () => {
    const pageId = "page-1";

    beforeEach(() => {
        vi.clearAllMocks();
        (getCommentCount as any).mockResolvedValue(0);
    });

    it("renders buttons and indicators", async () => {
        render(<DocumentNavbarActions pageId={pageId} pageTitle="Test" isPublished={false} />);

        expect(screen.getByText("Mock Presence")).toBeInTheDocument();
    });

    it("opens comments panel on click", async () => {
        render(<DocumentNavbarActions pageId={pageId} pageTitle="Test" isPublished={false} />);

        // Find comments button (lucide-message-square usually inside a button)
        // We can rely on button indexing or class if aria-label missing.
        // The code structure has 2 buttons. 2nd one is comments.
        const buttons = screen.getAllByRole("button");
        const commentsBtn = buttons[1];

        await act(async () => {
            fireEvent.click(commentsBtn);
        });

        expect(screen.getByText("Mock CommentsPanel")).toBeInTheDocument();
    });

    it("handlePublishChange updates state and calls action", async () => {
        (togglePublish as any).mockResolvedValue({ isPublished: true });

        render(<DocumentNavbarActions pageId={pageId} pageTitle="Test" isPublished={false} />);
        const buttons = screen.getAllByRole("button");
        const shareBtn = buttons[0];

        await act(async () => {
            fireEvent.click(shareBtn); // Opens ShareDialog mock
        });

        const mockDialog = screen.getByText("Mock ShareDialog");
        await act(async () => {
            fireEvent.click(mockDialog); // Triggers onPublishChange(true) from mock
        });

        expect(togglePublish).toHaveBeenCalledWith(pageId);
    });
});
