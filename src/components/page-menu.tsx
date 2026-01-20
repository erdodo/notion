"use client"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, History, Trash, Undo, Copy, FilePlus, ArrowRight, Lock, Unlock, FileText, Type } from "lucide-react"
import { useHistory } from "@/hooks/use-history"
import { removeDocument, archiveDocument, updateDocument, duplicateDocument } from "@/app/(main)/_actions/documents"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Page } from "@prisma/client"

interface PageMenuProps {
    documentId: string
    isArchived: boolean
    document?: Page
}

export const PageMenu = ({ documentId, isArchived, document }: PageMenuProps) => {
    const history = useHistory()
    const router = useRouter()

    const onArchive = async () => {
        const promise = archiveDocument(documentId)
        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Moved to trash!",
            error: "Failed to archive."
        })
        router.push("/documents")
    }

    const onUpdate = (key: string, value: any) => {
        if (!document) return;
        const promise = updateDocument(documentId, { [key]: value });
        toast.promise(promise, {
            loading: "Updating...",
            success: "Updated!",
            error: "Failed to update."
        });
        router.refresh();
    }

    const onCopyLink = () => {
        const url = `${window.location.origin}/documents/${documentId}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    }

    const onDuplicate = async () => {
        const promise = duplicateDocument(documentId)
        toast.promise(promise, {
            loading: "Duplicating...",
            success: "Duplicated!",
            error: "Failed to duplicate."
        })
        router.refresh()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2" forceMount>
                {document && (
                    <>
                        {/* Font Styles */}
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-xs text-muted-foreground">Style</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 pb-2">
                            <Button
                                variant={document.fontStyle === "sans" || !document.fontStyle || document.fontStyle === "DEFAULT" ? "outline" : "ghost"}
                                size="sm"
                                className="h-20 flex-1 flex flex-col gap-2 border-muted-foreground/20"
                                onClick={() => onUpdate("fontStyle", "sans")}
                            >
                                <span className="text-2xl font-sans">Ag</span>
                                <span className="text-xs text-muted-foreground font-normal">Default</span>
                            </Button>
                            <Button
                                variant={document.fontStyle === "serif" ? "outline" : "ghost"}
                                size="sm"
                                className="h-20 flex-1 flex flex-col gap-2 border-muted-foreground/20"
                                onClick={() => onUpdate("fontStyle", "serif")}
                            >
                                <span className="text-2xl font-serif">Ag</span>
                                <span className="text-xs text-muted-foreground font-normal">Serif</span>
                            </Button>
                            <Button
                                variant={document.fontStyle === "mono" ? "outline" : "ghost"}
                                size="sm"
                                className="h-20 flex-1 flex flex-col gap-2 border-muted-foreground/20"
                                onClick={() => onUpdate("fontStyle", "mono")}
                            >
                                <span className="text-2xl font-mono">Ag</span>
                                <span className="text-xs text-muted-foreground font-normal">Mono</span>
                            </Button>
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Actions */}
                <DropdownMenuItem onClick={onCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                    <span className="ml-auto text-xs text-muted-foreground">⌘L</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate} disabled>
                    <Fileplus className="h-4 w-4 mr-2" />
                    Duplicate
                    <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Toggles */}
                {document && (
                    <>
                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Type className="h-4 w-4" />
                                Small text
                            </div>
                            <Switch
                                checked={document.isSmallText}
                                onCheckedChange={(checked) => onUpdate("isSmallText", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-2 text-sm">
                                <ArrowRight className="h-4 w-4" />
                                Full width
                            </div>
                            <Switch
                                checked={document.isFullWidth}
                                onCheckedChange={(checked) => onUpdate("isFullWidth", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-2 text-sm">
                                {document.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                Lock page
                            </div>
                            <Switch
                                checked={document.isLocked}
                                onCheckedChange={(checked) => onUpdate("isLocked", checked)}
                            />
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}


                <DropdownMenuItem onClick={() => history.onOpen(documentId)}>
                    <History className="h-4 w-4 mr-2" />
                    Page History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive} className="text-red-600 focus:text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <div className="text-xs text-muted-foreground p-2">
                    Last edited by you just now
                    <br />
                    Word count: 0
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function Fileplus(props: any) {
    return <FilePlus {...props} />
}
