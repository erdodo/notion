import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/export/pdf/route";
import { NextRequest } from "next/server";

// Mocks
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockFindUnique = vi.fn();
vi.mock("@/lib/db", () => ({
    db: {
        page: {
            findUnique: (...args: any[]) => mockFindUnique(...args),
        },
    },
}));

vi.mock("@/lib/export-utils", () => ({
    blocksToHTML: vi.fn(() => "<h1>Title</h1><p>Mocked HTML Content</p>"),
}));

describe("API: export/pdf", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/export/pdf?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if pageId is missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const req = new NextRequest("http://localhost/api/export/pdf");
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it("should return 404 if page not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/export/pdf?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(404);
    });

    it("should return 200 and JSON with HTML on success", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue({
            id: "123",
            userId: "user1",
            title: "Test Page",
            content: JSON.stringify([{ type: "paragraph" }]),
            coverImage: "http://example.com/cover.png",
            icon: "📄"
        });

        const req = new NextRequest("http://localhost/api/export/pdf?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.html).toContain("<p>Mocked HTML Content</p>");
        expect(json.html).toContain("http://example.com/cover.png"); // Check if cover logic injection worked
        expect(json.title).toBe("Test Page");
        expect(json.filename).toBe("Test_Page");
    });
});
