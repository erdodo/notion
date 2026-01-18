"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { getSharedDocuments } from "@/app/(main)/_actions/documents"
import { Item } from "@/app/(main)/_components/item"

interface SharedSectionProps {
    label?: string
}

export function SharedSection({ label = "Public" }: SharedSectionProps) {
    const params = useParams()
    const router = useRouter()
    const [documents, setDocuments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadSharedDocuments = async () => {
        setIsLoading(true)
        try {
            const docs = await getSharedDocuments()
            setDocuments(docs)
        } catch (error) {
            console.error("Failed to list shared documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSharedDocuments()

        // Listen for updates (e.g. sharing changes)
        // Ideally we'd have a specific event for sharing changes, but standard update might work
        // or we rely on page refresh for now.
        // Let's hook into window focus or a custom event if we had one.
    }, [])

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`)
    }

    if (isLoading) {
        return (
            <div className="mb-2">
                <div className="flex items-center gap-2 group/title px-3 py-1 text-sm font-medium text-muted-foreground">
                    <span className="truncate">{label}</span>
                </div>
                <div className="px-3">
                    <Skeleton className="h-4 w-[60%]" />
                </div>
            </div>
        )
    }

    if (documents.length === 0) {
        return null
    }

    return (
        <div className="mb-2">
            <div className="text-xs text-muted-foreground px-2 mb-2 pt-4">
                <span className="truncate">{label}</span>
            </div>
            {documents.map((document) => (
                <Item
                    key={document.id}
                    id={document.id}
                    title={document.title}
                    icon={document.icon}
                    fallbackIcon={Users}
                    active={params.documentId === document.id}
                    level={0}
                    onExpand={() => { }}
                    expanded={false}
                    onClick={() => onRedirect(document.id)}
                />
            ))}
        </div>
    )
}
