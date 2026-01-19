import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/import/csv/route";
import { NextRequest } from "next/server";

// Mocks
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockPageCreate = vi.fn();
const mockDatabaseCreate = vi.fn();
const mockPropertyCreate = vi.fn();
const mockRowCreate = vi.fn();
const mockCellCreate = vi.fn();
const mockRowUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
    db: {
        page: { create: (...args: any[]) => mockPageCreate(...args) },
        database: { create: (...args: any[]) => mockDatabaseCreate(...args) },
        property: { create: (...args: any[]) => mockPropertyCreate(...args) },
        databaseRow: {
            create: (...args: any[]) => mockRowCreate(...args),
            update: (...args: any[]) => mockRowUpdate(...args)
        },
        cell: { create: (...args: any[]) => mockCellCreate(...args) },
    },
}));

describe("API: import/csv", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/import/csv", { method: "POST" });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if csv is invalid", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const formData = new FormData();
        const file = new File([""], "empty.csv", { type: "text/csv" });
        formData.append("file", file);

        const req = new NextRequest("http://localhost/api/import/csv", { method: "POST", body: formData });
        const res = await POST(req);
        expect(res.status).toBe(400); // headers length 0
    });

    it("should return 200 and verify creation flow on success", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });

        // Setup ID returns
        mockPageCreate.mockResolvedValue({ id: "page-1" }); // First for container, then rows
        mockDatabaseCreate.mockResolvedValue({ id: "db-1" });
        mockPropertyCreate.mockResolvedValue({ id: "prop-1" });
        mockRowCreate.mockResolvedValue({ id: "row-1" });
        mockCellCreate.mockResolvedValue({ id: "cell-1" });

        const csvContent = "Name,Status\nTask 1,Done";
        const formData = new FormData();
        const file = new File([csvContent], "Tasks.csv", { type: "text/csv" });
        formData.append("file", file);

        const req = new NextRequest("http://localhost/api/import/csv", {
            method: "POST",
            body: formData
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.pageId).toBe("page-1");

        // Check calls
        expect(mockPageCreate).toHaveBeenCalledTimes(2); // Container + 1 Title Page for row
        expect(mockDatabaseCreate).toHaveBeenCalledWith(expect.objectContaining({ data: { pageId: "page-1", defaultView: "table" } }));
        expect(mockPropertyCreate).toHaveBeenCalledTimes(2); // Name, Status
        expect(mockRowCreate).toHaveBeenCalledTimes(1);
        expect(mockCellCreate).toHaveBeenCalledTimes(2);
    });
});
