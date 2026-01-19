import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "@/components/spinner";

describe("Spinner", () => {
    it("renders with default size", () => {
        const { container } = render(<Spinner />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("h-4 w-4");
    });

    it("renders with large size", () => {
        const { container } = render(<Spinner size="lg" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("h-6 w-6");
    });

    it("renders with icon size", () => {
        const { container } = render(<Spinner size="icon" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("h-10 w-10");
    });
});
