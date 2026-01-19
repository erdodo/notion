import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/pusher/auth/route";

// Mock dependencies
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
    auth: () => mockAuth(),
}));

const mockAuthorizeChannel = vi.fn();
vi.mock("@/lib/pusher", () => ({
    pusherServer: {
        authorizeChannel: (...args: any[]) => mockAuthorizeChannel(...args),
    },
}));

describe("API: pusher/auth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const formData = new FormData();
        formData.append("socket_id", "123.456");
        formData.append("channel_name", "private-channel");

        const req = new Request("http://localhost/api/pusher/auth", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("should return 400 if socket_id or channel_name is missing", async () => {
        mockAuth.mockResolvedValue({
            user: { email: "test@example.com", name: "Test User" },
        });

        const formData = new FormData();
        // Missing socket_id and channel_name

        const req = new Request("http://localhost/api/pusher/auth", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const text = await res.text();
        expect(text).toBe("Missing socket_id or channel_name");
    });

    it("should return 200 and auth response on success", async () => {
        const mockUser = {
            email: "test@example.com",
            name: "Test User",
            image: "http://example.com/avatar.png",
        };
        mockAuth.mockResolvedValue({ user: mockUser });

        const mockAuthResponse = { auth: "some-auth-string" };
        mockAuthorizeChannel.mockReturnValue(mockAuthResponse);

        const formData = new FormData();
        formData.append("socket_id", "123.456");
        formData.append("channel_name", "presence-channel");

        const req = new Request("http://localhost/api/pusher/auth", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(mockAuthResponse);

        expect(mockAuthorizeChannel).toHaveBeenCalledWith(
            "123.456",
            "presence-channel",
            {
                user_id: mockUser.email,
                user_info: {
                    name: mockUser.name,
                    email: mockUser.email,
                    image: mockUser.image,
                },
            }
        );
    });

    it("should return 500 if pusher authorization fails", async () => {
        mockAuth.mockResolvedValue({
            user: { email: "test@example.com" },
        });

        mockAuthorizeChannel.mockImplementation(() => {
            throw new Error("Pusher error");
        });

        const formData = new FormData();
        formData.append("socket_id", "123.456");
        formData.append("channel_name", "presence-channel");

        const req = new Request("http://localhost/api/pusher/auth", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(500);
        const text = await res.text();
        expect(text).toBe("Internal Error");
    });
});
