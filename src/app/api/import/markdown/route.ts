import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseMarkdownToBlocks } from "@/lib/import-utils"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const parentId = formData.get("parentId") as string | null

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 })
        }

        // Dosya içeriğini oku
        const text = await file.text()

        // Başlığı çıkar (ilk # satırı veya dosya adı)
        const titleMatch = text.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : file.name.replace(/\.md$/, "")

        // Markdown'ı BlockNote formatına çevir
        const blocks = parseMarkdownToBlocks(text)

        // Yeni sayfa oluştur
        const page = await db.page.create({
            data: {
                title,
                content: JSON.stringify(blocks),
                userId: session.user.id,
                parentId: parentId || undefined
            }
        })

        return NextResponse.json({
            success: true,
            pageId: page.id,
            title: page.title
        })
    } catch (error) {
        console.error("Markdown import error:", error)
        return NextResponse.json({ error: "Import failed" }, { status: 500 })
    }
}
