"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import { useTheme } from "next-themes"
import { useState, useMemo, useEffect } from "react"
import { PartialBlock } from "@blocknote/core"
import { cn } from "@/lib/utils"

// Helper component for Resize Handle
const ResizeHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => {
    return (
        <div
            className="w-1 cursor-col-resize hover:bg-primary/50 transition-colors h-auto mx-1 rounded"
            onMouseDown={onMouseDown}
        />
    )
}

// Helper component for each column to isolate its editor instance
const GridColumn = ({
    initialContentJSON,
    onContentChange,
    editorSchema,
    readOnly = false,
    className,
    width
}: {
    initialContentJSON: string,
    onContentChange: (json: string) => void,
    editorSchema: any,
    readOnly?: boolean,
    className?: string,
    width?: number // Percentage
}) => {
    const { resolvedTheme } = useTheme()

    // Parse initial content
    const initialContent = useMemo(() => {
        try {
            const parsed = JSON.parse(initialContentJSON) as PartialBlock[]
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Sanitize content to ensure it matches Schema
                // nested editors fail if 'content' is present on blocks that don't support it (e.g. image)
                return parsed.map(p => {
                    const clean = { ...p }
                    if (clean.type === "image") {
                        // Images in BlockNote don't have content array, they use props
                        delete clean.content
                        // Ensure props exist
                        if (!clean.props) clean.props = { url: "" }
                    }
                    // Ensure inlineDatabase has props
                    if (clean.type === "inlineDatabase") {
                        delete clean.content
                        if (!clean.props) clean.props = { linkedDatabaseId: "" }
                    }
                    return clean
                })
            }
            return undefined
        } catch (e) {
            return undefined
        }
    }, [initialContentJSON])

    // Create a nested editor for this column
    const nestedEditor = useCreateBlockNote({
        schema: editorSchema,
        initialContent: initialContent,
        // Disable default slash commands in nested editor if desired, or keep them.
        // User wants "no formatting toolbar conflict".
        // BlockNote currently attaches UI to the DOM element.
    })

    // Handle updates
    // We only trigger update if content actually changed to avoid loop
    const handleChange = () => {
        if (!nestedEditor) return
        const json = JSON.stringify(nestedEditor.document)
        if (json !== initialContentJSON) {
            onContentChange(json)
        }
    }

    return (
        <div
            className={cn("flex-1 min-w-[50px] relative group/col", className)}
            style={{ width: width ? `${width}%` : undefined, flex: width ? `0 0 ${width}%` : 1 }}
        >
            <BlockNoteView
                editor={nestedEditor}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={handleChange}
                editable={!readOnly}
                className="min-h-[2rem]"
                // Disable side menu to make it feel more "inline" and less like nested blocks
                sideMenu={false}
            // We'll keep formatting toolbar but maybe it conflicts?
            // If user selects text, standard toolbar shows.
            // If it doubles up, the parent editor might be showing one too?
            // Nested editor needs its own toolbar usually.
            />
        </div>
    )
}

export const GridBlock = createReactBlockSpec(
    {
        type: "grid",
        propSchema: {
            columns: { default: 2 },
            // Storing content for up to 6 columns as JSON strings
            col1: { default: "[]" },
            col2: { default: "[]" },
            col3: { default: "[]" },
            col4: { default: "[]" },
            col5: { default: "[]" },
            col6: { default: "[]" },
            // Store widths as comma-separated string "50,50"
            widths: { default: "" }
        },
        content: "none",
    },
    {
        render: ({ block, editor }) => {
            const cols = Math.min(Math.max(block.props.columns, 2), 6)

            // Parse widths
            const [colWidths, setColWidths] = useState<number[]>(() => {
                const w = block.props.widths ? block.props.widths.split(",").map(Number) : []
                if (w.length === cols) return w
                // Default equal widths
                return Array(cols).fill(100 / cols)
            })

            useEffect(() => {
                // Sync widths prop if valid
                const w = block.props.widths ? block.props.widths.split(",").map(Number) : []
                if (w.length === cols && w.join(",") !== colWidths.join(",")) {
                    setColWidths(w)
                }
            }, [block.props.widths, cols])

            const updateColumn = (index: number, contentJSON: string) => {
                const propKey = `col${index + 1}` as keyof typeof block.props
                if (block.props[propKey] !== contentJSON) {
                    editor.updateBlock(block, {
                        props: { [propKey]: contentJSON }
                    })
                }
            }

            const handleResize = (index: number, deltaPercent: number) => {
                const newWidths = [...colWidths]
                // Resize current and next column
                // index is the handle index. Handler 0 is between col 0 and 1.
                // So we adjus col[index] and col[index+1]
                const left = index
                const right = index + 1

                if (newWidths[left] + deltaPercent < 5 || newWidths[right] - deltaPercent < 5) return

                newWidths[left] += deltaPercent
                newWidths[right] -= deltaPercent

                setColWidths(newWidths)
            }

            const saveWidths = () => {
                editor.updateBlock(block, {
                    props: { widths: colWidths.join(",") }
                })
            }

            // --- Resize Handler Logic ---
            const [isResizing, setIsResizing] = useState<number | null>(null)
            const startX = useMemo(() => ({ value: 0 }), [])

            useEffect(() => {
                if (isResizing === null) return

                const onMove = (e: MouseEvent) => {
                    const deltaPx = e.clientX - startX.value
                    // Convert px to %, assuming container width?
                    // Approximate. Block container width varies.
                    // Let's assume 800px or measure?
                    // Using a heuristic: 1% ~ 8px? 
                    // Better: use ref to measure container. 
                    // For now, responsive feel: 
                    const deltaPercent = (deltaPx / window.innerWidth) * 200 // Sensitivity factor

                    if (Math.abs(deltaPercent) > 0.5) {
                        handleResize(isResizing, deltaPercent)
                        startX.value = e.clientX
                    }
                }

                const onUp = () => {
                    saveWidths()
                    setIsResizing(null)
                    document.body.style.cursor = ""
                }

                document.addEventListener("mousemove", onMove)
                document.addEventListener("mouseup", onUp)
                return () => {
                    document.removeEventListener("mousemove", onMove)
                    document.removeEventListener("mouseup", onUp)
                }
            }, [isResizing, colWidths])


            return (
                <div className="my-2 w-full flex relative select-none" onKeyDown={e => e.stopPropagation()}>
                    {Array.from({ length: cols }).map((_, i) => {
                        const propKey = `col${i + 1}` as keyof typeof block.props
                        const content = block.props[propKey] as string
                        const width = colWidths[i]

                        return (
                            <div key={i} className="flex flex-1" style={{ width: `${width}%`, flex: `0 0 ${width}%` }}>
                                <GridColumn
                                    initialContentJSON={content}
                                    onContentChange={(json) => updateColumn(i, json)}
                                    editorSchema={editor.schema}
                                    readOnly={!editor.isEditable}
                                    width={100} // Render fill inside wrapper
                                    className="border-none bg-transparent pl-2" // Removed border/bg
                                />
                                {i < cols - 1 && (
                                    <ResizeHandle onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        startX.value = e.clientX
                                        setIsResizing(i)
                                        document.body.style.cursor = "col-resize"
                                    }} />
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        },
    }
)
