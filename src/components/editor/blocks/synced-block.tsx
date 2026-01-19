"use client"

import { createReactBlockSpec } from "@blocknote/react"
import dynamic from "next/dynamic"

// Dynamic import to break circular dependency
const SyncedBlockView = dynamic(
    () => import("./synced-block-view").then((mod) => mod.SyncedBlockView),
    {
        ssr: false,
        loading: () => <div className="p-2 border border-red-200 rounded text-xs text-red-500">Loading Synced Block...</div>
    }
)

export const SyncedBlock = createReactBlockSpec(
    {
        type: "syncedBlock",
        propSchema: {
            sourcePageId: {
                default: "",
            },
            sourceBlockId: {
                default: "",
            },
            childrenJSON: {
                default: "[]",
            }
        },
        content: "none",
    },
    {
        render: (props) => {
            // Pass props properly to the dynamic component
            return <SyncedBlockView block={props.block} editor={props.editor} />
        },
    }
)
