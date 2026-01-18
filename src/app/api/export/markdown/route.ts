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

        if (!pageId) {
            return NextResponse.json({ error: "pageId is required" }, { status: 400 })
        }

        const page = await db.page.findUnique({
            where: { id: pageId }
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        // Check access? (Simplified: if userId matches or shared... assuming page access logic is roughly handled or I should check)
        // For strictness, check userId or shares. (Ref `documents.ts` `getDocument` logic).
        // Since `findUnique` above doesn't check owner/share, this is insecure if I don't check.
        // Let's check owner or share.

        // Quick access check:
        const hasAccess = page.userId === session.user.id
        // TODO: check shares if complex
        if (!hasAccess) {
            // Let's do a proper check if simplified check fails
            const share = await db.pageShare.findFirst({
                where: { pageId, OR: [{ userId: session.user.id }, { email: session.user.email ?? "" }] }
            })
            if (!share) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
            }
        }

        let blocks = []
        if (page.content) {
            try {
                blocks = JSON.parse(page.content)
            } catch {
                blocks = []
            }
        }

        const markdown = blocksToMarkdown(blocks)

        // Add Title
        const finalContent = `# ${page.title}\n\n${markdown}`

        return new NextResponse(finalContent, {
            headers: {
                "Content-Type": "text/markdown",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(page.title)}.md"`
            }
        })

    } catch (error) {
        console.error("Export error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "document"
}
