"use client"

import { useHistory } from "@/hooks/use-history"
import { BlockNoteEditorComponent } from "@/components/editor/blocknote-editor"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { getPageHistory, restorePage } from "@/app/(main)/_actions/documents"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const HistoryModal = () => {
    const history = useHistory()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [versions, setVersions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedVersion, setSelectedVersion] = useState<any | null>(null)

    useEffect(() => {
        if (history.isOpen && history.documentId) {
            setLoading(true)
            getPageHistory(history.documentId)
                .then((data) => {
                    setVersions(data)
                    if (data.length > 0) setSelectedVersion(data[0])
                })
                .catch(() => toast.error("Failed to load history"))
                .finally(() => setLoading(false))
        }
    }, [history.isOpen, history.documentId])

    const onRestore = async () => {
        if (!selectedVersion || !history.documentId) return

        const promise = restorePage(history.documentId, selectedVersion.id)

        toast.promise(promise, {
            loading: "Restoring version...",
            success: () => {
                history.onClose()
                return "Page restored!"
            },
            error: "Failed to restore"
        })
    }

    if (!history.isOpen) return null

    return (
        <Dialog open={history.isOpen} onOpenChange={history.onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b pb-2 hidden">
                    <DialogTitle>Page History</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 h-full overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-64 border-r overflow-y-auto bg-secondary/30">
                        <div className="p-4 border-b font-medium text-sm">Version History</div>
                        {loading && <div className="p-4 text-xs text-muted-foreground">Loading...</div>}

                        {!loading && versions.length === 0 && (
                            <div className="p-4 text-xs text-muted-foreground">No history found.</div>
                        )}

                        {versions.map((version) => (
                            <div
                                key={version.id}
                                onClick={() => setSelectedVersion(version)}
                                className={`p-3 border-b text-sm cursor-pointer hover:bg-secondary/50 transition-colors ${selectedVersion?.id === version.id ? "bg-secondary" : ""}`}
                            >
                                <div className="font-medium">
                                    {formatDistanceToNow(new Date(version.savedAt), { addSuffix: true })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                    <Avatar className="h-4 w-4">
                                        <AvatarImage src={version.user.image} />
                                        <AvatarFallback>{version.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{version.user.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
                        <div className="p-4 border-b flex items-center justify-between bg-background z-10">
                            <span className="font-medium">
                                {selectedVersion ? "Preview" : "Select a version"}
                            </span>
                            <Button size="sm" onClick={onRestore} disabled={!selectedVersion}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore this version
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none">
                            {selectedVersion?.content ? (
                                <div className="pl-4">
                                    <BlockNoteEditorComponent
                                        editable={false}
                                        initialContent={selectedVersion.content}
                                        onChange={() => { }}
                                        disableCollaboration={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Select a version to preview
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
