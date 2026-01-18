import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { blocksToMarkdown } from "@/lib/export-utils"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const pageId = searchParams.get("pageId")
        const includeChildren = searchParams.get("includeChildren") === "true"

        if (!pageId) {
            return NextResponse.json({ error: "pageId is required" }, { status: 400 })
        }

        // Sayfa ve child'ları al
        const page = await db.page.findUnique({
            where: { id: pageId, userId: session.user.id },
            include: includeChildren ? { children: true } : undefined
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        // Content'i parse et
        let blocks = []
        if (page.content) {
            try {
                blocks = JSON.parse(page.content)
            } catch {
                blocks = []
            }
        }

        // Markdown'a çevir
        let markdown = `# ${page.title}\n\n`
        markdown += blocksToMarkdown(blocks)

        // Child sayfaları da ekle
        if (includeChildren && (page as any).children?.length > 0) {
            markdown += "\n\n---\n\n## Sub-pages\n\n"
            for (const child of (page as any).children) {
                markdown += `- [${child.title}](#${child.id})\n`
            }
        }

        // Dosya olarak döndür
        return new Response(markdown, {
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(page.title)}.md"`,
            },
        })
    } catch (error) {
        console.error("Markdown export error:", error)
        return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }
}

function sanitizeFilename(name: string): string {
    return name
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/\s+/g, "_")
        .substring(0, 100) || "document"
}
