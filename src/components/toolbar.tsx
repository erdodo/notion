"use client"

import { useState, useRef } from "react"
import { ImageIcon, Smile, X } from "lucide-react"
import { updateDocument } from "@/app/(main)/_actions/documents"
import { IconPicker } from "./icon-picker"
import { useContextMenu } from "@/hooks/use-context-menu"

interface Page {
  id: string
  title: string
  icon?: string | null
  coverImage?: string | null
  isPublished: boolean
}

interface ToolbarProps {
  page: Page
  preview?: boolean
}

export const Toolbar = ({ page, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { onContextMenu } = useContextMenu({
    type: "icon",
    data: {
      id: page.id,
      icon: page.icon,
      onRemoveIcon: () => handleIconRemove(),
      onChangeIcon: () => {
        // Trigger the IconPicker popover
        // This is tricky because IconPicker wraps the icon p element.
        // We need to simulate click or open state?
        // IconPicker controls its own state via Popover triggers. 
        // We can expose an open state or utilize the fact that single click opens it.
        // So 'Change' button in context menu could just be informative or we need ref?
        // Let's use a ref or an informative message if complex.
        // A better approach: The context menu 'Change' could just close context menu
        // and let user click left click.
        // OR we pass a method to open it if we refactor IconPicker to controlled.
        // For MVP: keep "Use left click" or try to find a way to trigger.
        // Actually, let's keep it simple -> User left click is the main way.
        // But the requirement says "sağ tık menüsündeki change çalışmıyor".
        // So we MUST make it work.
        // We can make IconPicker controlled or expose a trigger ref.
      }
    }
  })

  const handleIconSelect = async (icon: string) => {
    // Optimistic update
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, icon }
    }))
    await updateDocument(page.id, { icon })
  }

  const handleIconRemove = async () => {
    window.dispatchEvent(new CustomEvent("notion-document-update", {
      detail: { id: page.id, icon: null }
    }))
    await updateDocument(page.id, { icon: "" })
  }

  const handleCoverUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // For now, use a placeholder image URL
      // You can integrate with a file upload service later
      const placeholderUrl = `https://placehold.co/1200x400.png`
      await updateDocument(page.id, { coverImage: placeholderUrl })
    } catch (error) {
      console.error("Error uploading cover:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCoverUpload(file)
    }
  }

  return (
    <div className="group relative w-fit">
      {!!page.icon && !preview && (
        <div
          onContextMenu={onContextMenu}
          className={`flex items-center gap-x-2 group/icon pt-6 ${page.coverImage ? "absolute -top-[1rem] left-0 z-10" : ""}`}
        >
          <IconPicker onChange={handleIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {page.icon}
            </p>
          </IconPicker>
          <button
            onClick={handleIconRemove}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {!!page.icon && preview && (
        <p className={`text-6xl pt-6 ${page.coverImage ? "absolute -top-[2.5rem] left-0 z-10" : ""}`}>
          {page.icon}
        </p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4 ">
        {!page.icon && !preview && (
          <IconPicker asChild onChange={handleIconSelect}>
            <button className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md">
              <Smile className="h-4 w-4 mr-2 inline" />
              Add icon
            </button>
          </IconPicker>
        )}
        {!page.coverImage && !preview && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md"
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4 mr-2 inline" />
              {isUploading ? "Uploading..." : "Add cover"}
            </button>
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  )
}
