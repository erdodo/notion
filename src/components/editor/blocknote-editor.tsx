"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { PartialBlock } from "@blocknote/core"
import { useCreateBlockNote, getDefaultReactSlashMenuItems, SuggestionMenuController } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { ChevronRight } from "lucide-react"
import { schema } from "./schema"

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  editable?: boolean
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
  editable = true
}: BlockNoteEditorProps) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

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
  })

  // Define custom slash menu items
  const getCustomSlashMenuItems = (editor: typeof schema.BlockNoteEditor) => {
    // Get default items
    const defaultItems = getDefaultReactSlashMenuItems(editor)

    // Create new items
    const customItems = [
      {
        title: "Toggle List",
        onItemClick: () => {
          insertOrUpdateBlock(editor, {
            type: "toggle",
          })
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
    ]

    // Filter out default items that we are replacing or don't want if needed
    // For now, let's just append/merge. 
    // We can filter out duplicate "Toggle List" if it exists in default schema 
    // but since we overwrote 'toggle' in schema, the default item might fail or insert our block.
    // Safe bet is to filter out items with same key/title if needed, but let's just add ours.

    // Actually, `insertOrUpdateBlock` with specific type is safer.

    // Filter out ANY default item if its title matches one of our custom items
    // This prevents duplicates like "Quote", "Divider", "Heading 1" (if we added it later), etc.
    // Also "Toggle List" which we know we want to replace.
    const customTitles = new Set(customItems.map(i => i.title))
    const filteredDefaultItems = defaultItems.filter(i => !customTitles.has(i.title))

    // Combine all items
    const allItems = [...filteredDefaultItems, ...customItems]

    // Group items by "group" property to ensure contiguous groups and uniqueness
    // We want to preserve the order of groups as they appear in defaultItems, 
    // then custom groups appended.
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
    <div className="blocknote-editor">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </div>
  )
}
