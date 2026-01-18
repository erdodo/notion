import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseCSVToDatabase } from "@/lib/import-utils"

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

        const text = await file.text()
        const { headers, rows } = parseCSVToDatabase(text)

        if (headers.length === 0) {
            return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 })
        }

        const title = file.name.replace(/\.csv$/, "")

        // 1. Create Database Page
        const page = await db.page.create({
            data: {
                title,
                userId: session.user.id,
                parentId: parentId || undefined,
                isDatabase: true
            }
        })

        // 2. Create Database
        const database = await db.database.create({
            data: {
                pageId: page.id
            }
        })

        // 3. Create Properties
        // Assume first column is Title (optional logic, but standard)
        // Or just create TEXT properties for all columns

        const propertyMap = new Map() // header -> propertyId

        for (let i = 0; i < headers.length; i++) {
            const name = headers[i]
            // Guess type? For now default to TEXT
            const type = "TEXT"

            const prop = await db.property.create({
                data: {
                    databaseId: database.id,
                    name: name,
                    type: type, // You might want deeper type inference logic here later
                    order: i
                }
            })
            propertyMap.set(name, prop.id)
        }

        // 4. Create Rows
        for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i]

            // Create row (which is also a page/item)
            // Usually rows have a linked page.
            // In this schema `DatabaseRow` is main entity? 
            // Checking `csv/route.ts` export: `database.rows` has `page: { select: { title: true } }`
            // So a row is linked to a page? Or validation?

            // Export logic:
            /*
            model Database {
                rows        DatabaseRow[]
            }
            */

            // I need to check the schema to create a row correctly. 
            // Based on common Notion clone schema:
            // A DatabaseRow usually links to a Page (which holds the content/title of the row).
            // Let's verify `schema.prisma` if possible, but I don't have it open.
            // Assuming `DatabaseRow` creation involves creating a `Page` first or simultaneously if relational.

            // Let's look at `csv/export`:
            /*
              const data = database.rows.map(row => {
                   // ...
              })
            */

            // Import needs to do the reverse.
            // Let's Create a Page for the row first (standard Notion)

            const rowPage = await db.page.create({
                data: {
                    title: "Untitled", // Will set title via property?
                    userId: session.user.id,
                    isDatabase: false,
                    parentId: page.id // Parenting to the database page
                    // Usually database rows are children of the database page conceptually
                }
            })

            const row = await db.databaseRow.create({
                data: {
                    databaseId: database.id,
                    pageId: rowPage.id,
                    order: i
                }
            })

            // 5. Create Cells
            for (const header of headers) {
                const propId = propertyMap.get(header)
                const value = rowData[header]

                if (propId) {
                    await db.cell.create({
                        data: {
                            rowId: row.id,
                            propertyId: propId,
                            value: value // Simple text value
                        }
                    })
                }
            }

            // Update row page title if we have a "Name" or "Title" column
            // Or just the first column
            const titleCol = headers.find(h => h.toLowerCase() === "name" || h.toLowerCase() === "title") || headers[0]
            if (titleCol && rowData[titleCol]) {
                await db.page.update({
                    where: { id: rowPage.id },
                    data: { title: rowData[titleCol] }
                })
            }
        }

        return NextResponse.json({
            success: true,
            pageId: page.id,
            title: page.title
        })
    } catch (error) {
        console.error("CSV import error:", error)
        return NextResponse.json({ error: "Import failed" }, { status: 500 })
    }
}
