"use client"

import { createReactBlockSpec } from "@blocknote/react"
import type { BlockColor } from "@/lib/block-utils"

export const CalloutBlock = createReactBlockSpec(
    {
        type: "callout",
        content: "inline",
        propSchema: {
            // We use 'type' to define the semantic state. 
            // We map this to the underlying system.
            type: {
                default: "info",
                values: ["info", "success", "warning", "error"],
            },
            // We keep these but they will be ignored/overridden by render based on type
            // to maintain some compatibility if needed, or purely driven by 'type'.
            // Actually, best to simplify the schema to what we want.
            // If we remove 'color', the default menu might break if it tries to set it.
            // But we can define our own props.
        },
    },
    {
        render: (props) => {
            const { block } = props
            const type = block.props.type as "info" | "success" | "warning" | "error"

            const styles = {
                info: {
                    color: "bg-gray-100 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800",
                    icon: "💡"
                },
                success: {
                    color: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                    icon: "✅"
                },
                warning: {
                    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
                    icon: "⚠️"
                },
                error: {
                    color: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                    icon: "🚨"
                }
            }

            const currentStyle = styles[type] || styles.info

            return (
                <div className={`flex p-4 rounded-lg border my-2 ${currentStyle.color}`}>
                    <div className="mr-4 text-xl select-none" contentEditable={false}>
                        {currentStyle.icon}
                    </div>
                    <div className="flex-1 min-w-0" ref={props.contentRef} />
                </div>
            )
        },
    }
)
