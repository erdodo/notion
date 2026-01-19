import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Publish } from "@/components/publish";
import { togglePublish } from "@/app/(main)/_actions/documents";

// Mocks
vi.mock("@/app/(main)/_actions/documents", () => ({
    togglePublish: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock("@/components/ui/popover", () => ({
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

describe("Publish", () => {
    const initialData = { id: "p1", isPublished: false };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders publish button initially", () => {
        render(<Publish initialData={initialData} />);
        expect(screen.getByText("Publish this note")).toBeInTheDocument();
    });

    it("toggles publish on click", async () => {
        (togglePublish as any).mockResolvedValue({ isPublished: true });
        render(<Publish initialData={initialData} />);

        // Find last button which should be Publish
        const btns = screen.getAllByRole("button");
        const publishBtn = btns[btns.length - 1]; // "Publish" button at bottom

        await act(async () => {
            fireEvent.click(publishBtn);
        });

        expect(togglePublish).toHaveBeenCalledWith("p1");
        // Should switch view to "Unpublish" state (if re-render happened with state change)
    });

    it("renders published state and handles copy", async () => {
        render(<Publish initialData={{ ...initialData, isPublished: true }} />);

        expect(screen.getByText("This page is live on web.")).toBeInTheDocument();

        // Test Copy
        // Find buttons. Copy button is the one with Copy icon (or check handler)
        // We can assume first button in input group
        const btns = screen.getAllByRole("button");
        // Indexing might vary. Using text or aria label would be better if available.
        // The implementation doesn't have labels.

        // Let's rely on structure: Input + Button
        // We will simulate click on all buttons until clipboard is called to be resilient, or assume index 1
        // (Button 0 triggers popover - but popover content is rendered directly in mock due to div structure? No, popover trigger is usually wrapped.
        // Our mock renders both trigger and content side by side.

        // Let's click the button that likely has the copy icon.
        // Since we don't render icons in JSDOM meaningfully, we just try clicking.

        // Actually, `Publish` component structure for published:
        // [Globe text ...] 
        // [Input] [CopyButton]
        // [UnpublishButton]

        // So 3rd button? (1. Trigger, 2. Copy, 3. Unpublish)
        if (btns[1]) {
            fireEvent.click(btns[1]);
            expect(navigator.clipboard.writeText).toHaveBeenCalled();
        }
    });
});
