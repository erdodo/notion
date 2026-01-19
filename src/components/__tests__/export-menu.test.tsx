import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExportMenu } from "@/components/export-menu";
import { exportToPDF } from "@/lib/pdf-export";

// Mocks
vi.mock("@/lib/pdf-export", () => ({
    exportToPDF: vi.fn(),
}));

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => "blob:url");
global.URL.revokeObjectURL = vi.fn();
vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

// Mock Dropdown
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

describe("ExportMenu", () => {
    const pageId = "p1";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders export options", () => {
        render(<ExportMenu pageId={pageId} pageTitle="Doc" />);
        // Since we mock DropdownMenuContent as plain div, options are visible immediately
        expect(screen.getByText("Markdown (.md)")).toBeInTheDocument();
    });

    it("calls markdown export logic", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(new Blob([])),
        });

        const clickSpy = vi.fn();
        const originalCreateElement = document.createElement.bind(document);

        vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
            if (tagName === 'a') {
                const a = originalCreateElement('a', options) as HTMLAnchorElement;
                // Overwrite click
                a.click = clickSpy;
                return a;
            }
            return originalCreateElement(tagName, options);
        }) as any;

        render(<ExportMenu pageId={pageId} pageTitle="Doc" />);

        const mdOption = screen.getByText("Markdown (.md)");
        await act(async () => {
            fireEvent.click(mdOption);
        });

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/export/markdown"));

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    it("calls pdf export logic", async () => {
        render(<ExportMenu pageId={pageId} pageTitle="Doc" />);

        const pdfOption = screen.getByText("PDF (.pdf)");
        await act(async () => {
            fireEvent.click(pdfOption);
        });

        expect(exportToPDF).toHaveBeenCalledWith(pageId, "Doc");
    });

    it("renders csv option only if isDatabase", () => {
        const { rerender } = render(<ExportMenu pageId={pageId} pageTitle="Doc" />);
        expect(screen.queryByText("CSV (.csv)")).not.toBeInTheDocument();

        rerender(<ExportMenu pageId={pageId} pageTitle="Doc" isDatabase={true} databaseId="db-1" />);
        expect(screen.getByText("CSV (.csv)")).toBeInTheDocument();
    });
});
