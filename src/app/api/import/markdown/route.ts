import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Supported Block Types:
// # Heading 1 -> heading level 1
// ## Heading 2 -> heading level 2
// ### Heading 3 -> heading level 3
// - List item -> bulletListItem
// 1. List item -> numberedListItem
// > Quote -> quote
// ```code -> codeBlock
// Text -> paragraph

function parseMarkdownToBlocks(markdown: string) {
    const lines = markdown.split('\n')
    const blocks = []

    let inCodeBlock = false
    let codeContent = ""
    let codeLanguage = ""

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Code Block Handling
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                // End code block
                blocks.push({
                    type: "codeBlock",
                    props: { language: codeLanguage },
                    content: [{ type: "text", text: codeContent.trim(), styles: {} }]
                })
                inCodeBlock = false
                codeContent = ""
                codeLanguage = ""
            } else {
                // Start code block
                inCodeBlock = true
                codeLanguage = line.trim().substring(3)
            }
            continue
        }

        if (inCodeBlock) {
            codeContent += line + "\n"
            continue
        }

        const trimmed = line.trim()
        if (!trimmed) continue

        // Headings
        if (trimmed.startsWith("# ")) {
            blocks.push({ type: "heading", props: { level: 1 }, content: [{ type: "text", text: trimmed.substring(2), styles: {} }] })
        } else if (trimmed.startsWith("## ")) {
            blocks.push({ type: "heading", props: { level: 2 }, content: [{ type: "text", text: trimmed.substring(3), styles: {} }] })
        } else if (trimmed.startsWith("### ")) {
            blocks.push({ type: "heading", props: { level: 3 }, content: [{ type: "text", text: trimmed.substring(4), styles: {} }] })
        }
        // Lists
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            blocks.push({ type: "bulletListItem", content: [{ type: "text", text: trimmed.substring(2), styles: {} }] })
        } else if (/^\d+\.\s/.test(trimmed)) {
            blocks.push({ type: "numberedListItem", content: [{ type: "text", text: trimmed.replace(/^\d+\.\s/, ""), styles: {} }] })
        }
        // Quote
        else if (trimmed.startsWith("> ")) {
            blocks.push({ type: "quote", content: [{ type: "text", text: trimmed.substring(2), styles: {} }] })
        }
        // Paragraph
        else {
            blocks.push({ type: "paragraph", content: [{ type: "text", text: trimmed, styles: {} }] })
        }
    }

    return blocks
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const parentId = formData.get("parentId") as string | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const text = await file.text()
        const title = file.name.replace(/\.md$/i, "")
        const blocks = parseMarkdownToBlocks(text)

        const page = await db.page.create({
            data: {
                title,
                content: JSON.stringify(blocks),
                userId: session.user.id,
                parentId: parentId || null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Imported successfully",
            pageId: page.id
        })

    } catch (error) {
        console.error("Import error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
