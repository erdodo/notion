import { Block } from "@blocknote/core"

export function parseMarkdownToBlocks(markdown: string): Block[] {
    const blocks: Block[] = []
    const lines = markdown.split("\n")

    let i = 0
    while (i < lines.length) {
        const line = lines[i]

        // Empty line
        if (!line.trim()) {
            i++
            continue
        }

        // Heading
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
        if (headingMatch) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "heading",
                props: {
                    level: headingMatch[1].length,
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left"
                },
                content: [{ type: "text", text: headingMatch[2], styles: {} }],
                children: []
            } as any)
            i++
            continue
        }

        // Horizontal rule
        if (line.match(/^(-{3,}|_{3,}|\*{3,})$/)) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "divider",
                props: {},
                content: undefined,
                children: []
            } as any)
            i++
            continue
        }

        // Code block
        if (line.startsWith("```")) {
            const lang = line.slice(3).trim()
            const codeLines: string[] = []
            i++
            while (i < lines.length && !lines[i].startsWith("```")) {
                codeLines.push(lines[i])
                i++
            }
            blocks.push({
                id: crypto.randomUUID(),
                type: "codeBlock",
                props: {
                    language: lang || "plain",
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left"
                },
                content: [{ type: "text", text: codeLines.join("\n"), styles: {} }],
                children: []
            } as any)
            i++
            continue
        }

        // Blockquote / Callout
        if (line.startsWith("> ")) {
            const quoteText = line.slice(2)
            // Emoji ile başlıyorsa callout
            const emojiMatch = quoteText.match(/^(\p{Emoji})\s+(.+)$/u)
            if (emojiMatch) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: "callout",
                    props: {
                        icon: emojiMatch[1],
                        color: "gray",
                        backgroundColor: "default",
                        textColor: "default",
                        textAlignment: "left"
                    },
                    content: [{ type: "text", text: emojiMatch[2], styles: {} }],
                    children: []
                } as any)
            } else {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: "quote",
                    props: {
                        backgroundColor: "default",
                        textColor: "default",
                        textAlignment: "left"
                    },
                    content: [{ type: "text", text: quoteText, styles: {} }],
                    children: []
                } as any)
            }
            i++
            continue
        }

        // Bullet list
        if (line.match(/^[-*]\s+/)) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "bulletListItem",
                props: {
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left"
                },
                content: parseInlineContent(line.replace(/^[-*]\s+/, "")),
                children: []
            } as any)
            i++
            continue
        }

        // Numbered list
        if (line.match(/^\d+\.\s+/)) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "numberedListItem",
                props: {
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left"
                },
                content: parseInlineContent(line.replace(/^\d+\.\s+/, "")),
                children: []
            } as any)
            i++
            continue
        }

        // Checkbox
        const checkboxMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/)
        if (checkboxMatch) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "checkListItem",
                props: {
                    checked: checkboxMatch[1] === "x",
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left"
                },
                content: parseInlineContent(checkboxMatch[2]),
                children: []
            } as any)
            i++
            continue
        }

        // Image
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (imageMatch) {
            blocks.push({
                id: crypto.randomUUID(),
                type: "image",
                props: {
                    url: imageMatch[2],
                    caption: imageMatch[1],
                    width: 512,
                    textAlignment: "center"
                },
                content: undefined,
                children: []
            } as any)
            i++
            continue
        }

        // Paragraph (default)
        blocks.push({
            id: crypto.randomUUID(),
            type: "paragraph",
            props: {
                backgroundColor: "default",
                textColor: "default",
                textAlignment: "left"
            },
            content: parseInlineContent(line),
            children: []
        } as any)
        i++
    }

    return blocks
}

// Inline formatting parsing
function parseInlineContent(text: string): any[] {
    const content: any[] = []

    // Regex patterns for inline styles
    const patterns = [
        { regex: /\*\*(.+?)\*\*/g, style: "bold" },
        { regex: /\*(.+?)\*/g, style: "italic" },
        { regex: /~~(.+?)~~/g, style: "strike" },
        { regex: /`(.+?)`/g, style: "code" },
        { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "link" }
    ]

    // Simple implementation - just extract plain text for now
    // Full implementation would need proper parsing
    content.push({
        type: "text",
        text: text
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/~~(.+?)~~/g, "$1")
            .replace(/`(.+?)`/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
        styles: {}
    })

    return content
}

// CSV to Database import
export function parseCSVToDatabase(csv: string): {
    headers: string[]
    rows: Record<string, string>[]
} {
    const lines = csv.split("\n").filter(l => l.trim())
    if (lines.length === 0) return { headers: [], rows: [] }

    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => {
        const values = parseCSVLine(line)
        const row: Record<string, string> = {}
        headers.forEach((h, i) => {
            row[h] = values[i] || ""
        })
        return row
    })

    return { headers, rows }
}

function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
            result.push(current.trim())
            current = ""
        } else {
            current += char
        }
    }
    result.push(current.trim())

    return result
}
