
import Papa from "papaparse";
import { db } from "../db";
import { PropertyType } from "@prisma/client";

interface CsvImportResult {
    databaseId: string;
    rowCount: number;
}

export async function importCsvAsDatabase(
    csvContent: string,
    databaseName: string,
    parentId: string,
    userId: string
): Promise<CsvImportResult> {
    // 1. Parse CSV
    const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
        console.error("CSV Parse Errors:", parsed.errors);
        throw new Error("Failed to parse CSV");
    }

    const rows = parsed.data as Record<string, any>[];
    if (rows.length === 0) {
        throw new Error("CSV is empty");
    }

    const headers = parsed.meta.fields || Object.keys(rows[0]);

    // 2. Create Page for Database
    const page = await db.page.create({
        data: {
            title: databaseName,
            userId: userId,
            parentId: parentId,
            isDatabase: true,
            isFullWidth: true,
        }
    });

    // 3. Create Database Record
    const database = await db.database.create({
        data: {
            pageId: page.id,
            defaultView: "table",
        }
    });

    // 4. Create Default View
    await db.databaseView.create({
        data: {
            databaseId: database.id,
            name: "Table View",
            type: "table",
            isDefault: true
        }
    });

    // 5. Infer and Create Properties
    const propertyMap = new Map<string, string>(); // Header -> PropertyID

    // Logic to infer types (simplified for now)
    // We assume first column is Title
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        let type: PropertyType = PropertyType.TEXT;

        if (i === 0) {
            type = PropertyType.TITLE;
        } else if (header.toLowerCase().includes("date") || header.toLowerCase().includes("time")) {
            type = PropertyType.DATE;
        } else if (header.toLowerCase().includes("price") || header.toLowerCase().includes("amount") || header.toLowerCase().includes("cost")) {
            type = PropertyType.NUMBER;
        } else if (header.toLowerCase().includes("status")) {
            type = PropertyType.STATUS;
        } else if (header.toLowerCase().includes("category") || header.toLowerCase().includes("tag")) {
            type = PropertyType.MULTI_SELECT;
        }

        const property = await db.property.create({
            data: {
                databaseId: database.id,
                name: header,
                type: type,
                order: i
            }
        });
        propertyMap.set(header, property.id);
    }

    // 6. Import Rows
    for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i];

        // titleVal is the value of the first header
        const titleVal = rowData[headers[0]] || "Untitled";

        const rowPage = await db.page.create({
            data: {
                title: String(titleVal),
                userId: userId,
                parentId: page.id, // Parent is the Database Page
                databaseRow: {
                    create: {
                        databaseId: database.id,
                        order: i
                    }
                }
            },
            include: {
                databaseRow: true
            }
        });

        const rowId = rowPage.databaseRow!.id;

        // Create Cells
        for (const header of headers) {
            const propertyId = propertyMap.get(header);
            if (!propertyId) continue;

            const val = rowData[header];
            if (val === undefined || val === null || val === "") continue;

            // TODO: Format value based on type (e.g. Number, Date)
            // For now, we store everything as text in the JSON value 
            // or basic primitives.

            await db.cell.create({
                data: {
                    propertyId: propertyId,
                    rowId: rowId,
                    value: val // Prisma handles JSON mapping
                }
            });
        }
    }

    return {
        databaseId: database.id,
        rowCount: rows.length
    };
}
