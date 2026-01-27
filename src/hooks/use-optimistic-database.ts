import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  DatabaseView,
} from '@prisma/client';
import { useState, useCallback, useEffect } from 'react';

export type DetailedDatabase = Database & {
  properties: Property[];
  rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
  views: DatabaseView[];
};

export function useOptimisticDatabase(initialDatabase: DetailedDatabase) {
  const [database, setDatabase] = useState<DetailedDatabase>(initialDatabase);

  useEffect(() => {
    setDatabase(initialDatabase);
  }, [initialDatabase]);

  const updateCell = useCallback(
    (rowId: string, propertyId: string, value: unknown) => {
      setDatabase((previous) => {
        const newRows = previous.rows.map((row) => {
          if (row.id !== rowId) return row;

          const cellIndex = row.cells.findIndex(
            (c) => c.propertyId === propertyId
          );
          const newCells = [...row.cells];

          if (cellIndex === -1) {
            newCells.push({
              id: `temp-${Math.random()}`,
              rowId,
              propertyId,
              value: value as never,
            } as Cell);
          } else {
            newCells[cellIndex] = {
              ...newCells[cellIndex],
              value: value as never,
            };
          }

          return { ...row, cells: newCells };
        });
        return { ...previous, rows: newRows };
      });
    },
    []
  );

  const addRow = useCallback(
    (newRow: DatabaseRow & { cells: Cell[]; page: Page | null }) => {
      setDatabase((previous) => ({
        ...previous,
        rows: [...previous.rows, newRow],
      }));
    },
    []
  );

  const addProperty = useCallback((property: Property) => {
    setDatabase((previous) => ({
      ...previous,
      properties: [...previous.properties, property],
    }));
  }, []);

  const updateProperty = useCallback(
    (propertyId: string, data: Partial<Property>) => {
      setDatabase((previous) => ({
        ...previous,
        properties: previous.properties.map((p) =>
          p.id === propertyId ? { ...p, ...data } : p
        ),
      }));
    },
    []
  );

  return {
    database,
    setDatabase,
    updateCell,
    addRow,
    addProperty,
    updateProperty,
  };
}
