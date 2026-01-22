"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { ChevronRight } from "lucide-react"
import React from "react"

/**
 * Toggle Block - A collapsible block that can contain nested content
 * 
 * Features:
 * - Click on chevron or title area to toggle open/closed state
 * - Supports nested blocks as children
 * - Smooth transitions with CSS animations
 * - Accessible with proper ARIA attributes
 */
export const ToggleBlock = createReactBlockSpec(
    {
        type: "toggle",
        content: "inline",
        propSchema: {
            isOpen: {
                default: false,
            },
        },
    },
    {
        render: (props) => {
            const { block, editor } = props
            const isOpen = block.props.isOpen as boolean

            const handleToggle = (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()

                editor.updateBlock(block, {
                    props: { isOpen: !isOpen },
                })
            }

            return (
                <div
                    className="toggle-block-wrapper"
                    data-toggle-open={isOpen}
                >
                    <div
                        className="flex items-start gap-2 group cursor-pointer hover:bg-accent/50 rounded-sm transition-colors py-0.5 px-1 -mx-1"
                        onClick={handleToggle}
                        role="button"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Collapse section" : "Expand section"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleToggle(e as any)
                            }
                        }}
                    >
                        {/* Toggle Icon */}
                        <div
                            className="flex-shrink-0 mt-1 transition-transform duration-200"
                            style={{
                                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                            contentEditable={false}
                        >
                            <ChevronRight size={18} className="text-muted-foreground" />
                        </div>

                        {/* Content - Title */}
                        <div
                            className="flex-1 min-w-0 min-h-[24px]"
                            ref={props.contentRef}
                            onClick={(e) => {
                                // Allow text editing - stop propagation to prevent toggle
                                e.stopPropagation()
                            }}
                        />
                    </div>
                </div>
            )
        },
    }
)
