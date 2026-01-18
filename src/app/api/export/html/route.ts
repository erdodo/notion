import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { blocksToHTML } from "@/lib/export-utils"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const pageId = searchParams.get("pageId")

        if (!pageId) {
            return NextResponse.json({ error: "pageId is required" }, { status: 400 })
        }

        const page = await db.page.findUnique({
            where: { id: pageId, userId: session.user.id }
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        let blocks = []
        if (page.content) {
            try {
                blocks = JSON.parse(page.content)
            } catch {
                blocks = []
            }
        }

        const html = blocksToHTML(blocks, page.title)

        return new Response(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(page.title)}.html"`,
            },
        })
    } catch (error) {
        console.error("HTML export error:", error)
        return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "document"
}
