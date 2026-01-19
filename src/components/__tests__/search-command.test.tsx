import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchCommand } from "@/components/search-command";
import { searchPages } from "@/actions/page";
import { createDocument } from "@/app/(main)/_actions/documents";
import { createDatabase } from "@/app/(main)/_actions/database";
// import { useSearch } from "@/hooks/use-search"; // Mocked below

vi.mock("use-debounce", () => ({
    useDebounce: (val: any) => [val]
}));

// Mocks
vi.mock("@/actions/page", () => ({ searchPages: vi.fn() }));
vi.mock("@/app/(main)/_actions/documents", () => ({ createDocument: vi.fn() }));
vi.mock("@/app/(main)/_actions/database", () => ({ createDatabase: vi.fn() }));

const mockSession = { data: { user: { id: "u1" } } };
vi.mock("next-auth/react", () => ({
    useSession: () => mockSession,
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

const { mockToggle, mockOnClose, mockSearchStore } = vi.hoisted(() => ({
    mockToggle: vi.fn(),
    mockOnClose: vi.fn(),
    mockSearchStore: {
        isOpen: true
    }
}));

vi.mock("@/hooks/use-search", () => ({
    useSearch: (selector: any) => selector({
        toggle: mockToggle,
        isOpen: mockSearchStore.isOpen,
        onClose: mockOnClose,
    }),
}));

// Mock CMDK (ui/command)
vi.mock("@/components/ui/command", () => ({
    CommandDialog: ({ children, open }: any) => open ? <div role="dialog">{children}</div> : null,
    CommandInput: ({ value, onValueChange, placeholder }: any) => (
        <input
            placeholder={placeholder}
            value={value}
            onChange={e => onValueChange(e.target.value)}
        />
    ),
    CommandList: ({ children }: any) => <div>{children}</div>,
    CommandEmpty: ({ children }: any) => <div>{children}</div>,
    CommandGroup: ({ children, heading }: any) => <div><h3>{heading}</h3>{children}</div>,
    CommandItem: ({ children, onSelect, value }: any) => (
        <div role="option" onClick={() => onSelect(value)} data-value={value}>{children}</div>
    ),
}));

describe("SearchCommand", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchStore.isOpen = true;
    });

    it("renders search input when open", async () => {
        render(<SearchCommand />);
        expect(await screen.findByPlaceholderText("Search pages by title or content...")).toBeInTheDocument();
    });

    it("searches pages on input directly (mocked debounce)", async () => {
        (searchPages as any).mockResolvedValue([
            { id: "p1", title: "Found Page", icon: "📄" }
        ]);

        render(<SearchCommand />);

        const input = await screen.findByPlaceholderText("Search pages by title or content...");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Found" } });
        });

        // Expect call
        await waitFor(() => {
            expect(searchPages).toHaveBeenCalledWith("Found");
        });

        expect(await screen.findByText("Found Page")).toBeInTheDocument();
    });

    it("creates new page on action click", async () => {
        (createDocument as any).mockResolvedValue({ id: "new-doc" });
        render(<SearchCommand />);

        const newPageAction = await screen.findByText("New Page");
        await act(async () => {
            fireEvent.click(newPageAction.closest('[role="option"]') || newPageAction);
        });

        expect(createDocument).toHaveBeenCalled();
    });
});
