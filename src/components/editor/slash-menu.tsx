"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SlashMenuProps {
    items: any[]
    selectedIndex: number
    onItemClick: (item: any) => void
    onClose: () => void
    position: { x: number; y: number }
}

export const SlashMenu = ({ items, selectedIndex, onItemClick, onClose, position }: SlashMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null)
    const [placement, setPlacement] = useState<"top" | "bottom">("bottom")
    const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({
        opacity: 0,
        top: -9999,
        left: -9999,
    })

    useEffect(() => {
        // Calculate position
        const calculatePosition = () => {
            if (!menuRef.current) return

            const menuHeight = menuRef.current.offsetHeight || 300 // Estimate if not rendered yet
            const windowHeight = window.innerHeight
            const spaceBelow = windowHeight - position.y

            // If we are in the bottom half of the screen (or close to bottom), open upwards
            // Threshold: if space below is less than menu height (plus buffer), go up
            // Or simply: if y > windowHeight / 2 -> go up. User request: "halfway" logic.
            const shouldGoUp = position.y > windowHeight / 2

            let top = position.y
            let left = position.x

            // Adjust generic position to not overflow width
            const menuWidth = 250 // Approx width
            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - 20
            }

            if (shouldGoUp) {
                setPlacement("top")
                // Position invalidation: we need the real height to position "top" correctly (as bottom of menu at cursor)
                // But initially we might not know height. 
                // We can use `bottom: windowHeight - position.y` style instead of top?
                // Let's rely on Flex or absolute positioning.
                setAdjustedStyle({
                    position: "fixed",
                    left: left,
                    bottom: windowHeight - position.y, // Anchor bottom to the cursor Y
                    top: "auto",
                    maxHeight: "300px",
                    opacity: 1,
                })
            } else {
                setPlacement("bottom")
                setAdjustedStyle({
                    position: "fixed",
                    left: left,
                    top: position.y + 24, // Shift down slightly
                    bottom: "auto",
                    maxHeight: "300px",
                    opacity: 1,
                })
            }
        }

        // We can run this in a layout effect or rAF, but useEffect is fine for now
        calculatePosition()
    }, [position])

    return (
        <div
            ref={menuRef}
            style={adjustedStyle}
            className="z-50 w-64 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
            <div className="flex flex-col overflow-y-auto max-h-[300px]">
                {items.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No matches</div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2",
                                index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            onClick={() => onItemClick(item)}
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                        >
                            {item.icon && <span className="w-5 h-5 flex items-center justify-center text-muted-foreground text-xs">{item.icon}</span>}
                            <div className="flex flex-col">
                                <span className="font-medium">{item.title}</span>
                                {item.subtext && <span className="text-[10px] text-muted-foreground line-clamp-1">{item.subtext}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
