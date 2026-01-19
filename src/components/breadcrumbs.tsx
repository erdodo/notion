"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { getPageBreadcrumbs } from "@/app/(main)/_actions/navigation"
import { cn } from "@/lib/utils"
import { useContextMenu } from "@/hooks/use-context-menu"

interface BreadcrumbsProps {
    pageId: string
    className?: string
}

interface BreadcrumbItem {
    id: string
    title: string
    icon: string | null
}

export function Breadcrumbs({ pageId, className }: BreadcrumbsProps) {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getPageBreadcrumbs(pageId)
            .then(setBreadcrumbs)
            .finally(() => setLoading(false))
    }, [pageId])

    if (loading) {
        return (
            <div className={cn("flex items-center gap-1 text-sm", className)}>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
        )
    }

    if (breadcrumbs.length === 0) return null

    return (
        <nav
            className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
            aria-label="Breadcrumb"
        >
            {/* Home link */}
            <Link
                href="/documents"
                className="hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center gap-1">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    <BreadcrumbItemRenderer item={item} isLast={index === breadcrumbs.length - 1} />
                </div>
            ))}
        </nav>
    )
}

function BreadcrumbItemRenderer({ item, isLast }: { item: BreadcrumbItem, isLast: boolean }) {
    const { onContextMenu, onTouchStart, onTouchEnd, onTouchMove } = useContextMenu({
        type: "interface-element",
        data: { type: "breadcrumb", id: item.id, url: `${window.location.origin}/documents/${item.id}` }
    })

    const commonProps = {
        onContextMenu,
        onTouchStart,
        onTouchEnd,
        onTouchMove
    }

    if (isLast) {
        return (
            <span
                className="flex items-center gap-1 text-foreground font-medium truncate max-w-[150px]"
                {...commonProps}
            >
                {item.icon && <span>{item.icon}</span>}
                <span className="truncate">{item.title || "Untitled"}</span>
            </span>
        )
    }

    return (
        <Link
            href={`/documents/${item.id}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors truncate max-w-[150px]"
            {...commonProps}
        >
            {item.icon && <span>{item.icon}</span>}
            <span className="truncate">{item.title || "Untitled"}</span>
        </Link>
    )
}
