"use client"

import { useEffect, useState, useMemo } from "react"
import { getBlock, updateSyncedBlockContent } from "@/app/(main)/_actions/blocks"
import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import { useTheme } from "next-themes"
import { RefreshCw, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { PartialBlock } from "@blocknote/core"

interface SyncedBlockProps {
    block: any
    editor: any
}

export const SyncedBlockView = ({ block, editor }: SyncedBlockProps) => {
    const { sourcePageId, sourceBlockId, childrenJSON } = block.props
    const { resolvedTheme } = useTheme()

    // Determine Mode
    const isMaster = !sourcePageId || !sourceBlockId

    const [loading, setLoading] = useState(false)
    const [fetchedContent, setFetchedContent] = useState<any[] | null>(null)

    // Initial Content for Nested Editor
    const initialContent = useMemo(() => {
        // Use stored content for both Master and Mirror (as seed)
        // If Mirror, this seed comes from the Clipboard or DB.
        console.log("[SyncedBlock] Computing initialContent", {
            isMaster,
            sourcePageId,
            sourceBlockId,
            childrenJSONLen: childrenJSON?.length,
            childrenJSONPreview: childrenJSON?.substring(0, 50)
        })

        try {
            const parsed = JSON.parse(childrenJSON) as PartialBlock[]
            if (Array.isArray(parsed) && parsed.length === 0) {
                console.log("[SyncedBlock] Parsed content is empty array")
                return undefined
            }
            console.log("[SyncedBlock] Parsed content successfully", parsed.length)
            return parsed
        } catch (e) {
            console.error("Failed to parse synced block content", e)
            return undefined
        }
    }, [childrenJSON])

    const nestedEditor = useCreateBlockNote({
        schema: editor.schema,
        initialContent: initialContent,
    })

    // Generic Fetch Function
    const fetchContent = async () => {
        if (isMaster || !sourcePageId || !sourceBlockId) return

        // Only show loading spinner on initial load, not background polls
        if (!fetchedContent) setLoading(true)

        try {
            const data = await getBlock(sourcePageId, sourceBlockId)
            if (data && data.props && data.props.childrenJSON) {
                try {
                    const params = JSON.parse(data.props.childrenJSON)
                    // Simple check to avoid unnecessary re-renders if content is same string
                    // (Though object comparison is hard, we can compare stringified)
                    // Ideally we only set if different.
                    setFetchedContent(prev => {
                        if (JSON.stringify(prev) === data.props.childrenJSON) return prev
                        return params
                    })
                } catch (e) {
                    console.error("Parse error", e)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // MIRROR: Fetch Content & Poll
    useEffect(() => {
        if (!isMaster && sourcePageId && sourceBlockId) {
            fetchContent() // Initial fetch

            const interval = setInterval(fetchContent, 3000) // Poll every 3s
            return () => clearInterval(interval)
        }
    }, [isMaster, sourcePageId, sourceBlockId])

    // MIRROR: Update Editor when content fetched
    useEffect(() => {
        // We need to be careful not to overwrite user edits if they are editing the mirror?
        // Synced Block Mirror Logic:
        // Usually, mirrors are editable. If I edit mirror, it sends update to Master.
        // If Master updates, Mirror should update.
        // CONFLICT: If I am typing in Mirror, and polling overwrites me, I lose cursor/text.
        // BlockNote's `replaceBlocks` is destructive for cursor.

        // Solution for MVP:
        // Only update if *not focused*? OR we accept the glitchiness for now.
        // Real-time collab via Yjs is handled by provider, but Synced Block is "outside" that scope partially?
        // Wait, if I edit Mirror, `handleChange` calls `updateSyncedBlockContent`, which updates DB.
        // Polling fetches DB.

        // If I am just watching, polling is fine.
        // If I am editing, polling might overwrite my local changes before they save?
        // Let's rely on standard behavior: Last write wins.
        // But the UX of `replaceBlocks` might reset cursor.
        // We should only replace if content is significantly different?

        if (nestedEditor && fetchedContent) {
            const currentJSON = JSON.stringify(nestedEditor.document)
            const newJSON = JSON.stringify(fetchedContent)

            if (currentJSON !== newJSON) {
                // Check if editor is focused? 
                // If focused, we might want to skip update or be smart?
                // For now, let's update.
                nestedEditor.replaceBlocks(nestedEditor.document, fetchedContent)
            }
        }
    }, [fetchedContent, nestedEditor])

    // Handle Change
    const handleChange = async () => {
        if (!nestedEditor) return

        const currentContent = nestedEditor.document
        const contentString = JSON.stringify(currentContent)

        if (isMaster) {
            if (contentString !== childrenJSON) {
                editor.updateBlock(block, {
                    props: { childrenJSON: contentString }
                })
            }
        } else {
            updateSyncedBlockContent(sourcePageId, sourceBlockId, currentContent)
        }
    }
    const copyLink = () => {
        const path = window.location.pathname
        const match = path.match(/\/documents\/([^\/]+)/)
        const currentPageId = match ? match[1] : ""

        if (!currentPageId) {
            toast.error("Could not determine Page ID")
            return
        }

        // Snapshot current content to seed the mirror
        const currentBlocks = nestedEditor ? nestedEditor.document : []
        const currentContent = JSON.stringify(currentBlocks)

        console.log("[SyncedBlock] Copying Link", {
            blockId: block.id,
            blocksCount: currentBlocks.length,
            contentPreview: currentContent.substring(0, 100)
        })

        const syncData = {
            sourcePageId: sourcePageId || currentPageId,
            sourceBlockId: block.id,
            childrenJSON: currentContent // Include content snapshot
        }

        const clipboardText = JSON.stringify(syncData)
        navigator.clipboard.writeText(clipboardText)
        toast.success("Synced Block Reference copied!")
        console.log("[SyncedBlock] Clipboard Text:", clipboardText)
    }

    return (
        <div className={`synced-block group relative rounded border transition-colors ${isMaster ? "border-red-400 bg-red-50/10" : "border-red-400 border-dashed bg-transparent"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1 text-xs text-red-400 select-none bg-red-50/50 dark:bg-red-900/20 rounded-t">
                <span className="flex items-center gap-1 font-medium">
                    <RefreshCw
                        size={11}
                        className={`cursor-pointer hover:rotate-180 transition-transform ${loading ? "animate-spin" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            fetchContent()
                        }}
                    />
                    {isMaster ? "Synced Block (Original)" : "Synced Block (Mirror)"}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={copyLink} className="hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded" title="Copy sync reference">
                        <Copy size={11} />
                    </button>
                    {!isMaster && (
                        <a href={`/documents/${sourcePageId}`} target="_blank" className="hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded" title="Go to original">
                            <ExternalLink size={11} />
                        </a>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <div className="p-1" onKeyDown={e => e.stopPropagation()}>
                <BlockNoteView
                    editor={nestedEditor}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    onChange={handleChange}
                    className="min-h-[2rem]"
                />
            </div>
        </div>
    )
}
