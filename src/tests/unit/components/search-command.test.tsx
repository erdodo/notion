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

vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: { user: { id: "u1" } } }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

// Mock useSearch
const toggleMock = vi.fn();
const closeMock = vi.fn();
let isOpenValue = true;

vi.mock("@/hooks/use-search", () => ({
    useSearch: (selector: any) => selector({
        toggle: toggleMock,
        isOpen: isOpenValue,
        onClose: closeMock,
    }),
}));

// Mock CMDK (ui/command)
vi.mock("@/components/ui/command", () => ({
    CommandDialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
    CommandInput: ({ value, onValueChange }: any) => (
        <input
            placeholder="Search..."
            value={value}
            onChange={e => onValueChange(e.target.value)}
        />
    ),
    CommandList: ({ children }: any) => <div>{children}</div>,
    CommandEmpty: ({ children }: any) => <div>{children}</div>,
    CommandGroup: ({ children, heading }: any) => <div><h3>{heading}</h3>{children}</div>,
    CommandItem: ({ children, onSelect, value }: any) => (
        <div onClick={onSelect} data-value={value}>{children}</div>
    ),
}));

describe("SearchCommand", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isOpenValue = true;
    });

    it("renders search input when open", () => {
        render(<SearchCommand />);
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("searches pages on input directly (mocked debounce)", async () => {
        (searchPages as any).mockResolvedValue([
            { id: "p1", title: "Found Page", icon: "📄" }
        ]);

        render(<SearchCommand />);

        const input = screen.getByPlaceholderText("Search...");

        await act(async () => {
            fireEvent.change(input, { target: { value: "Found" } });
        });

        // Expect call
        await waitFor(() => {
            expect(searchPages).toHaveBeenCalledWith("Found");
        });

        await waitFor(() => {
            expect(screen.getByText("Found Page")).toBeInTheDocument();
        });
    });

    it("creates new page on action click", async () => {
        (createDocument as any).mockResolvedValue({ id: "new-doc" });
        render(<SearchCommand />);

        const newPageAction = screen.getByText("New Page");
        await act(async () => {
            fireEvent.click(newPageAction.parentElement!);
        });

        expect(createDocument).toHaveBeenCalled();
    });
});
