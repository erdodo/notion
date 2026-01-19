import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/url-metadata/route";
import { NextRequest } from "next/server";
import ogs from "open-graph-scraper";

// Mock open-graph-scraper
vi.mock("open-graph-scraper", () => ({
    default: vi.fn(),
}));

describe("API: url-metadata", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 if URL is missing", async () => {
        const req = new NextRequest("http://localhost/api/url-metadata");
        const res = await GET(req);

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("URL is required");
    });

    it("should return metadata successfully", async () => {
        const mockResult = {
            ogTitle: "Test Title",
            ogDescription: "Test Description",
            ogImage: [{ url: "http://example.com/image.png" }],
            favicon: "http://example.com/favicon.ico",
            ogUrl: "http://example.com",
        };

        (ogs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            result: mockResult,
        });

        const req = new NextRequest(
            "http://localhost/api/url-metadata?url=http://example.com"
        );
        const res = await GET(req);

        expect(res.status).toBe(200);
        const json = await res.json();

        expect(json.success).toBe(1);
        expect(json.meta).toEqual({
            title: "Test Title",
            description: "Test Description",
            image: { url: "http://example.com/image.png" },
            icon: "http://example.com/favicon.ico",
            url: "http://example.com",
        });
    });

    it("should fallback to twitter metadata if og metadata is missing", async () => {
        const mockResult = {
            twitterTitle: "Twitter Title",
            twitterDescription: "Twitter Description",
            twitterImage: [{ url: "http://example.com/twitter-image.png" }],
            ogUrl: "http://example.com",
        };

        (ogs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            result: mockResult,
        });

        const req = new NextRequest(
            "http://localhost/api/url-metadata?url=http://example.com"
        );
        const res = await GET(req);

        expect(res.status).toBe(200);
        const json = await res.json();

        expect(json.meta.title).toBe("Twitter Title");
        expect(json.meta.description).toBe("Twitter Description");
        expect(json.meta.image.url).toBe("http://example.com/twitter-image.png");
    });

    it("should return 500 if fetching metadata fails", async () => {
        (ogs as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Fetch error"));

        const req = new NextRequest(
            "http://localhost/api/url-metadata?url=http://example.com"
        );
        const res = await GET(req);

        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe("Failed to fetch metadata");
    });
});
