import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageSkeleton } from "@/components/page-skeleton";

describe("PageSkeleton", () => {
    it("renders skeleton elements", () => {
        const { container } = render(<PageSkeleton />);
        // Check for general structure
        expect(container.getElementsByClassName("h-[35vh] w-full")).toHaveLength(1); // Cover
        expect(container.getElementsByClassName("h-16 w-16")).toHaveLength(1); // Icon
        expect(container.getElementsByClassName("h-12 w-full")).toHaveLength(1); // Title
    });
});
