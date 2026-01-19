import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { getNotifications, getUnreadCount, markAsRead } from "@/app/(main)/_actions/notifications";

// Mocks
vi.mock("@/app/(main)/_actions/notifications", () => ({
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
}));

const mockSession = { data: { user: { id: "user1" } } };
vi.mock("next-auth/react", () => ({
    useSession: () => mockSession,
}));

vi.mock("@/lib/pusher-client", () => ({
    pusherClient: {
        subscribe: vi.fn(() => ({
            bind: vi.fn(),
            unbind: vi.fn(),
        })),
        unsubscribe: vi.fn(),
    },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe("NotificationsDropdown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders notifications list", async () => {
        (getNotifications as any).mockResolvedValue([
            { id: "1", title: "New Comment", message: "Hello", type: "COMMENT_ADDED", read: false, createdAt: new Date() }
        ]);
        (getUnreadCount as any).mockResolvedValue(1);

        render(<NotificationsDropdown />);

        await waitFor(() => {
            expect(screen.getByText("New Comment")).toBeInTheDocument();
            expect(screen.getByText("Hello")).toBeInTheDocument();
            // Unread badge
            expect(screen.getByText("1")).toBeInTheDocument();
        });
    });

    it("marks notification as read on click", async () => {
        (getNotifications as any).mockResolvedValue([
            { id: "1", title: "New Comment", read: false, createdAt: new Date() }
        ]);

        render(<NotificationsDropdown />);

        await waitFor(() => {
            expect(screen.getByText("New Comment")).toBeInTheDocument();
        });

        const notif = screen.getByText("New Comment");
        await act(async () => {
            fireEvent.click(notif);
        });

        expect(markAsRead).toHaveBeenCalledWith("1");
    });
});
