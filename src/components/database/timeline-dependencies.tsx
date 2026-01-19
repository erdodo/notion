"use client"

import { useEffect, useState, useRef } from "react"
import { Timeline } from "vis-timeline/standalone"
import { DataSet } from "vis-data"

interface TimelineDependenciesProps {
    timeline: Timeline
    items: DataSet<any>
    dependencies: { source: string, target: string }[] // source blocks target (arrow from source to target)
}

export function TimelineDependencies({ timeline, items, dependencies }: TimelineDependenciesProps) {
    const [lines, setLines] = useState<{ x1: number, y1: number, x2: number, y2: number }[]>([])
    const containerRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!timeline) return

        const updateLines = () => {
            const newLines: { x1: number, y1: number, x2: number, y2: number }[] = []

            // Get visible window to optimize? Or render all.
            // SVG overlay is usually on top of the whole timeline content usually or container?
            // "vis-timeline" has a center panel. We ideally want lines to move with content.
            // However, inserting into vis DOM is tricky.
            // Easier approach: Render SVG absolute over the timeline viewport.

            dependencies.forEach(dep => {
                const sourceItem = items.get(dep.source)
                const targetItem = items.get(dep.target)

                if (!sourceItem || !targetItem) return

                // Get positioning
                // timeline.getItemRange returns current start/end. 
                // But we need pixel coordinates.
                // timeline.getCustomTime? No. 
                // timeline.timeToPixel(date) gives x.

                // We need the DOM elements to get Y.
                // vis-timeline renders items with data-id attribute.
                // But looking up DOM text is slow.
                // timeline.getItemRange(id) -> {top, left, width, height, ...}? No.

                // Alternative: timeline props often don't expose item bounds directly.
                // We might need to select from DOM.

                // Optimized approach: 
                // X coordinates come from timeToPixel.
                // Y coordinates... rely on DOM for now.

                // Wait, vis-timeline items have specific class 'vis-item' and 'vis-range'/'vis-point'.
                // And data-id="{id}" usually NOT present by default unless configured? 
                // Actually vis-timeline uses className usually.
                // Let's assume we can find element by some means.
                // Actually, `items` in dataset doesn't have screen coordinates.

                // Let's try to find DOM elements.
                const sourceEl = (timeline as any).dom.center.querySelector(`.vis-item[data-id="${dep.source}"]`) as HTMLElement
                const targetEl = (timeline as any).dom.center.querySelector(`.vis-item[data-id="${dep.target}"]`) as HTMLElement

                if (sourceEl && targetEl) {
                    // Coordinates relative to the timeline center container (where we mount SVG)
                    // The timeline has a 'center' container which scrolls horizontally?
                    // if we mount SVG inside that container it moves with it?
                    // Or we mount fixed and translate? 

                    // `timeline.dom.center` is the scrollable area.

                    // Let's calculate relative to the containerRef (which should be placed correctly).

                    // Simple logic for Arrow: Right of Source -> Left of Target.

                    const srcRect = sourceEl.getBoundingClientRect()
                    const tgtRect = targetEl.getBoundingClientRect()
                    const containerRect = (timeline as any).dom.center.getBoundingClientRect()

                    // Adjust relative to container (assuming SVG is absolute 0,0 in container)
                    // Note: If SVG is outside, this math changes. 
                    // Let's assume this component renders an SVG that we portal/append into timeline.dom.center OR 
                    // we simple render it as a sibling and sync scroll.

                    // Better: We rely on `timeline.on('changed')` to re-render.
                    // And we use `timeToPixel` for X.

                    const x1 = (timeline as any).timeToPixel(sourceItem.end)
                    const x2 = (timeline as any).timeToPixel(targetItem.start)

                    // Y is tricky without DOM.
                    // But we have the DOM elements sourced above.
                    // Relative Y to the center container top.

                    const y1 = srcRect.top - containerRect.top + srcRect.height / 2
                    const y2 = tgtRect.top - containerRect.top + tgtRect.height / 2

                    newLines.push({ x1, y1, x2, y2 })
                }
            })
            setLines(newLines)
        }

        // Listen to events
        timeline.on('changed', updateLines)
        timeline.on('rangechange', updateLines)

        // Initial draw
        // Need a slight delay for initial render of items
        const timer = setTimeout(updateLines, 100)

        return () => {
            timeline.off('changed', updateLines)
            timeline.off('rangechange', updateLines)
            clearTimeout(timer)
        }
    }, [timeline, items, dependencies])

    // Portal the SVG into the timeline's center container to scroll with it?
    // Actually `timeToPixel` returns visual pixel relative to start of window IF we use it right?
    // No, `timeToPixel` returns absolute pixel if the timeline width is huge? 
    // Wait, documentation says "convert a Date to a pixel value in the current window". 
    // So 0 is left of visible window.
    // If we put SVG fixed over the window, then `timeToPixel` works.

    // We need to attach this SVG to `timeline.dom.center` which is the viewport container relative.

    // But we are a React component. 
    // We can use a Portal or just absolute div if we are children of the same container.
    // The `TimelineView` renders a div ref. The timeline is inside.

    // Let's render absolute full width/height pointer-events-none.

    return (
        <svg
            className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible"
            style={{ zIndex: 0 }} // Behind items usually? Or on top? On top but transparent.
        >
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                </marker>
            </defs>
            {lines.map((line, i) => {
                // Bezier curve
                // Start right, go right, curve to target left
                const dx = Math.abs(line.x2 - line.x1) / 2
                const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`

                return (
                    <path
                        key={i}
                        d={path}
                        stroke="#888"
                        strokeWidth="1.5"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                        opacity="0.6"
                    />
                )
            })}
        </svg>
    )
}
