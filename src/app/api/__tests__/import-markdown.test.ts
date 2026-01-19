import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/import/markdown/route";
import { NextRequest } from "next/server";

// Mocks
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockCreate = vi.fn();
vi.mock("@/lib/db", () => ({
    db: {
        page: {
            create: (...args: any[]) => mockCreate(...args),
        },
    },
}));

describe("API: import/markdown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/import/markdown", {
            method: "POST"
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if file is missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const formData = new FormData();
        const req = new NextRequest("http://localhost/api/import/markdown", {
            method: "POST",
            body: formData
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("should return 200 and create page on success", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockCreate.mockResolvedValue({ id: "new-page-id", title: "Test Doc" });

        const formData = new FormData();
        const file = new File(["# Hello\n- Item 1"], "Test Doc.md", { type: "text/markdown" });
        formData.append("file", file, "Test Doc.md");

        const req = new NextRequest("http://localhost/api/import/markdown", {
            method: "POST",
            body: formData
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.pageId).toBe("new-page-id");

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: expect.stringMatching(/Test Doc|blob/),
                userId: "user1",
                content: expect.stringContaining("Hello") // Parsing check logic
            })
        }));
    });
});
