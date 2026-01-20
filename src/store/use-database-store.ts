/**
 * Database Store
 * 
 * Manages database state with optimistic updates for rows, cells, and properties
 */

import { create } from "zustand"
import { persist } from "./middleware/persistence"
import { OptimisticUpdateManager } from "./middleware/sync"
import { v4 as uuidv4 } from "uuid"

export type DatabaseProperty = {
    id: string
    name: string
    type: string
    databaseId: string
    order: number
    width: number
    isVisible: boolean
    options?: any
}

export type DatabaseCell = {
    id: string
    propertyId: string
    rowId: string
    value: any
    _pendingUpdate?: boolean
}

export type DatabaseRow = {
    id: string
    databaseId: string
    pageId?: string | null
    order: number
    parentRowId?: string | null
    cells: DatabaseCell[]
    _optimistic?: boolean
    _pendingUpdate?: boolean
}

export type Database = {
    id: string
    pageId: string
    properties: DatabaseProperty[]
    rows: DatabaseRow[]
    defaultView: string
}

type PendingOperation = {
    id: string
    type: 'cell:update' | 'row:create' | 'row:update' | 'row:delete' | 'property:create' | 'property:update' | 'property:delete'
    databaseId: string
    entityId: string
    timestamp: number
}

type DatabaseStore = {
    databases: Map<string, Database>
    pendingOperations: PendingOperation[]
    optimisticManager: OptimisticUpdateManager<any>

    // Getters
    getDatabase: (databaseId: string) => Database | undefined
    getDatabaseRows: (databaseId: string) => DatabaseRow[]
    getDatabaseProperties: (databaseId: string) => DatabaseProperty[]
    getCell: (databaseId: string, rowId: string, propertyId: string) => DatabaseCell | undefined

    // Setters
    setDatabase: (database: Database) => void

    // Optimistic operations - Cells
    updateCellOptimistic: (
        databaseId: string,
        rowId: string,
        propertyId: string,
        value: any,
        serverAction: () => Promise<void>
    ) => void

    batchUpdateCellsOptimistic: (
        databaseId: string,
        updates: Array<{ rowId: string; propertyId: string; value: any }>,
        serverAction: () => Promise<void>
    ) => void

    // Optimistic operations - Rows
    createRowOptimistic: (
        databaseId: string,
        row: Partial<DatabaseRow>,
        serverAction: () => Promise<DatabaseRow>
    ) => void

    updateRowOptimistic: (
        databaseId: string,
        rowId: string,
        updates: Partial<DatabaseRow>,
        serverAction: () => Promise<void>
    ) => void

    deleteRowOptimistic: (
        databaseId: string,
        rowId: string,
        serverAction: () => Promise<void>
    ) => void

    // Optimistic operations - Properties
    createPropertyOptimistic: (
        databaseId: string,
        property: Partial<DatabaseProperty>,
        serverAction: () => Promise<DatabaseProperty>
    ) => void

    updatePropertyOptimistic: (
        databaseId: string,
        propertyId: string,
        updates: Partial<DatabaseProperty>,
        serverAction: () => Promise<void>
    ) => void

    deletePropertyOptimistic: (
        databaseId: string,
        propertyId: string,
        serverAction: () => Promise<void>
    ) => void

    // Direct operations (from WebSocket events)
    updateCell: (databaseId: string, rowId: string, propertyId: string, value: any) => void
    createRow: (databaseId: string, row: DatabaseRow) => void
    updateRow: (databaseId: string, rowId: string, updates: Partial<DatabaseRow>) => void
    deleteRow: (databaseId: string, rowId: string) => void
    createProperty: (databaseId: string, property: DatabaseProperty) => void
    updateProperty: (databaseId: string, propertyId: string, updates: Partial<DatabaseProperty>) => void
    deleteProperty: (databaseId: string, propertyId: string) => void

    // Pending operations management
    addPendingOperation: (operation: PendingOperation) => void
    removePendingOperation: (operationId: string) => void
    isPending: (databaseId: string, entityId: string) => boolean
}

export const useDatabaseStore = create<DatabaseStore>()(
    persist(
        (set, get) => ({
            databases: new Map(),
            pendingOperations: [],
            optimisticManager: new OptimisticUpdateManager<any>(),

            // ============ Getters ============

            getDatabase: (databaseId) => {
                return get().databases.get(databaseId)
            },

            getDatabaseRows: (databaseId) => {
                const db = get().databases.get(databaseId)
                return db?.rows || []
            },

            getDatabaseProperties: (databaseId) => {
                const db = get().databases.get(databaseId)
                return db?.properties || []
            },

            getCell: (databaseId, rowId, propertyId) => {
                const db = get().databases.get(databaseId)
                const row = db?.rows.find(r => r.id === rowId)
                return row?.cells.find(c => c.propertyId === propertyId)
            },

            // ============ Setters ============

            setDatabase: (database) => {
                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(database.id, database)
                    return { databases: newDatabases }
                })
            },

            // ============ Optimistic Operations - Cells ============

            updateCellOptimistic: (databaseId, rowId, propertyId, value, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                // Update cell immediately
                const updatedRows = db.rows.map(row => {
                    if (row.id === rowId) {
                        const updatedCells = row.cells.map(cell => {
                            if (cell.propertyId === propertyId) {
                                return { ...cell, value, _pendingUpdate: true }
                            }
                            return cell
                        })
                        // If cell doesn't exist, create it
                        if (!updatedCells.find(c => c.propertyId === propertyId)) {
                            updatedCells.push({
                                id: uuidv4(),
                                propertyId,
                                rowId,
                                value,
                                _pendingUpdate: true
                            })
                        }
                        return { ...row, cells: updatedCells }
                    }
                    return row
                })

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, { ...db, rows: updatedRows })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'cell:update',
                    databaseId,
                    entityId: `${rowId}-${propertyId}`,
                    timestamp: Date.now(),
                })

                // Add to optimistic queue
                get().optimisticManager.add(
                    operationId,
                    { rowId, propertyId, value },
                    // Rollback
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    // Server action
                    async () => {
                        await serverAction()
                        // Remove pending flag
                        const currentDb = get().databases.get(databaseId)
                        if (currentDb) {
                            const clearedRows = currentDb.rows.map(row => {
                                if (row.id === rowId) {
                                    return {
                                        ...row,
                                        cells: row.cells.map(cell =>
                                            cell.propertyId === propertyId
                                                ? { ...cell, _pendingUpdate: false }
                                                : cell
                                        )
                                    }
                                }
                                return row
                            })
                            set((state) => {
                                const newDatabases = new Map(state.databases)
                                newDatabases.set(databaseId, { ...currentDb, rows: clearedRows })
                                return { databases: newDatabases }
                            })
                        }
                        get().removePendingOperation(operationId)
                    }
                )
            },

            batchUpdateCellsOptimistic: (databaseId, updates, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                // Update all cells immediately
                let updatedRows = [...db.rows]
                updates.forEach(({ rowId, propertyId, value }) => {
                    updatedRows = updatedRows.map(row => {
                        if (row.id === rowId) {
                            const updatedCells = row.cells.map(cell => {
                                if (cell.propertyId === propertyId) {
                                    return { ...cell, value, _pendingUpdate: true }
                                }
                                return cell
                            })
                            if (!updatedCells.find(c => c.propertyId === propertyId)) {
                                updatedCells.push({
                                    id: uuidv4(),
                                    propertyId,
                                    rowId,
                                    value,
                                    _pendingUpdate: true
                                })
                            }
                            return { ...row, cells: updatedCells }
                        }
                        return row
                    })
                })

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, { ...db, rows: updatedRows })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'cell:update',
                    databaseId,
                    entityId: 'batch',
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    updates,
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            // ============ Optimistic Operations - Rows ============

            createRowOptimistic: (databaseId, row, serverAction) => {
                const tempId = row.id || `temp-${uuidv4()}`
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const optimisticRow: DatabaseRow = {
                    id: tempId,
                    databaseId,
                    pageId: row.pageId,
                    order: row.order || db.rows.length,
                    parentRowId: row.parentRowId,
                    cells: row.cells || [],
                    _optimistic: true,
                }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: [...db.rows, optimisticRow]
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'row:create',
                    databaseId,
                    entityId: tempId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    optimisticRow,
                    () => {
                        const currentDb = get().databases.get(databaseId)
                        if (currentDb) {
                            set((state) => {
                                const newDatabases = new Map(state.databases)
                                newDatabases.set(databaseId, {
                                    ...currentDb,
                                    rows: currentDb.rows.filter(r => r.id !== tempId)
                                })
                                return { databases: newDatabases }
                            })
                        }
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        const result = await serverAction()
                        const currentDb = get().databases.get(databaseId)
                        if (currentDb) {
                            set((state) => {
                                const newDatabases = new Map(state.databases)
                                newDatabases.set(databaseId, {
                                    ...currentDb,
                                    rows: currentDb.rows.map(r =>
                                        r.id === tempId ? { ...result, _optimistic: false } : r
                                    )
                                })
                                return { databases: newDatabases }
                            })
                        }
                        get().removePendingOperation(operationId)
                    }
                )
            },

            updateRowOptimistic: (databaseId, rowId, updates, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: db.rows.map(r =>
                            r.id === rowId ? { ...r, ...updates, _pendingUpdate: true } : r
                        )
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'row:update',
                    databaseId,
                    entityId: rowId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    updates,
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            deleteRowOptimistic: (databaseId, rowId, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: db.rows.filter(r => r.id !== rowId)
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'row:delete',
                    databaseId,
                    entityId: rowId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    {},
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            // ============ Optimistic Operations - Properties ============

            createPropertyOptimistic: (databaseId, property, serverAction) => {
                const tempId = property.id || `temp-${uuidv4()}`
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const optimisticProperty: DatabaseProperty = {
                    id: tempId,
                    name: property.name || 'New Property',
                    type: property.type || 'TEXT',
                    databaseId,
                    order: property.order || db.properties.length,
                    width: property.width || 200,
                    isVisible: property.isVisible !== undefined ? property.isVisible : true,
                    options: property.options,
                }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: [...db.properties, optimisticProperty]
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'property:create',
                    databaseId,
                    entityId: tempId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    optimisticProperty,
                    () => {
                        const currentDb = get().databases.get(databaseId)
                        if (currentDb) {
                            set((state) => {
                                const newDatabases = new Map(state.databases)
                                newDatabases.set(databaseId, {
                                    ...currentDb,
                                    properties: currentDb.properties.filter(p => p.id !== tempId)
                                })
                                return { databases: newDatabases }
                            })
                        }
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        const result = await serverAction()
                        const currentDb = get().databases.get(databaseId)
                        if (currentDb) {
                            set((state) => {
                                const newDatabases = new Map(state.databases)
                                newDatabases.set(databaseId, {
                                    ...currentDb,
                                    properties: currentDb.properties.map(p =>
                                        p.id === tempId ? result : p
                                    )
                                })
                                return { databases: newDatabases }
                            })
                        }
                        get().removePendingOperation(operationId)
                    }
                )
            },

            updatePropertyOptimistic: (databaseId, propertyId, updates, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: db.properties.map(p =>
                            p.id === propertyId ? { ...p, ...updates } : p
                        )
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'property:update',
                    databaseId,
                    entityId: propertyId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    updates,
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            deletePropertyOptimistic: (databaseId, propertyId, serverAction) => {
                const operationId = uuidv4()
                const db = get().databases.get(databaseId)
                if (!db) return

                const previousDb = { ...db }

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: db.properties.filter(p => p.id !== propertyId)
                    })
                    return { databases: newDatabases }
                })

                get().addPendingOperation({
                    id: operationId,
                    type: 'property:delete',
                    databaseId,
                    entityId: propertyId,
                    timestamp: Date.now(),
                })

                get().optimisticManager.add(
                    operationId,
                    {},
                    () => {
                        set((state) => {
                            const newDatabases = new Map(state.databases)
                            newDatabases.set(databaseId, previousDb)
                            return { databases: newDatabases }
                        })
                        get().removePendingOperation(operationId)
                    },
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            // ============ Direct Operations (from WebSocket) ============

            updateCell: (databaseId, rowId, propertyId, value) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                const updatedRows = db.rows.map(row => {
                    if (row.id === rowId) {
                        const updatedCells = row.cells.map(cell => {
                            if (cell.propertyId === propertyId) {
                                return { ...cell, value }
                            }
                            return cell
                        })
                        if (!updatedCells.find(c => c.propertyId === propertyId)) {
                            updatedCells.push({
                                id: uuidv4(),
                                propertyId,
                                rowId,
                                value
                            })
                        }
                        return { ...row, cells: updatedCells }
                    }
                    return row
                })

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, { ...db, rows: updatedRows })
                    return { databases: newDatabases }
                })
            },

            createRow: (databaseId, row) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: [...db.rows, row]
                    })
                    return { databases: newDatabases }
                })
            },

            updateRow: (databaseId, rowId, updates) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: db.rows.map(r => r.id === rowId ? { ...r, ...updates } : r)
                    })
                    return { databases: newDatabases }
                })
            },

            deleteRow: (databaseId, rowId) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        rows: db.rows.filter(r => r.id !== rowId)
                    })
                    return { databases: newDatabases }
                })
            },

            createProperty: (databaseId, property) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: [...db.properties, property]
                    })
                    return { databases: newDatabases }
                })
            },

            updateProperty: (databaseId, propertyId, updates) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: db.properties.map(p => p.id === propertyId ? { ...p, ...updates } : p)
                    })
                    return { databases: newDatabases }
                })
            },

            deleteProperty: (databaseId, propertyId) => {
                const db = get().databases.get(databaseId)
                if (!db) return

                set((state) => {
                    const newDatabases = new Map(state.databases)
                    newDatabases.set(databaseId, {
                        ...db,
                        properties: db.properties.filter(p => p.id !== propertyId)
                    })
                    return { databases: newDatabases }
                })
            },

            // ============ Pending Operations Management ============

            addPendingOperation: (operation) => set((state) => ({
                pendingOperations: [...state.pendingOperations, operation],
            })),

            removePendingOperation: (operationId) => set((state) => ({
                pendingOperations: state.pendingOperations.filter(op => op.id !== operationId),
            })),

            isPending: (databaseId, entityId) => {
                return get().pendingOperations.some(
                    op => op.databaseId === databaseId && op.entityId === entityId
                )
            },
        }),
        {
            name: 'database-store',
            partialize: (state) => ({
                // Convert Map to object for serialization
                databases: Object.fromEntries(state.databases),
            } as any),
            version: 1,
        }
    )
)
