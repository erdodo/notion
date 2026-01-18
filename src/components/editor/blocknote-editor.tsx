"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useTheme } from "next-themes"
import { PartialBlock } from "@blocknote/core"
import { useCreateBlockNote, getDefaultReactSlashMenuItems } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { ChevronRight } from "lucide-react"
import { schema } from "./schema"
import { useEdgeStore } from "@/lib/edgestore"
import { SlashMenu } from "./slash-menu"
import { PageMentionPicker } from "./page-mention-picker"
import { FormattingToolbar } from "./formatting-toolbar"
import { getBlockColorStyle, BlockColor } from "@/lib/block-utils"

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  editable?: boolean
  documentId?: string
}

// Simple filter implementation
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

  // Mention menu state
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [mentionQuery, setMentionQuery] = useState("")

  // Parse initial content from JSON string
  const parsedContent = useMemo(() => {
    if (!initialContent) return undefined
    try {
      return JSON.parse(initialContent) as PartialBlock[]
    } catch (error) {
      console.error("Error parsing initial content:", error)
      return undefined
    }
  }, [initialContent])

  // Create editor instance
  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    uploadFile: async (file: File) => {
      const res = await edgestore.editorMedia.upload({ file });
      return res.url;
    },
  })

  // Watch for external content updates (e.g. from real-time sync)
  useEffect(() => {
    if (!editor || !parsedContent) return

    // Get current blocks to compare
    const currentBlocks = editor.document

    // Simple comparison to avoid unnecessary updates/cursor resets
    // Note: This is an expensive comparison for large docs, 
    // but necessary to prevent replacing active user typing unless needed.
    // In a real optimized app, we'd use Yjs for conflict resolution.
    // Here we just overwrite if different.
    if (JSON.stringify(currentBlocks) !== JSON.stringify(parsedContent)) {
      // @ts-ignore - Type compatibility issue with backgroundColor prop
      editor.replaceBlocks(editor.document, parsedContent)
    }
  }, [editor, parsedContent])

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

    for (const file of Array.from(files)) {
      try {
        let bucket = edgestore.editorMedia
        let blockType = "file"
        let props: any = { title: file.name }

        if (file.type.startsWith("image/")) {
          blockType = "image"
          props = { caption: "" }
        } else if (file.type.startsWith("video/")) {
          blockType = "video"
          props = { caption: "" }
        } else if (file.type.startsWith("audio/")) {
          blockType = "audio"
          props = { title: file.name, caption: "" }
        } else {
          bucket = edgestore.documentFiles
          props = { name: file.name, size: file.size, type: file.type }
        }

        const res = await bucket.upload({ file })
        const currentBlock = editor.getTextCursorPosition().block

        editor.insertBlocks(
          [{
            type: blockType,
            props: {
              url: res.url,
              ...props
            }
          } as any],
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
    const defaultItems = getDefaultReactSlashMenuItems(editor)

    const customItems = [
      {
        title: "Page Mention",
        onItemClick: () => {
          // Instead of handling it here, we open the mention picker?
          // Or we just insert a block? But we need to SELECT a page.
          // So we should open the mention picker logic.
          // Trigger mention logic manually:
          const currentBlock = editor.getTextCursorPosition().block
          // We can simulate an @ typed or just open the picker.
          // Let's open the picker at cursor.
          // But the picker needs a position. 
          // We'll reuse the slash menu position logic but switch mode.
          setMentionOpen(true)
          setSlashMenuOpen(false)
          // Position is already set if we clicked via slash menu? 
          // Actually Slash menu closes. We use its position.
          setMentionPosition({ top: slashMenuPosition.y, left: slashMenuPosition.x })
        },
        aliases: ["mention", "page mention", "link page"],
        group: "Basic",
        icon: <div className="text-xl">↗️</div>,
        subtext: "Link to an existing page",
      },
      // ... existing custom items ...
      {
        title: "Image",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "image" }),
        aliases: ["image", "img", "picture"],
        group: "Media",
        icon: <div className="text-xl">🖼️</div>,
        subtext: "Upload or embed an image",
      },
      {
        title: "Video",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "video" }),
        aliases: ["video", "movie", "film"],
        group: "Media",
        icon: <div className="text-xl">🎥</div>,
        subtext: "Embed or upload a video",
      },
      {
        title: "Audio",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "audio" }),
        aliases: ["audio", "music", "sound"],
        group: "Media",
        icon: <div className="text-xl">🎵</div>,
        subtext: "Embed or upload audio",
      },
      {
        title: "File",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "file" }),
        aliases: ["file", "attachment", "document"],
        group: "Media",
        icon: <div className="text-xl">📄</div>,
        subtext: "Upload a file attachment",
      },
      {
        title: "Embed",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "embed" }),
        aliases: ["embed", "iframe"],
        group: "Media",
        icon: <div className="text-xl">🔗</div>,
        subtext: "Embed from another site",
      },
      {
        title: "Toggle List",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "toggle" }),
        aliases: ["toggle", "collapse"],
        group: "Advanced",
        icon: <div className="text-xl"><ChevronRight size={18} /></div>,
        subtext: "Toggleable list item",
      },
      {
        title: "Callout",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "callout" }),
        aliases: ["callout", "attention", "alert"],
        group: "Advanced",
        icon: "💡",
        subtext: "Highlight important information",
      },
      {
        title: "Quote",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "quote" }),
        aliases: ["quote", "citation"],
        group: "Basic",
        icon: "❝",
        subtext: "Capture a quote",
      },
      {
        title: "Divider",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "divider" }),
        aliases: ["divider", "hr", "separator"],
        group: "Basic",
        icon: "―",
        subtext: "Visually separate content",
      },
      {
        title: "Table of Contents",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "toc" }),
        aliases: ["toc", "outline"],
        group: "Advanced",
        icon: "📑",
        subtext: "Overview of page headings",
      },
      {
        title: "Bookmark",
        onItemClick: () => insertOrUpdateBlock(editor, { type: "bookmark" }),
        aliases: ["bookmark", "link", "embed"],
        group: "Media",
        icon: "🔗",
        subtext: "Link with preview",
      },
      {
        title: "Page",
        onItemClick: async () => {
          const { createDocument } = await import("@/app/(main)/_actions/documents")
          const doc = await createDocument("Untitled", documentId)
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
          const { page } = await createDatabase(documentId)
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
      {
        title: "Database - Inline",
        onItemClick: async () => {
          const { createDatabase, createLinkedDatabase } = await import(
            "@/app/(main)/_actions/database"
          )

          // 1. Yeni kaynak database oluştur (sub-page olarak)
          const { page, database } = await createDatabase(documentId)

          // 2. Şu anki sayfada LinkedDatabase kaydı oluştur
          const linkedDb = await createLinkedDatabase(
            documentId!,              // Mevcut sayfa
            database.id,             // Kaynak database
            "Untitled Database"      // Başlık
          )

          // 3. Editor'a inline database block ekle
          editor.insertBlocks(
            [
              {
                type: "inlineDatabase",
                props: {
                  linkedDatabaseId: linkedDb.id,
                },
              },
            ],
            editor.getTextCursorPosition().block,
            "after"
          )

          // 4. Yeni block'a focus
          editor.setTextCursorPosition(
            editor.getTextCursorPosition().nextBlock ||
            editor.getTextCursorPosition().block
          )
        },
        aliases: [
          "inline database",
          "embed database",
          "table inline",
          "database inline",
          "db inline",
        ],
        group: "Advanced",
        icon: <div className="text-xl">📊</div>,
        subtext: "Embed a database in this page",
      },
    ]

    const customTitles = new Set(customItems.map(i => i.title))
    const filteredDefaultItems = defaultItems.filter(i => !customTitles.has(i.title) && i.title !== "Image")
    const combinedItems = [...filteredDefaultItems, ...customItems]

    // Deduplicate
    const uniqueItemsMap = new Map()
    combinedItems.forEach(item => {
      if (!uniqueItemsMap.has(item.title)) {
        uniqueItemsMap.set(item.title, item)
      }
    })
    const allItems = Array.from(uniqueItemsMap.values())

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
      setSlashMenuIndex(0)
    }
  }, [slashMenuOpen, slashMenuQuery, editor])


  /* Ref for the editor wrapper to check selection scope */
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  // Trigger Logic (Slash and @)
  useEffect(() => {
    const checkTrigger = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      // If selection is NOT inside the editor wrapper, we assume it's in a portal (like the menu)
      // and we should NOT close the menu or re-evaluate triggers.
      if (editorWrapperRef.current && !editorWrapperRef.current.contains(selection.anchorNode)) {
        return
      }

      const range = selection.getRangeAt(0)
      const text = range.startContainer.textContent || ""
      const offset = range.startOffset

      const textBefore = text.slice(0, offset)

      // Check for Slash Command
      const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/)
      if (slashMatch) {
        setSlashMenuQuery(slashMatch[1])
        setSlashMenuOpen(true)

        const rect = range.getBoundingClientRect()
        setSlashMenuPosition({ x: rect.left, y: rect.bottom })
        setMentionOpen(false) // Close mention if open
        return
      } else {
        setSlashMenuOpen(false)
      }

      // Check for Mention Command
      const mentionMatch = textBefore.replace(/\u00A0/g, ' ').match(/(?:^|\s)@([a-zA-Z0-9\s]*)$/)
      if (mentionMatch) {
        setMentionQuery(mentionMatch[1])
        setMentionOpen(true)

        const rect = range.getBoundingClientRect()
        setMentionPosition({ top: rect.bottom, left: rect.left })
        return
      } else {
        setMentionOpen(false)
      }
    }

    document.addEventListener("selectionchange", checkTrigger)
    document.addEventListener("keyup", checkTrigger)
    document.addEventListener("click", checkTrigger)

    return () => {
      document.removeEventListener("selectionchange", checkTrigger)
      document.removeEventListener("keyup", checkTrigger)
      document.removeEventListener("click", checkTrigger)
    }
  }, [editor])

  // Keyboard navigation for Slash menu
  useEffect(() => {
    if (!slashMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
        // Let custom logic handle, prevent default and propagation
        e.preventDefault()
        e.stopPropagation()
      } else {
        return // Let other keys type
      }

      if (e.key === "ArrowDown") {
        setSlashMenuIndex(prev => (prev + 1) % filteredItems.length)
      } else if (e.key === "ArrowUp") {
        setSlashMenuIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === "Enter") {
        const item = filteredItems[slashMenuIndex]
        if (item) {
          item.onItemClick(editor)
          setSlashMenuOpen(false)
        }
      } else if (e.key === "Escape") {
        setSlashMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true })
  }, [slashMenuOpen, slashMenuIndex, filteredItems, editor])

  // Handle changes
  const handleEditorChange = () => {
    const blocks = editor.document
    const jsonContent = JSON.stringify(blocks)
    onChange(jsonContent)
  }

  const handleMentionSelect = (pageId: string) => {
    // Insert mention block
    const currentBlock = editor.getTextCursorPosition().block

    // If we were triggered by @ query, we might want to replace the text?
    // BlockNote doesn't easily expose "replace range" for the React wrapper.
    // But we can just replace the whole block or insert after.
    // For now, let's insert the mention block.
    // Ideally we delete the '@query' text first.
    // But clearing partial text is hard without better selection awareness.
    // We will just insert the mention block, user can delete the text if they want? 
    // Or we can try to replace. `replaceBlocks` replaces the *whole* block.
    // Since it's a void block, it will replace the current paragraph if it's empty, 
    // or split?
    // Custom block is "content: none".
    // If we use `insertBlocks` with `currentBlock`, it inserts *after* (by default).
    // If we want to replace the current text block (which has '@...'), we can use `replaceBlocks`.

    editor.replaceBlocks(
      [currentBlock],
      [{
        type: "pageMention",
        props: { pageId }
      } as any]
    )
  }

  // Inject backgroundColor styles - MUST be before early return
  useEffect(() => {
    const styleId = 'blocknote-background-colors'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement

    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }

    const isDark = resolvedTheme === 'dark'
    const colors = [
      { name: 'default', light: 'transparent', dark: 'transparent' },
      { name: 'gray', light: 'rgb(241, 241, 239)', dark: 'rgb(71, 76, 80)' },
      { name: 'brown', light: 'rgb(244, 238, 234)', dark: 'rgb(67, 64, 64)' },
      { name: 'orange', light: 'rgb(251, 236, 221)', dark: 'rgb(89, 74, 58)' },
      { name: 'yellow', light: 'rgb(251, 243, 219)', dark: 'rgb(89, 86, 59)' },
      { name: 'green', light: 'rgb(237, 243, 236)', dark: 'rgb(53, 76, 75)' },
      { name: 'blue', light: 'rgb(231, 243, 248)', dark: 'rgb(45, 66, 86)' },
      { name: 'purple', light: 'rgb(244, 240, 247)', dark: 'rgb(73, 47, 100)' },
      { name: 'pink', light: 'rgb(249, 238, 243)', dark: 'rgb(83, 59, 76)' },
      { name: 'red', light: 'rgb(253, 235, 236)', dark: 'rgb(89, 65, 65)' },
    ]

    const css = colors.map(color => {
      const bgColor = isDark ? color.dark : color.light
      return `.bn-block-outer[data-background-color="${color.name}"] { background-color: ${bgColor}; border-radius: 3px; }`
    }).join('\n')

    styleEl.textContent = css
  }, [resolvedTheme])

  if (!mounted) {
    return null
  }


  return (
    <div
      ref={editorWrapperRef}
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
        slashMenu={false}
        data-background-color-support="true"
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
          onClose={() => setSlashMenuOpen(false)}
          position={slashMenuPosition}
        />
      )}

      <PageMentionPicker
        isOpen={mentionOpen}
        onClose={() => setMentionOpen(false)}
        onSelect={handleMentionSelect}
        position={mentionPosition}
        currentPageId={documentId}
      />

      <FormattingToolbar editor={editor} />

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
