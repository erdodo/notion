"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { ChevronRight, ChevronDown } from "lucide-react"

)

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
                        <div className={"flex-1 min-w-[50px]"} ref={props.contentRef} />
                    </div>
                </div>
            )
        },
    }
)
