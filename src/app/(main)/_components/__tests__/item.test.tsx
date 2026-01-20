
import { render, screen } from "@testing-library/react"
import { Item } from "../item"
import { useRouter } from "next/navigation"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn()
    }))
}))

// Mock sonner toast
vi.mock("sonner", () => ({
    toast: {
        promise: vi.fn()
    }
}))

describe("Item Component", () => {
    it("does NOT render plus button when onCreate is undefined", () => {
        render(<Item id="1" title="Test Item" />)
        // Plus icon is usually inside the button. The Lucide Plus icon renders an svg.
        // simpler to look for role="button" that contains the svg or has specific class?
        // The button has className "opacity-0 group-hover:opacity-100 ..."
        // Let's query by role button and see how many there are.
        // There is the expand button (if hasChildren), and the menu button.

        // If hasChildren=false (default), no expand button.
        // So there should be only "More" menu button.

        // Note: triggers for dropdown are buttons too.

        // Let's check that we can't find the Plus icon.
        // Lucide icons usually have some class or we can match the SVG. 
        // Or we can check if there's only 1 button (the menu one).

        const buttons = screen.getAllByRole("button")
        // Should depend on implementation. Menu button is one. 
        // If onCreate is undefined, Create button shouldn't differ.

        // Better: Helper text or accessible name? The buttons don't have aria-label in the code I saw.
        // Let's modify the code to add aria-label maybe? Or just relying on the fact that we changed it.

        // We can search for the "Plus" icon class or something.
        // render returns container.
        // container.querySelector('svg.lucide-plus') should be null.

        const plusIcon = screen.queryByTestId("plus-icon") // Assuming we don't have testid
        // Inspecting code: <Plus className="h-4 w-4" />

        // We can try to use a test-id on the icon mock if we could, but we are using real icons probably?
        // Actually, Lucide icons are imported.

        // Alternative: search for the button with specific class 
        // "opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 p-0.5"
        // There are two such buttons (plus and more).

        // If we count them:
        // With onCreate, there should be 2 side-action buttons. 
        // Without onCreate, 1.

        const sideButtons = screen.queryAllByRole("button").filter(btn =>
            btn.className.includes("opacity-0 group-hover:opacity-100")
        )
        expect(sideButtons).toHaveLength(1) // Only "More" button
    })

    it("renders plus button when onCreate is provided", () => {
        render(<Item id="1" title="Test Item" onCreate={() => { }} />)
        const sideButtons = screen.queryAllByRole("button").filter(btn =>
            btn.className.includes("opacity-0 group-hover:opacity-100")
        )
        expect(sideButtons).toHaveLength(2) // "Plus" and "More" buttons
    })
})
