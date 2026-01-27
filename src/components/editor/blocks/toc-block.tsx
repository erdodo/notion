"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useState, useEffect } from "react"

export const TOCBlock = createReactBlockSpec(
    {
        type: "toc",
        content: "none",
        propSchema: {},
    },
    {
        render: (props) => {
            const { editor } = props
            const [headings, setHeadings] = useState<{ id: string; text: string; level: number; blockId: string }[]>([])

            useEffect(() => {
                const updateHeadings = () => {
                    const doc = editor.document
                    const newHeadings: typeof headings = []

                    doc.forEach((block) => {
                        if ((block as any).type === "heading") {
                            // Safe cast or check
                            const level = (block.props as any).level || 1
                            const content = (block as any).content
                            // Check if content is array (it is for heading)
                            const text = (content as any[]).map((c: any) => c.text).join("")

                            if (text) {
                                newHeadings.push({
                                    id: block.id,
                                    text,
                                    level,
                                    blockId: block.id
                                })
                            }
                        }
                    })

                    // JSON stringify comparison to avoid loops
                    setHeadings(prev => JSON.stringify(prev) === JSON.stringify(newHeadings) ? prev : newHeadings)
                }

                // Initial scan
                updateHeadings()
                const interval = setInterval(updateHeadings, 1000)
                return () => clearInterval(interval)

            }, [editor])

            return (
                <div className="bg-muted/30 p-4 rounded-lg my-2 w-full" contentEditable={false} >
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2" > Table of Contents </p>
                    {
                        headings.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic" > No headings found.</p>
                        ) : (
                            <div className="flex flex-col gap-1" >
                                {
                                    headings.map((h) => (
                                        <div
                                            key={h.blockId}
                                            className="text-sm hover:underline cursor-pointer text-blue-600 dark:text-blue-400 select-none"
                                            style={{ marginLeft: `${(h.level - 1) * 1.5}rem` }}
                                            onMouseDown={(e) => {
                                                // Prevent default to stop selection/focus which triggers menu
                                                e.preventDefault()
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                const element = document.querySelector(`[data-id="${h.blockId}"]`)
                                                if (element) {
                                                    element.scrollIntoView({ behavior: "smooth", block: "center" })
                                                }
                                            }}
                                        >
                                            {h.text}
                                        </div>
                                    ))}
                            </div>
                        )}
                </div>
            )
        },
    }
)
