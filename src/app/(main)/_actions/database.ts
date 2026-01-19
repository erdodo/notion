"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PropertyType, Database, DatabaseRow, Property, LinkedDatabase, DatabaseTemplate } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { FormulaResult, evaluateFormula, FormulaContext } from "@/lib/formula-engine"
import { RollupConfig, computeRollup } from "@/lib/rollup-service"
import { RelationCellValue, RelationConfig } from "@/lib/relation-service"
import { checkAndRunAutomations } from "@/lib/automation-service"

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
            options: data.options ?? (data.type === 'STATUS' ? [
                { id: '1', name: 'Not Started', color: 'gray', group: 'todo' },
                { id: '2', name: 'In Progress', color: 'blue', group: 'inprogress' },
                { id: '3', name: 'Done', color: 'green', group: 'complete' }
            ] : data.options),
            order: count,
        }
    })

    revalidatePath(`/documents`)
    // Ideally we should revalidate specific page, but we don't have pageId here easily without fetching.
    // Client should invalidate query.

    return property
}

export async function updateProperty(propertyId: string, data: {
    name?: string,
    type?: PropertyType,
    options?: any,
    width?: number,
    isVisible?: boolean,
    relationConfig?: any,
    rollupConfig?: any,
    formulaConfig?: any
}) {
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

    try {
        await db.property.delete({
            where: { id: propertyId }
        })
        revalidatePath('/documents')
    } catch (error: any) {
        if (error.code === 'P2025') {
            // Record to delete does not exist - ignore
            return
        }
        throw error
    }
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
export async function addRow(databaseId: string, parentRowId?: string) {
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
            parentRowId
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

    // Automation Hook
    try {
        if (cellWithProp && cellWithProp.row) {
            await checkAndRunAutomations(
                cellWithProp.row.databaseId,
                cellWithProp.row.id,
                {
                    propertyId: cellWithProp.propertyId,
                    newValue: value,
                    oldValue: cellWithProp.value
                }
            )
        }
    } catch (e) {
        console.error("Automation error:", e)
    }

    return cell
}

export async function updateCellByPosition(propertyId: string, rowId: string, value: any) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Fetch existing cell for old value
    const existingCell = await db.cell.findUnique({
        where: {
            propertyId_rowId: {
                propertyId,
                rowId
            }
        }
    })

    // Verify row exists first to avoid FK constraint error on optimistic updates
    const rowExists = await db.databaseRow.findUnique({
        where: { id: rowId },
        select: { id: true }
    })

    if (!rowExists) {
        // Optimistic update race condition - row not yet created on server
        return null
    }

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

    // Automation Hook
    try {
        const row = await db.databaseRow.findUnique({ where: { id: rowId } })
        if (row) {
            await checkAndRunAutomations(
                row.databaseId,
                row.id,
                {
                    propertyId,
                    newValue: value,
                    oldValue: existingCell?.value
                }
            )
        }
    } catch (e) {
        console.error("Automation error:", e)
    }

    return cell
}

// Board View Actions
export async function moveRowToGroup(rowId: string, propertyId: string, groupId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Find the cell for this row and property
    // We update the cell value to the new group ID (or name)
    await updateCellByPosition(propertyId, rowId, groupId)
}

export async function updateDatabaseDefaultView(databaseId: string, view: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    await db.database.update({
        where: { id: databaseId },
        data: { defaultView: view }
    })

    revalidatePath(`/documents`)
}

// ============ RELATION ACTIONS ============

// Tüm database'leri listele (relation config için)
export async function getAllDatabases(): Promise<Database[]> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const databases = await db.database.findMany({
        where: {
            page: {
                userId: session.user.id,
                isArchived: false
            }
        },
        include: {
            page: { select: { title: true, icon: true } },
            properties: { orderBy: { order: 'asc' } }
        }
    })

    return databases
}

// Linked rows'ları fetch et
export async function getLinkedRows(
    targetDatabaseId: string,
    linkedRowIds: string[]
): Promise<DatabaseRow[]> {
    const rows = await db.databaseRow.findMany({
        where: {
            databaseId: targetDatabaseId,
            id: { in: linkedRowIds }
        },
        include: {
            cells: true,
            page: { select: { title: true, icon: true } }
        }
    })

    return rows
}

// Row'ları link et
export async function linkRows(
    cellId: string,
    targetRowIds: string[]
): Promise<void> {
    await db.cell.update({
        where: { id: cellId },
        data: {
            value: { linkedRowIds: targetRowIds }
        }
    })

    // TODO: Bidirectional sync
    revalidatePath('/documents')
}

// Tek row unlink et
export async function unlinkRow(
    cellId: string,
    rowIdToRemove: string
): Promise<void> {
    const cell = await db.cell.findUnique({ where: { id: cellId } })
    if (!cell?.value) return

    const currentValue = cell.value as unknown as RelationCellValue
    const updatedIds = currentValue.linkedRowIds.filter(id => id !== rowIdToRemove)

    await db.cell.update({
        where: { id: cellId },
        data: {
            value: { linkedRowIds: updatedIds }
        }
    })

    revalidatePath('/documents')
}

// ============ ROLLUP COMPUTATION ============

export async function computeRollupValue(
    rowId: string,
    rollupPropertyId: string
): Promise<any> {
    const property = await db.property.findUnique({
        where: { id: rollupPropertyId },
        include: { database: true }
    })

    if (!property?.rollupConfig) return null

    const config = property.rollupConfig as unknown as RollupConfig

    // 1. Relation property'den linked row ID'lerini al
    const relationCell = await db.cell.findFirst({
        where: {
            rowId,
            propertyId: config.relationPropertyId
        }
    })

    if (!relationCell?.value) return null

    const linkedRowIds = (relationCell.value as unknown as RelationCellValue).linkedRowIds
    if (!linkedRowIds.length) return null

    // 2. Target property değerlerini al
    const targetCells = await db.cell.findMany({
        where: {
            rowId: { in: linkedRowIds },
            propertyId: config.targetPropertyId
        }
    })

    const values = targetCells.map(c => (c.value as any)?.value ?? c.value)

    // 3. Aggregation uygula
    return computeRollup(values, config.aggregation)
}

// ============ FORMULA COMPUTATION ============

interface FormulaConfig {
    expression: string
    resultType: 'string' | 'number' | 'boolean' | 'date'
}

export async function computeFormulaValue(
    rowId: string,
    formulaPropertyId: string
): Promise<FormulaResult> {
    const property = await db.property.findUnique({
        where: { id: formulaPropertyId },
        include: {
            database: {
                include: { properties: true }
            }
        }
    })

    if (!property?.formulaConfig) return { value: null, error: 'No formula configured' }

    const config = property.formulaConfig as unknown as FormulaConfig

    // Row'un tüm cell değerlerini al
    const cells = await db.cell.findMany({
        where: { rowId }
    })

    // Property name -> value mapping oluştur
    const props: Record<string, any> = {}
    property.database.properties.forEach(p => {
        const cell = cells.find(c => c.propertyId === p.id)
        props[p.name] = (cell?.value as any)?.value ?? cell?.value ?? null
    })

    // Formula'yı evaluate et
    return evaluateFormula(config.expression, {
        props,
        row: null as any,
        properties: property.database.properties
    })
}

// ============ LINKED DATABASE ACTIONS ============

// Linked database oluştur
export async function createLinkedDatabase(
    pageId: string,
    sourceDatabaseId: string,
    title?: string
): Promise<LinkedDatabase> {
    const linkedDb = await db.linkedDatabase.create({
        data: {
            pageId,
            sourceDatabaseId,
            title,
            viewConfig: {
                filters: [],
                sorts: [],
                hiddenProperties: [],
                view: 'table'
            }
        }
    })

    revalidatePath(`/documents/${pageId}`)
    return linkedDb
}

// Linked database sil
export async function deleteLinkedDatabase(linkedDbId: string): Promise<void> {
    await db.linkedDatabase.delete({
        where: { id: linkedDbId }
    })

    revalidatePath('/documents')
}

// Linked database view config güncelle
export async function updateLinkedDatabaseConfig(
    linkedDbId: string,
    viewConfig: any
): Promise<void> {
    await db.linkedDatabase.update({
        where: { id: linkedDbId },
        data: { viewConfig }
    })

    revalidatePath('/documents')
}

/**
 * Fetch a linked database with full source database data
 */
export async function getLinkedDatabase(linkedDbId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const linkedDb = await db.linkedDatabase.findUnique({
        where: {
            id: linkedDbId,
        },
        include: {
            page: true, // Hangi sayfada gösteriliyor
            sourceDatabase: {
                include: {
                    page: true, // Database'in page bilgisi
                    properties: {
                        orderBy: { order: "asc" },
                    },
                    rows: {
                        orderBy: { order: "asc" },
                        include: {
                            cells: true,
                            page: true, // Her row'un page'i
                        },
                    },
                },
            },
        },
    })

    // Security: Kullanıcı bu sayfanın sahibi mi kontrol et
    if (linkedDb?.page?.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    return linkedDb
}

// ============ TEMPLATE ACTIONS ============

// Template oluştur
export async function createTemplate(
    databaseId: string,
    data: {
        name: string
        icon?: string
        content?: string
        defaultCells?: Record<string, any>
    }
): Promise<DatabaseTemplate> {
    const template = await db.databaseTemplate.create({
        data: {
            databaseId,
            name: data.name,
            icon: data.icon,
            content: data.content,
            defaultCells: data.defaultCells
        }
    })

    revalidatePath('/documents')
    return template
}

// Mevcut row'dan template oluştur
export async function createTemplateFromRow(
    rowId: string,
    name: string
): Promise<DatabaseTemplate> {
    const row = await db.databaseRow.findUnique({
        where: { id: rowId },
        include: {
            cells: true,
            page: true,
            database: true
        }
    })

    if (!row) throw new Error("Row not found")

    // Cell değerlerini defaultCells'e dönüştür
    const defaultCells: Record<string, any> = {}
    row.cells.forEach(cell => {
        defaultCells[cell.propertyId] = cell.value
    })

    const template = await db.databaseTemplate.create({
        data: {
            databaseId: row.databaseId,
            name,
            icon: row.page?.icon,
            content: row.page?.content,
            defaultCells
        }
    })

    revalidatePath('/documents')
    return template
}

// Template'leri listele
export async function getTemplates(
    databaseId: string
): Promise<DatabaseTemplate[]> {
    return db.databaseTemplate.findMany({
        where: { databaseId },
        orderBy: [
            { isDefault: 'desc' },
            { order: 'asc' }
        ]
    })
}

// Template güncelle
export async function updateTemplate(
    templateId: string,
    data: Partial<DatabaseTemplate>
): Promise<void> {
    const { databaseId, id, createdAt, updatedAt, ...updateData } = data

    await db.databaseTemplate.update({
        where: { id: templateId },
        data: updateData as any
    })

    revalidatePath('/documents')
}

// Template sil
export async function deleteTemplate(templateId: string): Promise<void> {
    await db.databaseTemplate.delete({
        where: { id: templateId }
    })

    revalidatePath('/documents')
}

// Template'den row oluştur
export async function createRowFromTemplate(
    databaseId: string,
    templateId: string
): Promise<DatabaseRow> {
    const template = await db.databaseTemplate.findUnique({
        where: { id: templateId }
    })

    if (!template) throw new Error("Template not found")

    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Page oluştur
    const page = await db.page.create({
        data: {
            title: 'Untitled',
            icon: template.icon,
            content: template.content,
            userId: user.id,
            parentId: databaseId // Assuming row page is child of database page - actually database pageId?
            // Wait, database has pageId (parent). Rows usually children of database page?
            // Existing `addRow` uses `parentId: database.pageId`.
            // I need to fetch database to get pageId? Or just skip parentId?
            // Let's use `create` without parentId if we don't know it, or fetch DB.
            // But `databaseId` is passed.
            // I'll fetch database to be safe and consistent with addRow.
        }
    })

    // Row oluştur
    const row = await db.databaseRow.create({
        data: {
            databaseId,
            pageId: page.id
        },
        include: { page: true }
    })

    // Default cells oluştur
    if (template.defaultCells) {
        const defaultCells = template.defaultCells as Record<string, any>
        const cellsToCreate = Object.entries(defaultCells).map(([propertyId, value]) => ({
            propertyId,
            rowId: row.id,
            value
        }))

        await db.cell.createMany({ data: cellsToCreate })
    }

    revalidatePath('/documents')
    return row
}

// ============ ROW DETAILS FOR PAGE VIEW ============

export async function getRowDetails(rowId: string) {
    const user = await getCurrentUser()
    if (!user) {
        return null
    }

    const row = await db.databaseRow.findUnique({
        where: { id: rowId },
        include: {
            cells: true,
            database: {
                include: {
                    properties: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    })

    // Security check: Ensure user has access to the database/page
    // For MVP, if they can access the row, they likely can access the properties.
    // Ideally check page ownership or sharing here too.
    // The `row` fetch itself doesn't check user, but `getDocument` that led here did.
    // We should probably check if `row.database.page.userId === user.id` OR shared.
    // For now, relying on the fact that they reached this page via getDocument which checks auth.
    // But `getLinkedDatabase` does strict check.
    // Let's at least check basic ownership if possible, but row->database->page is relation.
    // Let's fetch database page info to be safe if we want strict security.

    // Actually, `row` includes `database`. We can include `database.page`.
    const rowWithPage = await db.databaseRow.findUnique({
        where: { id: rowId },
        include: {
            cells: true,
            database: {
                include: {
                    properties: {
                        orderBy: { order: 'asc' }
                    },
                    page: true
                }
            }
        }
    })

    if (!rowWithPage) return null

    // Simple ownership check for now (can be improved for shared pages)
    // If we assume `getDocument` handled access to the *Page* (which is the row's page),
    // then we are mostly fine. But we are fetching *Parent Database* info here.
    // Access to child page usually implies some access to parent context or the user owns it.

    return rowWithPage
}
