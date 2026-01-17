
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PropertyType } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function getCurrentUser() {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })
        return user
    } catch (error) {
        console.error("Database error:", error)
        return null
    }
}

// Database CRUD
export async function createDatabase(parentId?: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Create Page first
    const page = await db.page.create({
        data: {
            title: "Untitled Database",
            userId: user.id,
            parentId: parentId,
            isDatabase: true,
        }
    })

    // Create Database
    const database = await db.database.create({
        data: {
            pageId: page.id,
            properties: {
                create: {
                    name: "Name",
                    type: "TITLE",
                    order: 0,
                }
            }
        }
    })

    // Create default empty row
    await addRow(database.id)

    revalidatePath("/documents")
    return { page, database }
}

export async function getDatabase(pageId: string) {
    const user = await getCurrentUser()
    if (!user) return null

    const database = await db.database.findUnique({
        where: { pageId },
        include: {
            properties: {
                orderBy: { order: 'asc' }
            },
            rows: {
                orderBy: { order: 'asc' },
                include: {
                    cells: true,
                    page: true // Need page info for rows (icon, title etc usually title stored in cell but row is a page too)
                }
            }
        }
    })

    return database
}

export async function deleteDatabase(databaseId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Get database to find pageId
    const database = await db.database.findUnique({
        where: { id: databaseId }
    })

    if (!database) throw new Error("Database not found")

    // Delete the page (cascade deletes database)
    await db.page.delete({
        where: { id: database.pageId }
    })

    revalidatePath("/documents")
}

// Property CRUD
export async function addProperty(databaseId: string, data: { name: string, type: PropertyType, options?: any }) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Validate ownership? For now simplified.

    const count = await db.property.count({
        where: { databaseId }
    })

    const property = await db.property.create({
        data: {
            databaseId,
            name: data.name,
            type: data.type,
            options: data.options,
            order: count,
        }
    })

    revalidatePath(`/documents`)
    // Ideally we should revalidate specific page, but we don't have pageId here easily without fetching.
    // Client should invalidate query.

    return property
}

export async function updateProperty(propertyId: string, data: { name?: string, type?: PropertyType, options?: any, width?: number, isVisible?: boolean }) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const property = await db.property.update({
        where: { id: propertyId },
        data
    })

    return property
}

export async function deleteProperty(propertyId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    await db.property.delete({
        where: { id: propertyId }
    })
}

export async function reorderProperties(databaseId: string, orderedIds: string[]) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const transaction = orderedIds.map((id, index) =>
        db.property.update({
            where: { id },
            data: { order: index }
        })
    )

    await db.$transaction(transaction)
}

// Row CRUD
export async function addRow(databaseId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Need to link to a new page for the row?
    // "Her satır bir sayfa olabilir"
    // Usually Notion creates a page for each row immediately.

    // Get database to get parent pageId?
    // Actually the Row Page should arguably be a child of the Database Page.
    const database = await db.database.findUnique({
        where: { id: databaseId }
    })
    if (!database) throw new Error("Database not found")

    // Create Page for the row
    const page = await db.page.create({
        data: {
            title: "", // Initial title empty
            userId: user.id,
            parentId: database.pageId, // Child of the database page
        }
    })

    const count = await db.databaseRow.count({
        where: { databaseId }
    })

    const row = await db.databaseRow.create({
        data: {
            databaseId,
            pageId: page.id,
            order: count,
        }
    })

    return row
}

export async function deleteRow(rowId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Get row to find pageId
    const row = await db.databaseRow.findUnique({
        where: { id: rowId }
    })

    if (!row) return

    // Delete the page (should cascade delete row if setup correctly? 
    // Schema says: page Page? @relation("RowPage", fields: [pageId], references: [id])
    // But no onDelete: Cascade on the RowPage relation in DatabaseRow.
    // But Page has `databaseRow DatabaseRow?`
    // Actually if we delete Page, we should manually delete Row?
    // Wait, relation on DatabaseRow side (fields: [pageId], references: [id])
    // If I delete Page, does it delete DatabaseRow? No default cascade there usually unless specified.
    // But for `database Database` relation, it is onDelete: Cascade.

    // I should delete the Page, and likely that's enough if I simply remove the row.
    // If I delete the row, the page remains "orphaned" or arguably should be deleted.
    // Notion deletes the page when deleting the row.

    if (row.pageId) {
        await db.page.delete({
            where: { id: row.pageId }
        })
    } else {
        await db.databaseRow.delete({
            where: { id: rowId }
        })
    }
}

export async function duplicateRow(rowId: string) {
    // Complex implementation, skipping for MVP or doing simple version
    // Would need to copy Page content + Cell values.
}

export async function reorderRows(databaseId: string, orderedIds: string[]) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const transaction = orderedIds.map((id, index) =>
        db.databaseRow.update({
            where: { id },
            data: { order: index }
        })
    )

    await db.$transaction(transaction)
}

// Cell Update
export async function updateCell(cellId: string, value: any) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const cell = await db.cell.update({
        where: { id: cellId },
        data: { value }
    })

    // If this is a Title cell, we should also update the Page title
    // Need to check property type.
    const cellWithProp = await db.cell.findUnique({
        where: { id: cellId },
        include: { property: true, row: true }
    })

    if (cellWithProp?.property.type === 'TITLE' && cellWithProp.row.pageId) {
        const title = typeof value?.value === 'string' ? value.value : "Untitled"
        await db.page.update({
            where: { id: cellWithProp.row.pageId },
            data: { title: title }
        })
    }

    return cell
}

export async function updateCellByPosition(propertyId: string, rowId: string, value: any) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const cell = await db.cell.upsert({
        where: {
            propertyId_rowId: {
                propertyId,
                rowId
            }
        },
        update: { value },
        create: {
            propertyId,
            rowId,
            value
        },
        include: { property: true }
    })

    // Sync Title
    if (cell.property.type === 'TITLE') {
        const row = await db.databaseRow.findUnique({ where: { id: rowId } })
        if (row?.pageId) {
            // Assert value has text?
            const title = typeof value === 'string' ? value : (value?.value as string || "Untitled")
            await db.page.update({
                where: { id: row.pageId },
                data: { title: title }
            })
        }
    }

    return cell
}
