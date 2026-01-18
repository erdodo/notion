"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare } from "lucide-react"
import { ShareDialog } from "@/components/share-dialog"
import { CommentsPanel } from "@/components/comments/comments-panel"
import { PresenceIndicators } from "@/components/presence-indicators"
import { togglePublish } from "@/app/(main)/_actions/documents"
import { toast } from "sonner"

interface DocumentNavbarActionsProps {
    pageId: string
    pageTitle: string
    isPublished: boolean
}

export function DocumentNavbarActions({ pageId, pageTitle, isPublished: initialPublished }: DocumentNavbarActionsProps) {
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [isCommentsOpen, setIsCommentsOpen] = useState(false)
    const [isPublished, setIsPublished] = useState(initialPublished)

    const handlePublishChange = async (published: boolean) => {
        // Optimistic update
        setIsPublished(published)

        try {
            const result = await togglePublish(pageId)
            // Ensure sync
            if (result.isPublished !== published) {
                setIsPublished(result.isPublished)
            }

            if (result.isPublished) {
                toast.success("Page published to web")
            } else {
                toast.success("Page unpublished")
            }
        } catch (error) {
            setIsPublished(!published) // Revert on error
            toast.error("Failed to update publish status")
        }
    }

    return (
        <div className="flex items-center gap-1">
            <PresenceIndicators pageId={pageId} className="mr-2" />

            <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setIsShareOpen(true); }} className="h-9 px-2">
                <Users className="h-4 w-4 mr-2" />
                Share
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setIsCommentsOpen(true)} className="h-9 px-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
            </Button>

            <ShareDialog
                pageId={pageId}
                pageTitle={pageTitle}
                isPublished={isPublished}
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                onPublishChange={handlePublishChange}
            />

            <CommentsPanel
                pageId={pageId}
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
            />
        </div>
    )
}
