"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
    Link,
    Copy,
    Check,
    Globe,
    Lock,
    Users,
    X,
    Loader2
} from "lucide-react"
import {
    sharePage,
    removeShare,
    updateShareRole,
    createGuestLink,
    getPageShares
} from "@/app/(main)/_actions/sharing"
import { toast } from "sonner"
import type { PageShare, ShareRole, User } from "@prisma/client"

interface ShareDialogProps {
    pageId: string
    pageTitle: string
    isPublished: boolean
    isOpen: boolean
    onClose: () => void
    onPublishChange: (published: boolean) => void
}

type PageShareWithUser = PageShare & { user: User | null }

export function ShareDialog({
    pageId,
    pageTitle,
    isPublished,
    isOpen,
    onClose,
    onPublishChange
}: ShareDialogProps) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<ShareRole>("VIEWER")
    const [shares, setShares] = useState<PageShareWithUser[]>([])
    const [loading, setLoading] = useState(true)
    const [inviting, setInviting] = useState(false)
    const [guestLink, setGuestLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const [origin, setOrigin] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin)
        }

        if (isOpen) {
            loadShares()
        }
    }, [isOpen, pageId])

    const loadShares = async () => {
        setLoading(true)
        try {
            const data = await getPageShares(pageId)
            if (Array.isArray(data)) {
                setShares(data)
            } else {
                console.error("getPageShares returned invalid data:", data)
                setShares([])
            }
        } catch (error) {
            console.error("Failed to load shares:", error)
            toast.error("Failed to load shares")
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!email.trim()) return

        setInviting(true)
        try {
            const result = await sharePage(pageId, { email, role })
            if (result.success) {
                toast.success(`Invited ${email}`)
                setEmail("")
                loadShares()
            } else {
                toast.error(result.error)
            }
        } finally {
            setInviting(false)
        }
    }

    const handleCreateGuestLink = async () => {
        const link = await createGuestLink(pageId, { role: "VIEWER" })
        setGuestLink(link)
    }

    const copyLink = async () => {
        const link = guestLink || `${window?.location?.origin}/documents/${pageId}`
        await navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Link copied")
    }

    const roleLabels: Record<ShareRole, string> = {
        VIEWER: "Can view",
        COMMENTER: "Can comment",
        EDITOR: "Can edit",
        ADMIN: "Full access"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share "{pageTitle}"</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Invite by email */}
                    <div className="space-y-2">
                        <Label>Invite people</Label>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={role} onValueChange={(v) => setRole(v as ShareRole)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleInvite} disabled={inviting || !email.trim()}>
                                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                            </Button>
                        </div>
                    </div>

                    {/* People with access */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            People with access
                        </Label>

                        {loading ? (
                            <div className="py-4 text-center text-muted-foreground">
                                Loading...
                            </div>
                        ) : shares.length === 0 ? (
                            <div className="py-4 text-center text-muted-foreground text-sm">
                                Only you have access
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {shares.map(share => (
                                    <div
                                        key={share.id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={share.user?.image || undefined} />
                                                <AvatarFallback>
                                                    {share.user?.name?.charAt(0) || share.email?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {share.user?.name || share.email}
                                                </p>
                                                {share.user?.email && share.user.email !== share.email && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {share.user.email}
                                                    </p>
                                                )}
                                                {!share.acceptedAt && share.email && (
                                                    <p className="text-xs text-amber-600">
                                                        Pending invitation
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={share.role}
                                                onValueChange={(v) => updateShareRole(share.id, v as ShareRole)}
                                            >
                                                <SelectTrigger className="w-28 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(roleLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => removeShare(share.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Public access */}
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isPublished ? (
                                    <Globe className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">
                                        {isPublished ? "Published to web" : "Private"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPublished
                                            ? "Anyone with the link can view"
                                            : "Only people invited can access"}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={isPublished}
                                onCheckedChange={onPublishChange}
                            />
                        </div>

                        {/* Copy link */}
                        <div className="flex gap-2">
                            <Input
                                value={guestLink || (origin ? `${origin}/documents/${pageId}` : "")}
                                readOnly
                                className="flex-1 text-sm"
                            />
                            <Button variant="outline" onClick={copyLink}>
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {!guestLink && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCreateGuestLink}
                            >
                                <Link className="h-4 w-4 mr-2" />
                                Create guest link
                            </Button>
                        )}
                        <div className="pt-4 mt-2 border-t space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="h-4 w-4 text-sky-500" />
                                <div>
                                    <p className="text-sm font-medium">Preview Mode</p>
                                    <p className="text-xs text-muted-foreground">View page as a visitor</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={`${origin}/preview/${pageId}`}
                                    readOnly
                                    className="flex-1 text-sm h-8"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 px-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${origin}/preview/${pageId}`);
                                        toast.success("Preview link copied");
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => window.open(`/preview/${pageId}`, '_blank')}
                                >
                                    Open
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
