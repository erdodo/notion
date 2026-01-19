"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useEffect, useState, useCallback } from "react"


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
            const isOpen = block.props.isOpen
            const [contentElement, setContentElement] = useState<HTMLElement | null>(null)

            const contentRefCallback = useCallback((node: HTMLElement | null) => {
                setContentElement(node)
                if (props.contentRef) {
                    if (typeof props.contentRef === "function") {
                        props.contentRef(node)
                    } else {
                        (props.contentRef as any).current = node
                    }
                }
            }, [props.contentRef])

            // Handle children visibility via DOM manipulation
            // This is necessary because we typically cannot control the "children" rendering 
            // of a block directly from the custom block content renderer in BlockNote (managed by Core).
            useEffect(() => {
                if (!contentElement) return
                if (!contentElement) return

                // Traverse up to find the block element
                // Structure: .bn-block > .bn-block-content > ... > contentElement
                const blockContent = contentElement.closest(".bn-block-content")
                if (!blockContent) return

                const blockElement = blockContent.closest(".bn-block")
                if (!blockElement) return

                // The children container is usually a sibling of bn-block-content
                const childrenContainer = blockElement.querySelector(".bn-block-children") as HTMLElement

                if (childrenContainer) {
                    childrenContainer.style.display = isOpen ? "block" : "none"
                }

            }, [isOpen, contentElement])

            const toggleOpen = (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                editor.updateBlock(block, {
                    props: { isOpen: !isOpen },
                })
            }

            return (
                <div className="flex flex-col my-1">
                    <div className="flex items-start group">
                        <div
                            className="mr-1 mt-1 p-0.5 rounded hover:bg-muted cursor-pointer select-none transition-colors"
                            onClick={toggleOpen}
                            contentEditable={false}
                            // Add these to ensure it doesn't interfere with editor focus weirdly, 
                            // though stopPropagation handles most.
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {
                                isOpen ? (
                                    <ChevronDown size={18} className="text-muted-foreground" />
                                ) : (
                                    <ChevronRight size={18} className="text-muted-foreground" />
                                )}
                        </div>
                        {/* 
                            The contentRef div must be accessible. 
                            If it's empty, it might have 0 height which makes it hard to click.
                            We add min-w and min-h to ensure it's clickable.
                        */}
                        <div className={"flex-1 min-w-0 min-h-[24px]"} ref={contentRefCallback} />
                    </div>
                </div>
            )
        },
    }
)
