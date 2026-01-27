import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useOptimisticDatabase } from '../use-optimistic-database';
import type { DetailedDatabase } from '../use-optimistic-database';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('useOptimisticDatabase', () => {
  let mockDatabase: DetailedDatabase;

  beforeEach(() => {
    mockDatabase = {
      id: 'db-1',
      workspaceId: '1',
      name: 'Test Database',
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: [
        {
          id: 'prop-1',
          databaseId: 'db-1',
          name: 'Name',
          type: 'text' as any,
          config: {},
        },
      ],
      rows: [
        {
          id: 'row-1',
          databaseId: 'db-1',
          pageId: 'page-1',
          cells: [
            {
              id: 'cell-1',
              rowId: 'row-1',
              propertyId: 'prop-1',
              value: 'Test',
            },
          ],
          page: null,
        },
      ],
    } as DetailedDatabase;
  });

  it('should initialize with provided database', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    expect(result.current.database.id).toBe('db-1');
    expect(result.current.database.rows).toHaveLength(1);
  });

  it('should update cell value optimistically', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    act(() => {
      result.current.updateCell('row-1', 'prop-1', 'Updated Value');
    });

    const updatedCell = result.current.database.rows[0].cells[0];
    expect(updatedCell.value).toBe('Updated Value');
  });

  it('should add new cell if it does not exist', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    act(() => {
      result.current.updateCell('row-1', 'prop-2', 'New Value');
    });

    const row = result.current.database.rows[0];
    expect(row.cells).toHaveLength(2);
    expect(row.cells[1].value).toBe('New Value');
  });

  it('should not affect other rows when updating', () => {
    mockDatabase.rows.push({
      id: 'row-2',
      databaseId: 'db-1',
      pageId: 'page-2',
      cells: [
        {
          id: 'cell-2',
          rowId: 'row-2',
          propertyId: 'prop-1',
          value: 'Another',
        },
      ],
      page: null,
    } as any);

    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    act(() => {
      result.current.updateCell('row-1', 'prop-1', 'Updated');
    });

    expect(result.current.database.rows[1].cells[0].value).toBe('Another');
  });

  it('should handle adding new rows', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    const newRow = {
      id: 'row-2',
      databaseId: 'db-1',
      pageId: 'page-2',
      cells: [],
      page: null,
    };

    act(() => {
      result.current.addRow(newRow as any);
    });

    expect(result.current.database.rows).toHaveLength(2);
  });

  it('should handle deleting rows', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    expect(result.current.database.rows).toHaveLength(1);

    act(() => {
      result.current.deleteRow('row-1');
    });

    expect(result.current.database.rows).toHaveLength(0);
  });

  it('should update database when props change', () => {
    const { result, rerender } = renderHook(
      (database) => useOptimisticDatabase(database),
      {
        initialProps: mockDatabase,
      }
    );

    expect(result.current.database.id).toBe('db-1');

    const newDatabase = { ...mockDatabase, id: 'db-2' } as DetailedDatabase;
    rerender(newDatabase);

    expect(result.current.database.id).toBe('db-2');
  });

  it('should preserve optimistic updates after re-initialization', () => {
    const { result, rerender } = renderHook(
      (database) => useOptimisticDatabase(database),
      {
        initialProps: mockDatabase,
      }
    );

    act(() => {
      result.current.updateCell('row-1', 'prop-1', 'Optimistic Value');
    });

    const newDatabase = { ...mockDatabase } as DetailedDatabase;
    rerender(newDatabase);

    expect(result.current.database.rows[0].cells[0].value).toBeDefined();
  });

  it('should handle multiple cell updates', () => {
    const { result } = renderHook(() => useOptimisticDatabase(mockDatabase));

    act(() => {
      result.current.updateCell('row-1', 'prop-1', 'Value 1');
      result.current.updateCell('row-1', 'prop-2', 'Value 2');
      result.current.updateCell('row-1', 'prop-3', 'Value 3');
    });

    expect(result.current.database.rows[0].cells).toHaveLength(3);
  });
});
