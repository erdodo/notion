import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { IconPicker } from "@/components/icon-picker";

// Mocks
vi.mock("next-themes", () => ({
    useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("emoji-picker-react", () => ({
    __esModule: true,
    default: ({ onEmojiClick }: any) => (
        <button onClick={() => onEmojiClick({ emoji: "😀" })}>Pick Emoji</button>
    ),
    Theme: { DARK: "dark", LIGHT: "light" },
}));

vi.mock("@/components/ui/popover", () => ({
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

describe("IconPicker", () => {
    it("renders children trigger", () => {
        render(
            <IconPicker onChange={() => { }}>
                <button>Trigger</button>
            </IconPicker>
        );
        expect(screen.getByText("Trigger")).toBeInTheDocument();
    });

    it("calls onChange with selected emoji", () => {
        const handleChange = vi.fn();
        render(
            <IconPicker onChange={handleChange}>
                <button>Trigger</button>
            </IconPicker>
        );

        const pickerBtn = screen.getByText("Pick Emoji");
        fireEvent.click(pickerBtn);

        expect(handleChange).toHaveBeenCalledWith("😀");
    });
});
