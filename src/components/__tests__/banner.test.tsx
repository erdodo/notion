import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Banner } from "@/components/banner";
import { restoreDocument, removeDocument } from "@/app/(main)/_actions/documents";

// Mocks
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        promise: vi.fn(),
    },
}));

vi.mock("@/app/(main)/_actions/documents", () => ({
    restoreDocument: vi.fn(),
    removeDocument: vi.fn(),
}));

// Mock ConfirmModal to execute onConfirm immediately for testing
vi.mock("@/components/modals/confirm-modal", () => ({
    ConfirmModal: ({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) => (
        <div onClick={onConfirm}>{children}</div>
    ),
}));

describe("Banner", () => {
    const documentId = "doc-123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders correct text", () => {
        render(<Banner documentId={documentId} />);
        expect(screen.getByText("This page is in the Trash.")).toBeInTheDocument();
        expect(screen.getByText("Restore page")).toBeInTheDocument();
        expect(screen.getByText("Delete forever")).toBeInTheDocument();
    });

    it("calls restoreDocument on restore click", async () => {
        (restoreDocument as any).mockResolvedValue(true);
        render(<Banner documentId={documentId} />);

        const restoreBtn = screen.getByText("Restore page");
        await act(async () => {
            fireEvent.click(restoreBtn);
        });

        expect(restoreDocument).toHaveBeenCalledWith(documentId);
    });

    it("calls removeDocument and redirects on delete confirm", async () => {
        (removeDocument as any).mockResolvedValue(true);
        render(<Banner documentId={documentId} />);

        const deleteBtn = screen.getByText("Delete forever"); // Wrapped in ConfirmModal mock
        await act(async () => {
            fireEvent.click(deleteBtn);
        });

        expect(removeDocument).toHaveBeenCalledWith(documentId);

        // Wait for promise resolution chain
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/documents");
        });
    });
});
