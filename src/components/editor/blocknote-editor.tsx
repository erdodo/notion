"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { PartialBlock } from "@blocknote/core"
import { useCreateBlockNote, getDefaultReactSlashMenuItems, SuggestionMenuController } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { ChevronRight } from "lucide-react"
import { schema } from "./schema"
import { useEdgeStore } from "@/lib/edgestore"
import { SlashMenu } from "./slash-menu"

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  editable?: boolean
  documentId?: string
}

// Simple filter implementation since export is missing/changed
const filterSuggestionItems = (items: any[], query: string) => {
  return items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.aliases?.some((alias: string) => alias.toLowerCase().includes(query.toLowerCase()))
  )
}

const insertOrUpdateBlock = (editor: typeof schema.BlockNoteEditor, block: any) => {
  const currentBlock = editor.getTextCursorPosition().block
  editor.replaceBlocks([currentBlock], [block])
}


export const BlockNoteEditorComponent = ({
  initialContent,
  onChange,
  editable = true,
  documentId
}: BlockNoteEditorProps) => {
  const { resolvedTheme } = useTheme()
  const { edgestore } = useEdgeStore()
  const [mounted, setMounted] = useState(false)
  // Slash menu state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [slashMenuQuery, setSlashMenuQuery] = useState("")
  const [slashMenuIndex, setSlashMenuIndex] = useState(0)
  const [filteredItems, setFilteredItems] = useState<any[]>([])

  // Parse initial content from JSON string
  const parsedContent = useMemo(() => {
    if (!initialContent) {
      return undefined
    }

    try {
      return JSON.parse(initialContent) as PartialBlock[]
    } catch (error) {
      console.error("Error parsing initial content:", error)
      return undefined
    }
  }, [initialContent])

  // Create editor instance using the hook
  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    // We disable default uploadFile because we handle it via onDrop to support different block types
    // or we can keep it for paste events (typically images)
    uploadFile: async (file: File) => {
      const res = await edgestore.editorMedia.upload({ file });
      return res.url;
    },
  })

  // Global Drag & Drop Handler
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    // Find insertion position
    // If dropped on the editor, BlockNote might attempt to handle it if we propagate?
    // But we prevented default.
    // Ideally we insert at the best guess or at the end of current selection.

    // Process files
    for (const file of Array.from(files)) {
      try {
        // Determine bucket and block type
        let bucket = edgestore.editorMedia
        let blockType = "file"
        let props: any = { title: file.name }

        if (file.type.startsWith("image/")) {
          bucket = edgestore.editorMedia
          blockType = "image"
          props = { caption: "" }
        } else if (file.type.startsWith("video/")) {
          bucket = edgestore.editorMedia
          blockType = "video"
          props = { caption: "" }
        } else if (file.type.startsWith("audio/")) {
          bucket = edgestore.editorMedia
          blockType = "audio"
          props = { title: file.name, caption: "" }
        } else {
          bucket = edgestore.documentFiles
          blockType = "file"
          props = { name: file.name, size: file.size, type: file.type }
        }

        const res = await bucket.upload({ file })

        // Insert block
        const currentBlock = editor.getTextCursorPosition().block
        editor.insertBlocks(
          [{
            type: blockType,
            props: {
              url: res.url,
              ...props
            }
          } as any], // Type casting to satisfy BlockNote's specific block types union
          currentBlock,
          "after"
        )

      } catch (error) {
        console.error("Drop upload failed", error)
      }
    }
  }

  // Define custom slash menu items
  const getCustomSlashMenuItems = (editor: typeof schema.BlockNoteEditor) => {
    // Get default items
    const defaultItems = getDefaultReactSlashMenuItems(editor)

    // Create new items
    const customItems = [
      {
        title: "Image",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "image", })
        },
        aliases: ["image", "img", "picture"],
        group: "Media",
        icon: <div className="text-xl">🖼️</div>,
        subtext: "Upload or embed an image",
      },
      {
        title: "Video",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "video" })
        },
        aliases: ["video", "movie", "film"],
        group: "Media",
        icon: <div className="text-xl">🎥</div>,
        subtext: "Embed or upload a video",
      },
      {
        title: "Audio",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "audio" })
        },
        aliases: ["audio", "music", "sound"],
        group: "Media",
        icon: <div className="text-xl">🎵</div>,
        subtext: "Embed or upload audio",
      },
      {
        title: "File",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "file" })
        },
        aliases: ["file", "attachment", "document"],
        group: "Media",
        icon: <div className="text-xl">📄</div>,
        subtext: "Upload a file attachment",
      },
      {
        title: "Embed",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "embed" })
        },
        aliases: ["embed", "iframe"],
        group: "Media",
        icon: <div className="text-xl">🔗</div>,
        subtext: "Embed from another site",
      },
      {
        title: "Toggle List",
        onItemClick: () => {
          insertOrUpdateBlock(editor, { type: "toggle", })
        },
        aliases: ["toggle", "collapse"],
        group: "Advanced",
        icon: <div className="text-xl"><ChevronRight size={18} /></div>,
        subtext: "Toggleable list item",
      },
      {
        title: "Callout",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "callout",
          })
        },
        aliases: ["callout", "attention", "alert"],
        group: "Advanced",
        icon: "💡",
        subtext: "Highlight important information",
      },
      {
        title: "Quote",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "quote",
          })
        },
        aliases: ["quote", "citation"],
        group: "Basic",
        icon: "❝",
        subtext: "Capture a quote",
      },
      {
        title: "Divider",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "divider",
          })
        },
        aliases: ["divider", "hr", "separator"],
        group: "Basic",
        icon: "―",
        subtext: "Visually separate content",
      },
      {
        title: "Table of Contents",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "toc",
          })
        },
        aliases: ["toc", "outline"],
        group: "Advanced",
        icon: "📑",
        subtext: "Overview of page headings",
      },
      {
        title: "Bookmark",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "bookmark",
          })
        },
        aliases: ["bookmark", "link", "embed"],
        group: "Media",
        icon: "🔗",
        subtext: "Link with preview",
      },
      {
        title: "Page",
        onItemClick: async () => {
          const { createDocument } = await import("@/app/(main)/_actions/documents")
          const doc = await createDocument("Untitled", documentId) // Pass documentId as parent
          // Insert link to page
          editor.insertBlocks(
            [{
              type: "paragraph",
              content: [{ type: "link", href: `/documents/${doc.id}`, content: "Untitled Page" }]
            } as any],
            editor.getTextCursorPosition().block,
            "after"
          )
        },
        aliases: ["page", "new page"],
        group: "Basic",
        icon: <div className="text-xl">📄</div>,
        subtext: "Embed a sub-page",
      },
      {
        title: "Database - Full Page",
        onItemClick: async () => {
          const { createDatabase } = await import("@/app/(main)/_actions/database")
          const { page } = await createDatabase(documentId) // Pass documentId as parent
          // Insert link to database
          editor.insertBlocks(
            [{
              type: "paragraph",
              content: [{ type: "link", href: `/documents/${page.id}`, content: "Untitled Database" }]
            } as any],
            editor.getTextCursorPosition().block,
            "after"
          )
        },
        aliases: ["database", "table", "db", "full page database"],
        group: "Basic",
        icon: <div className="text-xl">🗄️</div>,
        subtext: "Create a full page database",
      },
    ]

    // Filter out ANY default item if its title matches one of our custom items
    const customTitles = new Set(customItems.map(i => i.title))
    // Also filter out default media items we are replacing (e.g. Image if blocknote has one)
    const filteredDefaultItems = defaultItems.filter(i => !customTitles.has(i.title) && i.title !== "Image")

    // Combine all items
    const combinedItems = [...filteredDefaultItems, ...customItems]

    // Deduplicate items by title
    const uniqueItemsMap = new Map()
    combinedItems.forEach(item => {
      if (!uniqueItemsMap.has(item.title)) {
        uniqueItemsMap.set(item.title, item)
      }
    })
    const allItems = Array.from(uniqueItemsMap.values())

    // Group items
    const groupedItems: Record<string, typeof allItems> = {}
    const groupOrder: string[] = []

    allItems.forEach(item => {
      const group = item.group || "Other"
      if (!groupedItems[group]) {
        groupedItems[group] = []
        groupOrder.push(group)
      }
      groupedItems[group].push(item)
    })

    // Flatten back to array
    return groupOrder.flatMap(group => groupedItems[group])
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update filtered items when query changes
  useEffect(() => {
    if (slashMenuOpen) {
      const allItems = getCustomSlashMenuItems(editor)
      const filtered = filterSuggestionItems(allItems, slashMenuQuery)
      setFilteredItems(filtered)
      setSlashMenuIndex(0) // Reset selection
    }
  }, [slashMenuOpen, slashMenuQuery, editor])


  // Manual Slash Menu Trigger
  useEffect(() => {
    const checkSlashMenu = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const text = range.startContainer.textContent || ""
      const offset = range.startOffset

      // Text before cursor
      const textBefore = text.slice(0, offset)

      // Regex: / followed by search term, at start of line or after space
      const match = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/)

      if (match) {
        // Found slash command!
        const query = match[1]
        setSlashMenuQuery(query)
        setSlashMenuOpen(true)

        // Calculate position
        const rect = range.getBoundingClientRect()
        setSlashMenuPosition({ x: rect.left, y: rect.bottom })
      } else {
        // Close if no match (and maybe we were open)
        // But we need to be careful not to close on every selection change if we want it to persist?
        // Actually, if you type away the slash, it should close.
        // If you click elsewhere, it should close.
        setSlashMenuOpen(false)
      }
    }

    // Listen to selection change and keyup (for text updates)
    document.addEventListener("selectionchange", checkSlashMenu)
    document.addEventListener("keyup", checkSlashMenu)
    // also click
    document.addEventListener("click", checkSlashMenu)

    return () => {
      document.removeEventListener("selectionchange", checkSlashMenu)
      document.removeEventListener("keyup", checkSlashMenu)
      document.removeEventListener("click", checkSlashMenu)
    }
  }, [editor])

  // Keyboard navigation for menu
  useEffect(() => {
    if (!slashMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSlashMenuIndex(prev => (prev + 1) % filteredItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSlashMenuIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = filteredItems[slashMenuIndex]
        if (item) {
          // Before executing, we might want to cleanup the slash command text?
          // Default BlockNote behavior usually replaces the block text or inserts block.
          // insertOrUpdateBlock replaces current block logic.
          // Since our current block HAS the slash text, replacing it is correct.
          // But if we are mid-line?
          // `insertOrUpdateBlock` typically replaces the *whole* block.
          // If we want inline replacement (like Notion's turn into), standard API replaces block.
          // Our implementation: `insertOrUpdateBlock` -> `replaceBlocks([currentBlock], ...)`
          // This is fine for simple "Turn into" or "Create new".

          item.onItemClick(editor)
          setSlashMenuOpen(false)
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        setSlashMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [slashMenuOpen, slashMenuIndex, filteredItems, editor])

  // Handle changes
  const handleEditorChange = () => {
    const blocks = editor.document
    const jsonContent = JSON.stringify(blocks)
    onChange(jsonContent)
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`blocknote-editor relative rounded-md transition-colors ${isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
        slashMenu={false} // Disable default menu
      >
        {/* We use our custom menu outside */}
      </BlockNoteView>

      {slashMenuOpen && (
        <SlashMenu
          items={filteredItems}
          selectedIndex={slashMenuIndex}
          onItemClick={(item: any) => {
            item.onItemClick(editor)
            setSlashMenuOpen(false)
          }}
          onClose={() => {
            setSlashMenuOpen(false)
          }}
          position={slashMenuPosition}
        />
      )}

      {/* Overlay for drop indication */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md pointer-events-none">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-lg">
            Drop files to upload
          </div>
        </div>
      )}
    </div>
  )
}
