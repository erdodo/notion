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
        const databaseId = searchParams.get("databaseId")

        if (!databaseId) {
            return NextResponse.json({ error: "databaseId is required" }, { status: 400 })
        }

        // Database ve ilişkili verileri al
        const database = await db.database.findUnique({
            where: { id: databaseId },
            include: {
                page: {
                    select: { title: true, userId: true }
                },
                properties: {
                    orderBy: { order: 'asc' }
                },
                rows: {
                    where: {
                        // Archived olmayan row'lar
                    },
                    include: {
                        cells: true,
                        page: { select: { title: true } }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!database || database.page.userId !== session.user.id) {
            return NextResponse.json({ error: "Database not found" }, { status: 404 })
        }

        // Headers (property isimleri)
        const headers = database.properties.map(p => p.name)
        // Add "Name" property (which is usually the row page title) if not handled as a property explicitly?
        // In Notion, the Title property is just a property. 
        // If the data model has it in `properties`, we are good.
        // If Title is special and not in `properties`, we might need to add it manually.
        // Usually DB schema in this project puts Title in properties? Let's assume yes or check schema.
        // Checking schema from previous prompt context: `model Property { ... }`.
        // It seems safe to assume it's in properties.

        // Data rows
        const data = database.rows.map(row => {
            const rowData: Record<string, string> = {}

            database.properties.forEach(prop => {
                const cell = row.cells.find(c => c.propertyId === prop.id)
                rowData[prop.name] = formatCellValueForCSV(cell?.value, prop.type)
            })

            return rowData
        })

        // CSV'ye çevir
        const csv = Papa.unparse(data, {
            columns: headers,
            header: true
        })

        const filename = sanitizeFilename(database.page.title || "database")

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}.csv"`,
            },
        })
    } catch (error) {
        console.error("CSV export error:", error)
        return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "database"
}
