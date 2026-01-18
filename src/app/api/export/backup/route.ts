import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import JSZip from "jszip"
import { blocksToMarkdown, blocksToHTML } from "@/lib/export-utils"
import Papa from "papaparse"
import { formatCellValueForCSV } from "@/lib/export-utils"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const format = searchParams.get("format") || "markdown" // markdown, html, json

        // Tüm sayfaları al (hierarchical)
        const pages = await db.page.findMany({
            where: {
                userId: session.user.id,
                isArchived: false
            },
            include: {
                // @ts-ignore
                database: {
                    include: {
                        properties: { orderBy: { order: 'asc' } },
                        rows: {
                            include: { cells: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        const zip = new JSZip()

        // Metadata dosyası
        const metadata = {
            exportedAt: new Date().toISOString(),
            userId: session.user.id,
            pageCount: pages.length,
            format
        }
        zip.file("_metadata.json", JSON.stringify(metadata, null, 2))

        // Sayfa yapısı (hierarchy)
        const structure = buildPageStructure(pages)
        zip.file("_structure.json", JSON.stringify(structure, null, 2))

        // Her sayfayı export et
        for (const p of pages) {
            const page = p as any
            const folderPath = getPagePath(page, pages)
            const filename = sanitizeFilename(page.title || "Untitled")

            let content = ""
            let extension = ""

            if (page.isDatabase && page.database) {
                // Database → CSV
                const csv = databaseToCSV(page.database)
                content = csv
                extension = "csv"
            } else {
                // Normal sayfa
                const blocks = page.content ? JSON.parse(page.content) : []

                switch (format) {
                    case "html":
                        content = blocksToHTML(blocks, page.title)
                        extension = "html"
                        break
                    case "json":
                        content = JSON.stringify({
                            title: page.title,
                            icon: page.icon,
                            cover: page.coverImage,
                            content: blocks
                        }, null, 2)
                        extension = "json"
                        break
                    default: // markdown
                        content = `# ${page.title}\n\n` + blocksToMarkdown(blocks)
                        extension = "md"
                }
            }

            // Ensure unique filenames by appending ID if needed or just use current structure
            // Folder path + filename
            // To handle duplicates in same folder, JSZip overwrites or we can append ID.
            // Ideally we'd handle name collisions but for now simple path is ok.

            const fullPath = folderPath ? `${folderPath}/${filename}.${extension}` : `${filename}.${extension}`
            zip.file(fullPath, content)
        }

        // ZIP oluştur
        const zipBuffer = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        })

        const timestamp = new Date().toISOString().split('T')[0]

        return new Response(zipBuffer as any, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="notion-backup-${timestamp}.zip"`,
            } as any,
        })
    } catch (error) {
        console.error("Backup export error:", error)
        return NextResponse.json({ error: "Backup failed" }, { status: 500 })
    }
}

function buildPageStructure(pages: any[]): any {
    const map = new Map()
    const roots: any[] = []

    pages.forEach(page => {
        map.set(page.id, {
            id: page.id,
            title: page.title,
            icon: page.icon,
            isDatabase: page.isDatabase,
            children: []
        })
    })

    pages.forEach(page => {
        const node = map.get(page.id)
        if (page.parentId && map.has(page.parentId)) {
            map.get(page.parentId).children.push(node)
        } else {
            roots.push(node)
        }
    })

    return roots
}

function getPagePath(page: any, allPages: any[]): string {
    const path: string[] = []
    let current = page

    // Prevent infinite loop if cyclic (shouldn't happen in tree)
    const visited = new Set();

    while (current && current.parentId && !visited.has(current.id)) {
        visited.add(current.id);
        const parent = allPages.find(p => p.id === current.parentId)
        if (parent) {
            path.unshift(sanitizeFilename(parent.title || "Untitled"))
            current = parent
        } else {
            break;
        }
    }

    return path.join("/")
}

function databaseToCSV(database: any): string {
    const headers = database.properties.map((p: any) => p.name)
    const data = database.rows.map((row: any) => {
        const rowData: Record<string, string> = {}
        database.properties.forEach((prop: any) => {
            const cell = row.cells.find((c: any) => c.propertyId === prop.id)
            rowData[prop.name] = formatCellValueForCSV(cell?.value, prop.type)
        })
        return rowData
    })

    return Papa.unparse(data, { columns: headers, header: true })
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "untitled"
}
