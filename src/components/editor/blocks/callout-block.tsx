"use client"

import { createReactBlockSpec } from "@blocknote/react"

export const CalloutBlock = createReactBlockSpec(
    {
        type: "callout",
        content: "inline",
        propSchema: {
            icon: {
                default: "💡",
            },
            color: {
                default: "gray",
                values: ["gray", "blue", "green", "yellow", "red", "purple"],
            },
        },
    },
    {
        render: (props) => {
            const { block } = props
            const colorStyles: Record<string, string> = {
                gray: "bg-gray-100 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800",
                blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
                green: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
                red: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                purple: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
            }

            return (
                <div className={`flex p-4 rounded-lg border my-2 ${colorStyles[block.props.color] || colorStyles.gray}`
                }>
                    <div className="mr-4 text-xl select-none" contentEditable={false} >
                        {block.props.icon}
                    </div>
                    < div className="flex-1 min-w-0" ref={props.contentRef} />
                </div>
            )
        },
    }
)
