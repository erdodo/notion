import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { persist } from './middleware/persistence';
import { OptimisticUpdateManager } from './middleware/sync';

export interface DatabaseProperty {
  id: string;
  name: string;
  type: string;
  databaseId: string;
  order: number;
  width: number;
  isVisible: boolean;
  options?: unknown;
}

export interface DatabaseCell {
  id: string;
  propertyId: string;
  rowId: string;
  value: unknown;
  _pendingUpdate?: boolean;
}

export interface DatabaseRow {
  id: string;
  databaseId: string;
  pageId?: string | null;
  order: number;
  parentRowId?: string | null;
  cells: DatabaseCell[];
  _optimistic?: boolean;
  _pendingUpdate?: boolean;
}

export interface Database {
  id: string;
  pageId: string;
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  defaultView: string;
}

interface PendingOperation {
  id: string;
  type:
    | 'cell:update'
    | 'row:create'
    | 'row:update'
    | 'row:delete'
    | 'property:create'
    | 'property:update'
    | 'property:delete';
  databaseId: string;
  entityId: string;
  timestamp: number;
}

interface DatabaseStore {
  databases: Map<string, Database>;
  pendingOperations: PendingOperation[];
  optimisticManager: OptimisticUpdateManager<unknown>;

  getDatabase: (databaseId: string) => Database | undefined;
  getDatabaseRows: (databaseId: string) => DatabaseRow[];
  getDatabaseProperties: (databaseId: string) => DatabaseProperty[];
  getCell: (
    databaseId: string,
    rowId: string,
    propertyId: string
  ) => DatabaseCell | undefined;

  setDatabase: (database: Database) => void;

  updateCellOptimistic: (
    databaseId: string,
    rowId: string,
    propertyId: string,
    value: unknown,
    serverAction: () => Promise<void>
  ) => void;

  batchUpdateCellsOptimistic: (
    databaseId: string,
    updates: { rowId: string; propertyId: string; value: unknown }[],
    serverAction: () => Promise<void>
  ) => void;

  createRowOptimistic: (
    databaseId: string,
    row: Partial<DatabaseRow>,
    serverAction: () => Promise<DatabaseRow>
  ) => void;

  updateRowOptimistic: (
    databaseId: string,
    rowId: string,
    updates: Partial<DatabaseRow>,
    serverAction: () => Promise<void>
  ) => void;

  deleteRowOptimistic: (
    databaseId: string,
    rowId: string,
    serverAction: () => Promise<void>
  ) => void;

  createPropertyOptimistic: (
    databaseId: string,
    property: Partial<DatabaseProperty>,
    serverAction: () => Promise<DatabaseProperty>
  ) => void;

  updatePropertyOptimistic: (
    databaseId: string,
    propertyId: string,
    updates: Partial<DatabaseProperty>,
    serverAction: () => Promise<void>
  ) => void;

  deletePropertyOptimistic: (
    databaseId: string,
    propertyId: string,
    serverAction: () => Promise<void>
  ) => void;

  updateCell: (
    databaseId: string,
    rowId: string,
    propertyId: string,
    value: unknown
  ) => void;
  createRow: (databaseId: string, row: DatabaseRow) => void;
  updateRow: (
    databaseId: string,
    rowId: string,
    updates: Partial<DatabaseRow>
  ) => void;
  deleteRow: (databaseId: string, rowId: string) => void;
  createProperty: (databaseId: string, property: DatabaseProperty) => void;
  updateProperty: (
    databaseId: string,
    propertyId: string,
    updates: Partial<DatabaseProperty>
  ) => void;
  deleteProperty: (databaseId: string, propertyId: string) => void;

  addPendingOperation: (operation: PendingOperation) => void;
  removePendingOperation: (operationId: string) => void;
  isPending: (databaseId: string, entityId: string) => boolean;
}

export const useDatabaseStore = create<DatabaseStore>()(
  persist(
    (set, get) => ({
      databases: new Map(),
      pendingOperations: [],
      optimisticManager: new OptimisticUpdateManager<unknown>(),

      getDatabase: (databaseId) => {
        return get().databases.get(databaseId);
      },

      getDatabaseRows: (databaseId) => {
        const database = get().databases.get(databaseId);
        return database?.rows || [];
      },

      getDatabaseProperties: (databaseId) => {
        const database = get().databases.get(databaseId);
        return database?.properties || [];
      },

      getCell: (databaseId, rowId, propertyId) => {
        const database = get().databases.get(databaseId);
        const row = database?.rows.find((r) => r.id === rowId);
        return row?.cells.find((c) => c.propertyId === propertyId);
      },

      setDatabase: (database) => {
        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(database.id, database);
          return { databases: newDatabases };
        });
      },

      updateCellOptimistic: (
        databaseId,
        rowId,
        propertyId,
        value,
        serverAction
      ) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        const updatedRows = database.rows.map((row) => {
          if (row.id === rowId) {
            const updatedCells = row.cells.map((cell) => {
              if (cell.propertyId === propertyId) {
                return { ...cell, value, _pendingUpdate: true };
              }
              return cell;
            });

            if (!updatedCells.find((c) => c.propertyId === propertyId)) {
              updatedCells.push({
                id: uuidv4(),
                propertyId,
                rowId,
                value,
                _pendingUpdate: true,
              });
            }
            return { ...row, cells: updatedCells };
          }
          return row;
        });

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, { ...database, rows: updatedRows });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'cell:update',
          databaseId,
          entityId: `${rowId}-${propertyId}`,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          { rowId, propertyId, value },

          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();

            const currentDatabase = get().databases.get(databaseId);
            if (currentDatabase) {
              const clearedRows = currentDatabase.rows.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    cells: row.cells.map((cell) =>
                      cell.propertyId === propertyId
                        ? { ...cell, _pendingUpdate: false }
                        : cell
                    ),
                  };
                }
                return row;
              });
              set((state) => {
                const newDatabases = new Map(state.databases);
                newDatabases.set(databaseId, {
                  ...currentDatabase,
                  rows: clearedRows,
                });
                return { databases: newDatabases };
              });
            }
            get().removePendingOperation(operationId);
          }
        );
      },

      batchUpdateCellsOptimistic: (databaseId, updates, serverAction) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        let updatedRows = [...database.rows];
        for (const { rowId, propertyId, value } of updates) {
          updatedRows = updatedRows.map((row) => {
            if (row.id === rowId) {
              const updatedCells = row.cells.map((cell) => {
                if (cell.propertyId === propertyId) {
                  return { ...cell, value, _pendingUpdate: true };
                }
                return cell;
              });
              if (!updatedCells.find((c) => c.propertyId === propertyId)) {
                updatedCells.push({
                  id: uuidv4(),
                  propertyId,
                  rowId,
                  value,
                  _pendingUpdate: true,
                });
              }
              return { ...row, cells: updatedCells };
            }
            return row;
          });
        }

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, { ...database, rows: updatedRows });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'cell:update',
          databaseId,
          entityId: 'batch',
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          updates,
          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },
          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      createRowOptimistic: (databaseId, row, serverAction) => {
        const temporaryId = row.id || `temp-${uuidv4()}`;
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const optimisticRow: DatabaseRow = {
          id: temporaryId,
          databaseId,
          pageId: row.pageId,
          order: row.order || database.rows.length,
          parentRowId: row.parentRowId,
          cells: row.cells || [],
          _optimistic: true,
        };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: [...database.rows, optimisticRow],
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'row:create',
          databaseId,
          entityId: temporaryId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          optimisticRow,
          () => {
            const currentDatabase = get().databases.get(databaseId);
            if (currentDatabase) {
              set((state) => {
                const newDatabases = new Map(state.databases);
                newDatabases.set(databaseId, {
                  ...currentDatabase,
                  rows: currentDatabase.rows.filter(
                    (r) => r.id !== temporaryId
                  ),
                });
                return { databases: newDatabases };
              });
            }
            get().removePendingOperation(operationId);
          },
          async () => {
            const result = await serverAction();
            const currentDatabase = get().databases.get(databaseId);
            if (currentDatabase) {
              set((state) => {
                const newDatabases = new Map(state.databases);
                newDatabases.set(databaseId, {
                  ...currentDatabase,
                  rows: currentDatabase.rows.map((r) =>
                    r.id === temporaryId ? { ...result, _optimistic: false } : r
                  ),
                });
                return { databases: newDatabases };
              });
            }
            get().removePendingOperation(operationId);
          }
        );
      },

      updateRowOptimistic: (databaseId, rowId, updates, serverAction) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: database.rows.map((r) =>
              r.id === rowId ? { ...r, ...updates, _pendingUpdate: true } : r
            ),
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'row:update',
          databaseId,
          entityId: rowId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          updates,
          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },
          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      deleteRowOptimistic: (databaseId, rowId, serverAction) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: database.rows.filter((r) => r.id !== rowId),
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'row:delete',
          databaseId,
          entityId: rowId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          {},
          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },
          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      createPropertyOptimistic: (databaseId, property, serverAction) => {
        const temporaryId = property.id || `temp-${uuidv4()}`;
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const optimisticProperty: DatabaseProperty = {
          id: temporaryId,
          name: property.name || 'New Property',
          type: property.type || 'TEXT',
          databaseId,
          order: property.order || database.properties.length,
          width: property.width || 200,
          isVisible:
            property.isVisible === undefined ? true : property.isVisible,
          options: property.options,
        };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: [...database.properties, optimisticProperty],
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'property:create',
          databaseId,
          entityId: temporaryId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          optimisticProperty,
          () => {
            const currentDatabase = get().databases.get(databaseId);
            if (currentDatabase) {
              set((state) => {
                const newDatabases = new Map(state.databases);
                newDatabases.set(databaseId, {
                  ...currentDatabase,
                  properties: currentDatabase.properties.filter(
                    (p) => p.id !== temporaryId
                  ),
                });
                return { databases: newDatabases };
              });
            }
            get().removePendingOperation(operationId);
          },
          async () => {
            const result = await serverAction();
            const currentDatabase = get().databases.get(databaseId);
            if (currentDatabase) {
              set((state) => {
                const newDatabases = new Map(state.databases);
                newDatabases.set(databaseId, {
                  ...currentDatabase,
                  properties: currentDatabase.properties.map((p) =>
                    p.id === temporaryId ? result : p
                  ),
                });
                return { databases: newDatabases };
              });
            }
            get().removePendingOperation(operationId);
          }
        );
      },

      updatePropertyOptimistic: (
        databaseId,
        propertyId,
        updates,
        serverAction
      ) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: database.properties.map((p) =>
              p.id === propertyId ? { ...p, ...updates } : p
            ),
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'property:update',
          databaseId,
          entityId: propertyId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          updates,
          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },
          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      deletePropertyOptimistic: (databaseId, propertyId, serverAction) => {
        const operationId = uuidv4();
        const database = get().databases.get(databaseId);
        if (!database) return;

        const previousDatabase = { ...database };

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: database.properties.filter((p) => p.id !== propertyId),
          });
          return { databases: newDatabases };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'property:delete',
          databaseId,
          entityId: propertyId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          {},
          () => {
            set((state) => {
              const newDatabases = new Map(state.databases);
              newDatabases.set(databaseId, previousDatabase);
              return { databases: newDatabases };
            });
            get().removePendingOperation(operationId);
          },
          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      updateCell: (databaseId, rowId, propertyId, value) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        const updatedRows = database.rows.map((row) => {
          if (row.id === rowId) {
            const updatedCells = row.cells.map((cell) => {
              if (cell.propertyId === propertyId) {
                return { ...cell, value };
              }
              return cell;
            });
            if (!updatedCells.find((c) => c.propertyId === propertyId)) {
              updatedCells.push({
                id: uuidv4(),
                propertyId,
                rowId,
                value,
              });
            }
            return { ...row, cells: updatedCells };
          }
          return row;
        });

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, { ...database, rows: updatedRows });
          return { databases: newDatabases };
        });
      },

      createRow: (databaseId, row) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: [...database.rows, row],
          });
          return { databases: newDatabases };
        });
      },

      updateRow: (databaseId, rowId, updates) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: database.rows.map((r) =>
              r.id === rowId ? { ...r, ...updates } : r
            ),
          });
          return { databases: newDatabases };
        });
      },

      deleteRow: (databaseId, rowId) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            rows: database.rows.filter((r) => r.id !== rowId),
          });
          return { databases: newDatabases };
        });
      },

      createProperty: (databaseId, property) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: [...database.properties, property],
          });
          return { databases: newDatabases };
        });
      },

      updateProperty: (databaseId, propertyId, updates) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: database.properties.map((p) =>
              p.id === propertyId ? { ...p, ...updates } : p
            ),
          });
          return { databases: newDatabases };
        });
      },

      deleteProperty: (databaseId, propertyId) => {
        const database = get().databases.get(databaseId);
        if (!database) return;

        set((state) => {
          const newDatabases = new Map(state.databases);
          newDatabases.set(databaseId, {
            ...database,
            properties: database.properties.filter((p) => p.id !== propertyId),
          });
          return { databases: newDatabases };
        });
      },

      addPendingOperation: (operation) => {
        set((state) => ({
          pendingOperations: [...state.pendingOperations, operation],
        }));
      },

      removePendingOperation: (operationId) => {
        set((state) => ({
          pendingOperations: state.pendingOperations.filter(
            (op) => op.id !== operationId
          ),
        }));
      },

      isPending: (databaseId, entityId) => {
        return get().pendingOperations.some(
          (op) => op.databaseId === databaseId && op.entityId === entityId
        );
      },
    }),
    {
      name: 'database-store',
      partialize: (state) =>
        ({
          databases: Object.fromEntries(state.databases),
        }) as unknown,
      version: 1,
    }
  )
);
