"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useState } from "react"
import { LayoutTemplate, Link as LinkIcon, AlertCircle } from "lucide-react"
import { getEmbedUrl } from "@/lib/embed-utils"
import { cn } from "@/lib/utils"

export const EmbedBlock = createReactBlockSpec(
    {
        type: "embed",
        content: "none",
        propSchema: {
            url: { default: "" },
            caption: { default: "" },
        },
    },
    {
        render: (props) => {
            const { block, editor } = props
            const [inputUrl, setInputUrl] = useState("")
            const [error, setError] = useState("")

            const handleUrlSubmit = () => {
                if (!inputUrl) return
                try {
                    new URL(inputUrl)
                    // Check if it's a supported embed
                    const embedUrl = getEmbedUrl(inputUrl)
                    if (!embedUrl) {
                        setError("Unsupported URL or invalid format")
                        return
                    }
                    editor.updateBlock(block, {
                        props: { url: inputUrl }
                    })
                } catch {
                    setError("Invalid URL")
                }
            }

            if (block.props.url) {
                const embedUrl = getEmbedUrl(block.props.url)

                if (!embedUrl) {
                    return (
                        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded text-destructive flex gap-2 items-center">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">Failed to embed: Unsupported URL</p>
                            <button
                                onClick={() => editor.updateBlock(block, { props: { url: "" } })}
                                className="text-xs underline ml-auto"
                            >
                                Change
                            </button>
                        </div>
                    )
                }

                return (
                    <div className="my-4 relative group w-full" contentEditable={false}>
                        <div className="aspect-video w-full rounded-md overflow-hidden bg-muted border relative">
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                title="Embed"
                            />
                        </div>
                        <input
                            className="text-center text-sm text-muted-foreground bg-transparent border-none outline-none mt-2 w-full placeholder:text-muted-foreground/50"
                            placeholder="Write a caption..."
                            value={block.props.caption}
                            onChange={(e) => editor.updateBlock(block, { props: { caption: e.target.value } })}
                        />
                    </div>
                )
            }

            return (
                <div className="my-2" contentEditable={false}>
                    <div className="rounded-md border p-3 bg-muted/20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <LayoutTemplate className="h-4 w-4" />
                            <span className="text-sm font-medium">Embed</span>
                        </div>

                        {error && (
                            <div className="text-destructive text-xs px-1">
                                {error}
                            </div>
                        )}

                        <div className="flex w-full items-center gap-2">
                            <input
                                className="flex-1 bg-background border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 ring-primary"
                                placeholder="Paste link (YouTube, Vimeo, Figma, Twitter, etc.)"
                                value={inputUrl}
                                onChange={(e) => {
                                    setInputUrl(e.target.value)
                                    setError("")
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                            />
                            <button
                                onClick={handleUrlSubmit}
                                className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm hover:opacity-90 font-medium"
                            >
                                Embed link
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                            Works with YouTube, Vimeo, Twitter, Figma, etc.
                        </p>
                    </div>
                </div>
            )
        },
    }
)
