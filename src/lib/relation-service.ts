import { DatabaseRow } from "@prisma/client"

export interface RelationConfig {
    targetDatabaseId: string
    bidirectional: boolean
    reversePropertyId?: string
    limitType: 'none' | 'one'  // 'one' = single select, 'none' = multi select
}

export interface RelationCellValue {
    linkedRowIds: string[]
}

// Linked rows'ları fetch et
export async function getLinkedRows(
    targetDatabaseId: string,
    linkedRowIds: string[]
): Promise<DatabaseRow[]> {
    // Server action'da implement edilecek
    return [] // Placeholder
}

// Row link et
export async function linkRows(
    propertyId: string,
    sourceRowId: string,
    targetRowIds: string[],
    bidirectional: boolean,
    reversePropertyId?: string
): Promise<void> {
    // Server action'da implement edilecek
    // Bidirectional ise reverse property'yi de güncelle
}

// Row unlink et
export async function unlinkRow(
    propertyId: string,
    sourceRowId: string,
    targetRowId: string,
    bidirectional: boolean,
    reversePropertyId?: string
): Promise<void> {
    // Server action'da implement edilecek
}
