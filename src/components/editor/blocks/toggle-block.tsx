"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { ChevronRight, ChevronDown } from "lucide-react"

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

            const toggleOpen = () => {
                editor.updateBlock(block, {
                    props: { isOpen: !isOpen },
                })
            }

            return (
                <div className="flex flex-col my-1" >
                    <div className="flex items-start group" >
                        <div
                            className="mr-1 mt-1 p-0.5 rounded hover:bg-muted cursor-pointer select-none transition-colors"
                            onClick={toggleOpen}
                            contentEditable={false}
                        >
                            {
                                isOpen ? (
                                    <ChevronDown size={18} className="text-muted-foreground" />
                                ) : (
                                    <ChevronRight size={18} className="text-muted-foreground" />
                                )}
                        </div>
                        < div className="flex-1" ref={props.contentRef} />
                    </div>
                </div>
            )
        },
    }
)
