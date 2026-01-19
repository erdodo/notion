import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrashBox } from "@/components/trash-box";
import { restoreDocument, removeDocument } from "@/app/(main)/_actions/documents";

// Mocks
vi.mock("@/app/(main)/_actions/documents", () => ({
    restoreDocument: vi.fn(),
    removeDocument: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: { promise: vi.fn() }
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn()
    })
}));

vi.mock("@/components/modals/confirm-modal", () => ({
    ConfirmModal: ({ children, onConfirm }: any) => (
        <div onClick={(e) => { e.stopPropagation(); onConfirm(); }}>{children}</div>
    )
}));

describe("TrashBox", () => {
    const documents = [
        { id: "1", title: "Page 1", isArchived: true },
        { id: "2", title: "Page 2", isArchived: true }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders document list", () => {
        render(<TrashBox documents={documents} />);
        expect(screen.getByText("Page 1")).toBeInTheDocument();
        expect(screen.getByText("Page 2")).toBeInTheDocument();
    });

    it("filters documents", async () => {
        render(<TrashBox documents={documents} />);
        const input = screen.getByPlaceholderText("Filter by page title...");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Page 1" } });
        });

        expect(screen.getByText("Page 1")).toBeInTheDocument();
        expect(screen.queryByText("Page 2")).not.toBeInTheDocument();
    });

    it("restores document", async () => {
        (restoreDocument as any).mockResolvedValue(true);
        render(<TrashBox documents={documents} />);

        // Find restore button for Page 1. 
        // Structure: Row -> Content -> Actions -> Restore(Undo icon)
        // We can rely on looking for rows.
        // Simpler: getAllByRole('button') logic, assuming first undo belongs to first item.
        // Or we render one doc for simplicity.
        const btns = screen.getAllByRole("button");
        // Row 1 Restore is likely index 0 if confirming order.
        // Let's use specific selector via container related if needed.
        // Since input is secondary, maybe buttons are first actionables? Actually input is first.
        // Let's look for icon presence conceptually.

        // Proper way: `const restoreBtn = ...`
        // Since we mock Undo icon as null/svg.

        // We will just assume buttons.
        // Each row has 2 buttons: Restore, Remove (wrapped in Confirm).
        // Page 1 is first.

        // Click Restore (first button of first row)
        // Actually the mock infrastructure for icons is real lucide here unless optimized.
        // Let's rely on finding buttons inside the list item text "Page 1" container if possible.

        const page1Text = screen.getByText("Page 1");
        const row = page1Text.closest(".flex.justify-between"); // Parent div
        const restoreBtn = row?.querySelector("button");

        await act(async () => {
            fireEvent.click(restoreBtn!);
        });

        expect(restoreDocument).toHaveBeenCalledWith("1");
    });

    it("removes document permanently", async () => {
        (removeDocument as any).mockResolvedValue(true);
        render(<TrashBox documents={documents} />);

        const page1Text = screen.getByText("Page 1");
        const row = page1Text.closest(".flex.justify-between");
        const buttons = row?.querySelectorAll("button");
        // 2nd button is remove (Confirmation Modal trigger)
        const removeTrigger = buttons![1]; // wrapped in div for confirm modal mock? No, confirm modal mock wraps button.

        // ConfirmModal Mock: <div onClick={onConfirm}>{children}</div>
        // So `buttons![1]` is the button INSIDE the div. 
        // Clicking the button propagates to the DIV which has the handler (in our mock).
        // Or we click the button, bubbling happens?
        // Wait, mock structure: 
        // <div onClick=...> <button>Trash</button> </div>
        // querySelectorAll("button") finds the inner button.
        // Clicking it bubbles to div.

        await act(async () => {
            fireEvent.click(removeTrigger);
        });

        expect(removeDocument).toHaveBeenCalledWith("1");
    });
});
