import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Papa from "papaparse"

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

        const csvText = await file.text()
        const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true })

        if (parseResult.errors.length > 0) {
            return NextResponse.json({ error: "Invalid CSV format" }, { status: 400 })
        }

        const rows = parseResult.data as any[]
        const headers = parseResult.meta.fields || []

        if (headers.length === 0) {
            return NextResponse.json({ error: "CSV has no headers" }, { status: 400 })
        }

        const title = file.name.replace(/\.csv$/i, "")

        // 1. Create Page (Database Container)
        const page = await db.page.create({
            data: {
                title,
                userId: session.user.id,
                parentId: parentId || null,
                isDatabase: true
            }
        })

        // 2. Create Database
        const database = await db.database.create({
            data: {
                pageId: page.id,
                defaultView: "table"
            }
        })

        // 3. Create Properties
        const propIdMap = new Map<string, string>() // Header -> Property ID

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]
            // First column is TITLE, others TEXT
            const type = i === 0 ? "TITLE" : "TEXT"

            const prop = await db.property.create({
                data: {
                    name: header,
                    type,
                    databaseId: database.id,
                    order: i
                }
            })
            propIdMap.set(header, prop.id)
        }

        // 4. Create Rows & Cells
        for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i]

            // Create Row
            const row = await db.databaseRow.create({
                data: {
                    databaseId: database.id,
                    order: i
                }
            })

            // Create Cells
            for (const header of headers) {
                const value = rowData[header]
                const propId = propIdMap.get(header)

                if (propId && value !== undefined && value !== "") {
                    // For TITLE: Also create a Page if we want rows to be openable?
                    // Currently `DatabaseRow` has `pageId` (optional).
                    // Usually rows ARE pages.
                    // If it is the TITLE property, let's create the Page for the Row.

                    if (headers.indexOf(header) === 0) {
                        // Title column -> Create linked Page
                        const rowPage = await db.page.create({
                            data: {
                                title: String(value), // Use as title
                                userId: session.user.id,
                                parentId: page.id, // Parent is the Database Page
                            }
                        })
                        // Update Row to link page
                        await db.databaseRow.update({
                            where: { id: row.id },
                            data: { pageId: rowPage.id }
                        })

                        // Also create Cell for TITLE property
                        await db.cell.create({
                            data: {
                                rowId: row.id,
                                propertyId: propId,
                                value: String(value)
                            }
                        })
                    } else {
                        // Regular TEXT cell
                        await db.cell.create({
                            data: {
                                rowId: row.id,
                                propertyId: propId,
                                value: String(value)
                            }
                        })
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Imported CSV successfully",
            pageId: page.id
        })

    } catch (error) {
        console.error("Import error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
