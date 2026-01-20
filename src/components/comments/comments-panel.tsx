"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    MessageSquare,
    Send,
    Reply,
    Check,
    Trash2
} from "lucide-react"
import {
    getComments,
    addComment,
    deleteComment,
    resolveComment
} from "@/app/(main)/_actions/comments"
import { formatDistanceToNow } from "date-fns"
// import { tr } from "date-fns/locale" // Removed locale to avoid issues if not needed or not setup
import { useSocket } from "@/components/providers/socket-provider"
import { UserMentionInput } from "./user-mention-input"
import { cn } from "@/lib/utils"

// Define helper type for Comments with relations
type CommentWithRelations = Awaited<ReturnType<typeof getComments>>[number];

interface CommentsPanelProps {
    pageId: string
    isOpen: boolean
    onClose: () => void
}

export function CommentsPanel({ pageId, isOpen, onClose }: CommentsPanelProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<CommentWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([])
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Yorumları yükle
    useEffect(() => {
        if (isOpen) {
            loadComments()
        }
    }, [isOpen, pageId])

    // Real-time güncellemeler
    const { socket } = useSocket()

    useEffect(() => {
        if (!isOpen || !socket) return

        const channelName = `page-${pageId}`
        socket.emit("join-room", channelName)

        socket.on("comment-added", (data: { comment: CommentWithRelations }) => {
            setComments(prev => [data.comment, ...prev])
        })

        socket.on("comment-deleted", (data: { commentId: string }) => {
            setComments(prev => prev.filter(c => c.id !== data.commentId))
        })

        socket.on("comment-updated", (data: { commentId: string, content: string }) => {
            setComments(prev => prev.map(c =>
                c.id === data.commentId ? { ...c, content: data.content } : c
            ))
        })

        return () => {
            socket.emit("leave-room", channelName)
            socket.off("comment-added")
            socket.off("comment-deleted")
            socket.off("comment-updated")
        }
    }, [isOpen, pageId, socket])

    const loadComments = async () => {
        setLoading(true)
        try {
            const data = await getComments(pageId)
            setComments(data)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!newComment.trim() || !session?.user) return

        setSubmitting(true)
        try {
            await addComment(pageId, {
                content: newComment,
                parentId: replyingTo || undefined,
                mentionedUserIds
            })
            setNewComment("")
            setMentionedUserIds([])
            setReplyingTo(null)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments ({comments.length})
                    </SheetTitle>
                </SheetHeader>

                {/* Comment list */}
                <ScrollArea className="flex-1 -mx-6 px-6">
                    {loading ? (
                        <div className="space-y-4 pt-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-24 bg-muted rounded" />
                                            <div className="h-12 bg-muted rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No comments yet</p>
                            <p className="text-sm">Be the first to comment</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-4">
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={session?.user?.id}
                                    onReply={() => setReplyingTo(comment.id)}
                                    onDelete={() => deleteComment(comment.id)}
                                    onResolve={() => resolveComment(comment.id)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* New comment input */}
                <div className="border-t pt-4 mt-4">
                    {replyingTo && (
                        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                            <span>Replying to comment</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-2 items-start">
                        <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={session?.user?.image || undefined} />
                            <AvatarFallback>
                                {session?.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 flex gap-2 items-start">
                            <UserMentionInput
                                value={newComment}
                                onChange={setNewComment}
                                onMentionsChange={setMentionedUserIds}
                                placeholder="Write a comment..."
                                className="flex-1"
                            />
                            <Button
                                size="icon"
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || submitting}
                                className="mt-1"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Tek yorum komponenti
function CommentItem({
    comment,
    currentUserId,
    onReply,
    onDelete,
    onResolve
}: {
    comment: CommentWithRelations
    currentUserId?: string
    onReply: () => void
    onDelete: () => void
    onResolve: () => void
}) {
    const isOwner = comment.userId === currentUserId

    return (
        <div className={cn(
            "group",
            comment.resolved && "opacity-60"
        )}>
            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true
                            })}
                        </span>
                        {comment.editedAt && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                        {comment.resolved && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Resolved
                            </span>
                        )}
                    </div>

                    <p className="text-sm mt-1 whitespace-pre-wrap">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={onReply} className="h-6 px-2 text-xs">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                        </Button>
                        {!comment.resolved && (
                            <Button variant="ghost" size="sm" onClick={onResolve} className="h-6 px-2 text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Resolve
                            </Button>
                        )}
                        {isOwner && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive h-6 px-2 text-xs"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2">
                            {comment.replies.map((reply: any) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    onReply={onReply}
                                    onDelete={() => deleteComment(reply.id)}
                                    onResolve={() => resolveComment(reply.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
