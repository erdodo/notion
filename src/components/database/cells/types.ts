
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
}
