"use client"
/*
import { createReactBlockSpec } from "@blocknote/react"
import { ChevronRight } from "lucide-react"
import React from "react"

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
                        
                        <div
                            className="flex-shrink-0 mt-1 transition-transform duration-200"
                            style={{
                                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                            contentEditable={false}
                        >
                            <ChevronRight size={18} className="text-muted-foreground" />
                        </div>

                        
                        <div
                            className="flex-1 min-w-0 min-h-[24px]"
                            ref={props.contentRef}
                            onClick={(e) => {
                                // Allow text editing - stop propagation to prevent toggle
                                e.stopPropagation()
                            }}
                        />
                        {isOpen && (
                            <div
                                className="toggle-block-body"
                                ref={props.contentRef}
                                onClick={(e) => {
                                    // Allow text editing - stop propagation to prevent toggle
                                    e.stopPropagation()
                                }}
                            />
                        )}
                    </div>
                </div>
            )
        },
    }
)
    */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec, ToggleWrapper } from "@blocknote/react";
import { ChevronRight } from "lucide-react";

// The Toggle block that we want to add to our editor.
export const ToggleBlock = createReactBlockSpec(
    {
        type: "toggle",
        propSchema: {
            ...defaultProps,
        },
        content: "inline",
    },
    {
        render: (props) => {
            return (
                <>
                    <ToggleWrapper block={props.block} editor={props.editor}>
                        <div
                            className="flex-1 min-w-0 min-h-[24px]"
                            ref={props.contentRef}
                            onClick={(e) => {
                                // Allow text editing - stop propagation to prevent toggle
                                e.stopPropagation()

                            }}
                        />
                    </ToggleWrapper>

                </>
            )
        }
    },
);
