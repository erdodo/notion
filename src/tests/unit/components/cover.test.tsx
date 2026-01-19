import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Cover } from "@/components/cover";
import { updateDocument } from "@/app/(main)/_actions/documents";

// Mocks
vi.mock("@/app/(main)/_actions/documents", () => ({
    updateDocument: vi.fn(),
}));

const mockDelete = vi.fn();
vi.mock("@/lib/edgestore", () => ({
    useEdgeStore: () => ({
        edgestore: {
            coverImages: {
                delete: mockDelete,
            },
        },
    }),
}));

vi.mock("@/hooks/use-context-menu", () => ({
    useContextMenu: () => ({
        onContextMenu: vi.fn(),
    }),
}));

// Mock Image
vi.mock("next/image", () => ({
    default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe("Cover", () => {
    const pageId = "page-1";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders nothing if no url", () => {
        const { container } = render(<Cover pageId={pageId} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders image if url provided", () => {
        render(<Cover pageId={pageId} url="http://example.com/cover.png" />);
        expect(screen.getByAltText("Cover")).toBeInTheDocument();
        expect(screen.getByText("Change cover")).toBeInTheDocument();
        expect(screen.getByText("Remove")).toBeInTheDocument();
    });

    it("does not render buttons in preview mode", () => {
        render(<Cover pageId={pageId} url="http://example.com/cover.png" preview />);
        // Buttons should not be present
        expect(screen.queryByText("Change cover")).not.toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
    });

    it("calls remove logic on click", async () => {
        render(<Cover pageId={pageId} url="https://files.edgestore.dev/my-image.png" />);

        const removeBtn = screen.getByText("Remove");
        await act(async () => {
            fireEvent.click(removeBtn);
        });

        // Should call edgestore delete
        expect(mockDelete).toHaveBeenCalledWith({ url: "https://files.edgestore.dev/my-image.png" });
        // Should update doc
        expect(updateDocument).toHaveBeenCalledWith(pageId, { coverImage: "" });
    });

    it("does not call edgestore delete for non-edgestore urls", async () => {
        render(<Cover pageId={pageId} url="http://external.com/image.png" />);

        const removeBtn = screen.getByText("Remove");
        await act(async () => {
            fireEvent.click(removeBtn);
        });

        expect(mockDelete).not.toHaveBeenCalled();
        expect(updateDocument).toHaveBeenCalledWith(pageId, { coverImage: "" });
    });
});
