import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatCellValueForCSV } from "@/lib/export-utils"
import Papa from "papaparse"

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
            where: { id: pageId },
            include: {
                database: {
                    include: {
                        properties: { orderBy: { order: 'asc' } },
                        rows: {
                            include: {
                                cells: true,
                                page: true // to get row page title if needed
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        // Access Check
        const hasAccess = page.userId === session.user.id
        if (!hasAccess) {
            const share = await db.pageShare.findFirst({
                where: { pageId, OR: [{ userId: session.user.id }, { email: session.user.email ?? "" }] }
            })
            if (!share) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
            }
        }

        if (!page.database) {
            return NextResponse.json({ error: "This page is not a database. CSV export is only supported for databases." }, { status: 400 })
        }

        const properties = page.database.properties
        const rows = page.database.rows

        // Headers
        const headers = properties.map(p => p.name)

        // Rows data
        const csvData = rows.map(row => {
            const rowObject: Record<string, string> = {}

            properties.forEach(prop => {
                const cell = row.cells.find(c => c.propertyId === prop.id)
                // Special handling for TITLE if cell is missing? 
                // Usually Cell exists. If not, maybe fallback to row.page.title if TITLE type?

                let val = ""
                if (prop.type === "TITLE" && row.page) {
                    val = row.page.title
                } else {
                    val = formatCellValueForCSV(cell?.value, prop.type)
                }

                rowObject[prop.name] = val
            })
            return rowObject
        })

        const csv = Papa.unparse({
            fields: headers,
            data: csvData
        })

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(page.title)}.csv"`
            }
        })

    } catch (error) {
        console.error("Export error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "database"
}
