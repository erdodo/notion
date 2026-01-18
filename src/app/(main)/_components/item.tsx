"use client"

import { ChevronDown, ChevronRight, Plus, FileText, MoreHorizontal, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { archiveDocument } from "../_actions/documents"
import { useMovePage } from "@/hooks/use-move-page"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ItemProps {
  id: string
  title: string
  icon?: string
  parentId?: string | null
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
  parentId,
  level = 0,
  expanded = false,
  onExpand,
  onClick,
  onCreate,
  hasChildren = false,
  isCreating = false
}: ItemProps) => {
  const router = useRouter()
  const { onOpen } = useMovePage()

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

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await archiveDocument(id)
    router.push("/documents")
  }

  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium cursor-pointer",
      )}
      style={{
        paddingLeft: level > 0 ? `${(level * 12) + 12}px` : "12px"
      }}
    >
      {hasChildren && (
        <button
          type="button"
          onClick={handleExpand}
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
        >
          <ChevronIcon className="h-4 w-4 shrink-0" />
        </button>
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

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 p-0.5"
            asChild
          >
            <button>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60"
            align="start"
            side="right"
            forceMount
          >
            <DropdownMenuItem onClick={handleArchive}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onOpen(id, parentId || null)
            }}>
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Move to...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="text-xs text-muted-foreground p-2">
              Last edited by: User
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
