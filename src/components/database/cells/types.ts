
export interface CellProps {
    getValue: () => any
    rowId: string
    propertyId: string
    table: any // Tanstack table instance if needed
    column: any // Column instance
    cell: any // Cell instance
    isEditing: boolean
    startEditing: () => void
    stopEditing: () => void
    updateValue: (value: any) => void
    row?: any // Optional row object for direct access
    onPropertyUpdate?: (propertyId: string, data: any) => void // For updating property config
}

