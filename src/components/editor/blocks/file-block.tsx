"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useEdgeStore } from "@/lib/edgestore"
import { useState, useRef } from "react"
import { Loader2, FileIcon, FileText, File as FileGeneric, Download, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const FileBlock = createReactBlockSpec(
    {
        type: "file",
        content: "none",
        propSchema: {
            url: { default: "" },
            name: { default: "File" },
            size: { default: 0 },
            type: { default: "" },
        },
    },
    {
        render: (props) => {
            const { block, editor } = props
            const { edgestore } = useEdgeStore()
            const [uploading, setUploading] = useState(false)
            const [progress, setProgress] = useState(0)
            const [error, setError] = useState("")

            const fileInputRef = useRef<HTMLInputElement>(null)

            const handleUpload = async (file: File) => {
                setUploading(true)
                setError("")
                setProgress(0)
                try {
                    // Check file size (100MB limit)
                    if (file.size > 100 * 1024 * 1024) {
                        throw new Error("File size must be less than 100MB")
                    }

                    const res = await edgestore.documentFiles.upload({
                        file,
                        onProgressChange: (val) => setProgress(val),
                    })

                    editor.updateBlock(block, {
                        props: {
                            url: res.url,
                            name: file.name,
                            size: file.size,
                            type: file.type
                        }
                    })
                } catch (e: any) {
                    setError(e?.message || "Upload failed")
                } finally {
                    setUploading(false)
                }
            }

            if (block.props.url) {
                return (
                    <div className="my-2 group relative" contentEditable={false}>
                        <a
                            href={block.props.url}
                            download
                            target="_blank"
                            className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors no-underline text-foreground"
                        >
                            <div className="bg-muted p-2 rounded">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{block.props.name}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(block.props.size)}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            </div>
                        </a>
                    </div>
                )
            }

            return (
                <div className="my-2" contentEditable={false}>
                    <div className="rounded-md border border-dashed p-4 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2">
                        {error && (
                            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded px-4 mb-2">
                                {error}
                            </div>
                        )}

                        {uploading ? (
                            <div className="flex items-center gap-3 w-full max-w-xs">
                                <Loader2 className="animate-spin text-muted-foreground h-5 w-5" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm font-medium">Upload a file</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )
        },
    }
)
