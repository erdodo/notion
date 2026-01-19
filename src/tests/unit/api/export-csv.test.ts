import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/export/csv/route";
import { NextRequest } from "next/server";

// Mocks
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
    db: {
        page: {
            findUnique: (...args: any[]) => mockFindUnique(...args),
        },
        pageShare: {
            findFirst: (...args: any[]) => mockFindFirst(...args),
        },
    },
}));

vi.mock("@/lib/export-utils", () => ({
    formatCellValueForCSV: vi.fn((val) => val || ""),
}));

describe("API: export/csv", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/export/csv?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if pageId is missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const req = new NextRequest("http://localhost/api/export/csv");
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it("should return 404 if page not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/export/csv?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(404);
    });

    it("should return 400 if page is not a database", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue({
            id: "123",
            userId: "user1",
            database: null,
        });
        const req = new NextRequest("http://localhost/api/export/csv?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(400);
        const text = await res.text();
        expect(text).toContain("not a database");
    });

    it("should return 200 and CSV content on success", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue({
            id: "123",
            userId: "user1",
            title: "Test DB",
            database: {
                properties: [
                    { id: "p1", name: "Name", type: "TITLE" },
                    { id: "p2", name: "Status", type: "SELECT" },
                ],
                rows: [
                    {
                        cells: [
                            { propertyId: "p1", value: "Row 1" },
                            { propertyId: "p2", value: "Done" },
                        ],
                    },
                    {
                        cells: [{ propertyId: "p1", value: "Row 2" }],
                    },
                ],
            },
        });

        const req = new NextRequest("http://localhost/api/export/csv?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/csv");

        const text = await res.text();
        // Simple check for csv content (papaparse output)
        expect(text).toContain("Name,Status");
        expect(text).toContain("Row 1,Done");
    });
});
