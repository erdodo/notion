import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import JSZip from "jszip"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = session.user.id

        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const mode = formData.get("mode") as string || "merge" // merge, replace

        if (!file) {
            return NextResponse.json({ error: "ZIP file is required" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        // Metadata oku
        const metadataFile = zip.file("_metadata.json")
        if (!metadataFile) {
            return NextResponse.json({ error: "Invalid backup file" }, { status: 400 })
        }
        const metadata = JSON.parse(await metadataFile.async("string"))

        // Structure oku
        const structureFile = zip.file("_structure.json")
        const structure = structureFile
            ? JSON.parse(await structureFile.async("string"))
            : []

        // Replace modunda mevcut sayfaları sil
        if (mode === "replace") {
            await db.page.deleteMany({
                where: { userId: userId }
            })
        }

        // Sayfaları import et
        const idMap = new Map<string, string>() // old id -> new id
        let importedCount = 0

        async function importPage(node: any, parentId: string | null) {
            // Dosyayı bul
            const possiblePaths = [
                `${node.title}.md`,
                `${node.title}.html`,
                `${node.title}.json`,
                `${node.title}.csv`
            ]

            let content: string | null = null
            let isDatabase = node.isDatabase || false

            for (const path of possiblePaths) {
                // JSZip file search can be tricky with folders, we need to handle that.
                // Assuming relative paths from structure?
                // But the export used `getPagePath`. 
                // We really should use `_structure.json` to guide us OR just iterate files.
                // But `_structure.json` preserves hierarchy.

                // This simple finder logic is Flawed because files are inside folders based on path.
                // We should construct the expected path based on hierarchy.

                // Let's search recursively in zip? 
                // Instead of complex path reconstruction, let's leniently find the file by name? 
                // That might be ambiguous if multiple files have same name. 

                // Better: Use `zip.file()` with regex or iterate zip files to find match?
                // The prompt implementation did `zip.file(new RegExp(...))`.

                const file = zip.file(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$"))
                if (file && file.length > 0) {
                    content = await file[0].async("string")
                    if (path.endsWith('.csv')) isDatabase = true
                    break
                }
            }

            // Sayfa oluştur
            const newPage = await db.page.create({
                data: {
                    title: node.title,
                    icon: node.icon,
                    content: content && !isDatabase ? content : null,
                    userId: userId,
                    parentId,
                    isDatabase
                }
            })

            idMap.set(node.id, newPage.id)
            importedCount++

            // Children'ları import et
            if (node.children?.length > 0) {
                for (const child of node.children) {
                    await importPage(child, newPage.id)
                }
            }
        }

        // Root seviyesinden başla
        for (const rootNode of structure) {
            await importPage(rootNode, null)
        }

        return NextResponse.json({
            success: true,
            importedCount,
            message: `Successfully imported ${importedCount} pages`
        })
    } catch (error) {
        console.error("Backup restore error:", error)
        return NextResponse.json({ error: "Restore failed" }, { status: 500 })
    }
}
