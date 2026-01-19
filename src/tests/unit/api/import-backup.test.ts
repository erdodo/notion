import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/import/backup/route";
import { NextRequest } from "next/server";

// Mocks
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
    db: {
        page: {
            create: (...args: any[]) => mockCreate(...args),
            deleteMany: (...args: any[]) => mockDeleteMany(...args),
        },
    },
}));

// JSZip Mock
const mockMetadata = JSON.stringify({
    exportedAt: "2023-01-01",
    userId: "user1",
    pageCount: 2,
    format: "markdown"
});

const mockStructure = JSON.stringify([
    {
        id: "1",
        title: "Page 1",
        children: [
            { id: "2", title: "Page 2", children: [] }
        ]
    }
]);

const filesMap: Record<string, string> = {
    "_metadata.json": mockMetadata,
    "_structure.json": mockStructure,
    "Page 1.md": "# Page 1 Content",
    "Page 2.md": "# Page 2 Content"
};

const mockZipFileFunction = vi.fn().mockImplementation((arg) => {
    if (typeof arg === "string") {
        if (filesMap[arg]) {
            return {
                async: vi.fn().mockResolvedValue(filesMap[arg])
            };
        }
        return null;
    } else if (arg instanceof RegExp) {
        // Find matching keys
        const keys = Object.keys(filesMap).filter(k => arg.test(k));
        if (keys.length > 0) {
            // Return array of file objects
            return keys.map(k => ({
                name: k,
                async: vi.fn().mockResolvedValue(filesMap[k])
            }));
        }
        return [];
    }
    return null;
});

const mockLoadAsync = vi.fn().mockResolvedValue({
    file: mockZipFileFunction
});

vi.mock("jszip", () => {
    const MockJSZip = {
        loadAsync: (...args: any[]) => mockLoadAsync(...args),
    };
    return {
        default: MockJSZip,
        JSZip: MockJSZip,
    };
});

describe("API: import/backup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if not authenticated", async () => {
        mockAuth.mockResolvedValue(null);
        const req = new NextRequest("http://localhost/api/import/backup", { method: "POST" });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if zip file missing", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        const formData = new FormData();
        const req = new NextRequest("http://localhost/api/import/backup", { method: "POST", body: formData });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("should return 200 and import pages on success", async () => {
        mockAuth.mockResolvedValue({ user: { id: "user1" } });
        mockCreate.mockResolvedValue({ id: "new-id" });

        const formData = new FormData();
        const file = new File([new ArrayBuffer(10)], "backup.zip", { type: "application/zip" });
        formData.append("file", file);
        formData.append("mode", "merge");

        const req = new NextRequest("http://localhost/api/import/backup", { method: "POST", body: formData });
        const res = await POST(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        // 2 pages (Page 1, Page 2)
        expect(json.importedCount).toBe(2);

        // Check Page 1 creation
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: "Page 1",
                parentId: null
            })
        }));

        // Check Page 2 creation (child)
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: "Page 2",
                // parentId should be "new-id" because parent created first returns new-id
                parentId: "new-id"
            })
        }));
    });
});
