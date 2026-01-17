"use client"

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
import { createReactBlockSpec } from "@blocknote/react"
import {
    ChevronRight,
    ChevronDown,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Quote,
    List,
    Link as LinkIcon,
    Loader2,
    AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { fetchLinkMetadata } from "@/app/(main)/_actions/utils"

// --- 1. Toggle Block ---
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
                    {/* Children are rendered by the editor automatically for blocks with content */}
                    {/* Note: In BlockNote custom blocks, children rendering handles nested blocks. 
              But for visibility toggle, we rely on editor logic or CSS. 
              Actually custom blocks with children need specific handling or just rely on the editor's structure. 
              However, strictly hiding children in a custom block via React state might desync with editor model.
              Usually default 'toggle' block handles this. 
              For this implementation, we will use the open state to just visually style or rely on BlockNote's nesting.
              Wait, standard BlockNote toggle hides children when closed. 
              For a custom block, we might not easily control children visibility without hacking.
              However, we can just define the spec and the UI. The editor handles the hierarchy.
              Let's trust the prop update persists.
          */}
                </div>
            )
        },
    }
)

// --- 2. Callout Block ---
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
            // Color map based on common Notion colors
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

// --- 3. Quote Block ---
export const QuoteBlock = createReactBlockSpec(
    {
        type: "quote",
        content: "inline",
        propSchema: {},
    },
    {
        render: (props) => (
            <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 my-2 italic text-muted-foreground bg-accent/20 py-2 rounded-r" >
                <div className="flex-1 min-w-0" ref={props.contentRef} />
            </div>
        ),
    }
)

// --- 4. Divider Block ---
export const DividerBlock = createReactBlockSpec(
    {
        type: "divider",
        content: "none",
        propSchema: {
            style: {
                default: "solid",
                values: ["solid", "dashed", "dotted"],
            },
        },
    },
    {
        render: (props) => (
            <div className="py-2 cursor-pointer group" contentEditable={false} >
                <hr
                    className={`border-t-2 border-border group-hover:border-primary/50 transition-colors
              ${props.block.props.style === "dashed" ? "border-dashed" : ""} 
              ${props.block.props.style === "dotted" ? "border-dotted" : ""}
              ${props.block.props.style === "solid" ? "border-solid" : ""}
            `}
                />
            </div>
        ),
    }
)

// --- 5. Table of Contents Block ---
export const TOCBlock = createReactBlockSpec(
    {
        type: "toc",
        content: "none",
        propSchema: {},
    },
    {
        render: (props) => {
            const { editor } = props
            const [headings, setHeadings] = useState<{ id: string; text: string; level: number; blockId: string }[]>([])

            useEffect(() => {
                const updateHeadings = () => {
                    const doc = editor.document
                    const newHeadings: typeof headings = []

                    doc.forEach((block) => {
                        if ((block as any).type === "heading") {
                            // Safe cast or check
                            const level = (block.props as any).level || 1
                            const content = (block as any).content
                            // Check if content is array (it is for heading)
                            const text = (content as any[]).map((c: any) => c.text).join("")

                            if (text) {
                                newHeadings.push({
                                    id: block.id,
                                    text,
                                    level,
                                    blockId: block.id
                                })
                            }
                        }
                    })

                    // JSON stringify comparison to avoid loops
                    setHeadings(prev => JSON.stringify(prev) === JSON.stringify(newHeadings) ? prev : newHeadings)
                }

                // Initial scan
                updateHeadings()

                // Subscribe to updates depends on BlockNote API. 
                // We can subscribe to editor.onEditorContentChange if available on the instance usage side, but inside a block 
                // we might not get notified easily unless we use external store or effect.
                // However, a simple interval or mouse enter can trigger update for now or better, 
                // we rely on re-renders if parent updates.
                // For accurate updates, BlockNote usually recommends side-effects outside. 
                // But let's try a simple interval for this MVP to catch changes.
                const interval = setInterval(updateHeadings, 1000)
                return () => clearInterval(interval)

            }, [editor])

            return (
                <div className="bg-muted/30 p-4 rounded-lg my-2 w-full" contentEditable={false} >
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2" > Table of Contents </p>
                    {
                        headings.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic" > No headings found.</p>
                        ) : (
                            <div className="flex flex-col gap-1" >
                                {
                                    headings.map((h) => (
                                        <div
                                            key={h.blockId}
                                            className="text-sm hover:underline cursor-pointer text-blue-600 dark:text-blue-400"
                                            style={{ marginLeft: `${(h.level - 1) * 1.5}rem` }}
                                            onClick={() => {
                                                // Find the block element in DOM and scroll
                                                // BlockNote assigns data-id={blockId} to blocks
                                                const element = document.querySelector(`[data-id="${h.blockId}"]`)
                                                if (element) {
                                                    element.scrollIntoView({ behavior: "smooth", block: "center" })
                                                }
                                            }}
                                        >
                                            {h.text}
                                        </div>
                                    ))}
                            </div>
                        )}
                </div>
            )
        },
    }
)

// --- 6. Bookmark Block ---
export const BookmarkBlock = createReactBlockSpec(
    {
        type: "bookmark",
        content: "none",
        propSchema: {
            url: { default: "" },
        },
    },
    {
        render: (props) => {
            const { block, editor } = props
            const url = block.props.url
            const [loading, setLoading] = useState(false)
            const [error, setError] = useState(false)
            const [metadata, setMetadata] = useState<{ title?: string; description?: string; image?: string; favicon?: string } | null>(null)
            const [inputUrl, setInputUrl] = useState("")

            useEffect(() => {
                if (!url) return

                const fetchData = async () => {
                    setLoading(true)
                    setError(false)
                    try {
                        // In a real app we would check cache or similar. 
                        // Here we just call the server action we created.
                        const data = await fetchLinkMetadata(url)
                        if (!data) throw new Error("No data")
                        setMetadata(data)
                    } catch (e) {
                        console.error(e)
                        setError(true)
                    } finally {
                        setLoading(false)
                    }
                }

                fetchData()
            }, [url])

            const handleSetUrl = () => {
                if (!inputUrl) return
                // Basic validation
                try {
                    new URL(inputUrl)
                    editor.updateBlock(block, { props: { url: inputUrl } })
                } catch {
                    alert("Invalid URL")
                }
            }

            const clearUrl = () => {
                editor.updateBlock(block, { props: { url: "" } })
                setMetadata(null)
            }

            if (!url) {
                return (
                    <div className="p-3 bg-muted/20 border rounded flex gap-2 items-center" contentEditable={false} >
                        <LinkIcon className="text-muted-foreground h-4 w-4" />
                        <input
                            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground/50"
                            placeholder="Paste a URL to create a bookmark..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSetUrl()
                            }}
                        />
                        < button
                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 transition-opacity"
                            onClick={handleSetUrl}
                        >
                            Bookmark
                        </button>
                    </div>
                )
            }

            return (
                <div className="my-2 group relative" contentEditable={false} >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" >
                        <button onClick={clearUrl} className="bg-background/80 p-1 rounded-full border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors" >
                            <XCircle size={16} />
                        </button>
                    </div>

                    < a href={url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors no-underline" >
                        {
                            loading ? (
                                <div className="flex items-center justify-center p-8 text-muted-foreground gap-2" >
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span className="text-sm" > Loading preview...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center p-4 gap-2 text-destructive" >
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="text-sm" > Failed to load preview for {url} </span>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row h-full" >
                                    <div className="flex-1 p-3 overflow-hidden" >
                                        <div className="text-sm font-semibold truncate mb-1 text-foreground" > {metadata?.title || url}</div>
                                        < div className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2" >
                                            {metadata?.description || "No description available"}
                                        </div>
                                        < div className="flex items-center gap-2 mt-auto" >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {metadata?.favicon && <img src={metadata.favicon} alt="" className="w-4 h-4 object-contain" />}
                                            <span className="text-xs text-muted-foreground truncate" > {new URL(url).hostname} </span>
                                        </div>
                                    </div>
                                    {
                                        metadata?.image && (
                                            <div className="w-full md:w-1/3 h-32 md:h-auto overflow-hidden bg-muted relative" >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                < img src={metadata.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                    </a>
                </div>
            )
        },
    }
)

export const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        toggle: ToggleBlock(),
        callout: CalloutBlock(),
        quote: QuoteBlock(),
        divider: DividerBlock(),
        toc: TOCBlock(),
        bookmark: BookmarkBlock(),
    },
})
