import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/export/markdown/route";
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
    blocksToMarkdown: vi.fn(() => "Mocked Markdown Content"),
}));

describe("API: export/markdown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/export/markdown?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if pageId is missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const req = new NextRequest("http://localhost/api/export/markdown");
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it("should return 404 if page not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue(null);

        const req = new NextRequest("http://localhost/api/export/markdown?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(404);
    });

    it("should return 403 if user does not have access", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1", email: "user1@test.com" } });
        mockFindUnique.mockResolvedValue({ id: "123", userId: "user2" });
        mockFindFirst.mockResolvedValue(null);

        const req = new NextRequest("http://localhost/api/export/markdown?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(403);
    });

    it("should return 200 and markdown content if successful (owner)", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockFindUnique.mockResolvedValue({
            id: "123",
            userId: "user1",
            title: "Test Page",
            content: JSON.stringify([{ type: "paragraph" }]),
        });

        const req = new NextRequest("http://localhost/api/export/markdown?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/markdown");
        expect(res.headers.get("Content-Disposition")).toContain('filename="Test_Page.md"');

        const text = await res.text();
        expect(text).toContain("# Test Page");
        expect(text).toContain("Mocked Markdown Content");
    });

    it("should return 200 and markdown content if successful (shared)", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1", email: "user1@test.com" } });
        mockFindUnique.mockResolvedValue({
            id: "123",
            userId: "user2",
            title: "Shared Page",
            content: JSON.stringify([{ type: "paragraph" }]),
        });
        mockFindFirst.mockResolvedValue({ id: "share1" });

        const req = new NextRequest("http://localhost/api/export/markdown?pageId=123");
        const res = await GET(req);
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toContain("# Shared Page");
    });
});
