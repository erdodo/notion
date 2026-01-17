"use client"

import { ChevronDown, ChevronRight, Plus, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ItemProps {
  id: string
  title: string
  icon?: string
  level?: number
  expanded?: boolean
  onExpand?: () => void
  onClick?: () => void
  onCreate?: () => void
  hasChildren?: boolean
  isCreating?: boolean
}

export const Item = ({
  id,
  title,
  icon,
  level = 0,
  expanded = false,
  onExpand,
  onClick,
  onCreate,
  hasChildren = false,
  isCreating = false
}: ItemProps) => {
  const router = useRouter()

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onExpand) {
      onExpand()
    }
  }

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCreate) {
      onCreate()
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/documents/${id}`)
    }
  }

  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  return (
    <div
      onClick={handleClick}
      role="button"
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium cursor-pointer",
      )}
      style={{
        paddingLeft: level > 0 ? `${(level * 12) + 12}px` : "12px"
      }}
    >
      {hasChildren && (
        <div
          role="button"
          onClick={handleExpand}
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
        >
          <ChevronIcon className="h-4 w-4 shrink-0" />
        </div>
      )}
      
      {!hasChildren && (
        <div className="h-4 w-4 mr-1" />
      )}

      <div className="flex items-center gap-x-2 flex-1 truncate">
        {icon ? (
          <span className="shrink-0 text-[18px]">{icon}</span>
        ) : (
          <FileText className="shrink-0 h-[18px] w-[18px]" />
        )}
        <span className="truncate">{title}</span>
      </div>

      <div className="flex items-center gap-x-2 ml-auto">
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 p-0.5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
