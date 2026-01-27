import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useFilteredSortedData,
  DetailedDatabase,
} from '../use-filtered-sorted-data';
import { useDatabase } from '../use-database';

vi.mock('../use-database', () => ({
  useDatabase: vi.fn(),
}));

const FIXED_DATE = new Date('2024-01-01T12:00:00Z');
vi.useFakeTimers();
vi.setSystemTime(FIXED_DATE);

describe('useFilteredSortedData', () => {
  const mockDatabase = {
    id: 'db1',
    title: 'Test DB',
    properties: [
      { id: 'p1', name: 'Name', type: 'TEXT', options: [] },
      { id: 'p2', name: 'Amount', type: 'NUMBER', options: [] },
      { id: 'p3', name: 'Tag', type: 'SELECT', options: [] },
      { id: 'p4', name: 'Date', type: 'DATE', options: [] },
      { id: 'p5', name: 'Done', type: 'CHECKBOX', options: [] },
    ],
    rows: [
      {
        id: 'r1',
        parentRowId: null,
        cells: [
          { propertyId: 'p1', value: 'Alpha' },
          { propertyId: 'p2', value: 10 },
          { propertyId: 'p3', value: 'Blue' },
          { propertyId: 'p4', value: '2024-01-01' },
          { propertyId: 'p5', value: true },
        ],
        page: null,
      },
      {
        id: 'r2',
        parentRowId: null,
        cells: [
          { propertyId: 'p1', value: 'Beta' },
          { propertyId: 'p2', value: 20 },
          { propertyId: 'p3', value: 'Red' },
          { propertyId: 'p4', value: '2023-12-31' },
          { propertyId: 'p5', value: false },
        ],
        page: null,
      },
      {
        id: 'r3',
        parentRowId: null,
        cells: [
          { propertyId: 'p1', value: 'Gamma' },
          { propertyId: 'p2', value: 5 },
          { propertyId: 'p3', value: 'Blue' },
          { propertyId: 'p4', value: '2024-01-02' },
          { propertyId: 'p5', value: false },
        ],
        page: null,
      },
    ],
  } as unknown as DetailedDatabase;

  beforeEach(() => {
    vi.clearAllMocks();
    (useDatabase as any).mockReturnValue({
      filters: [],
      sorts: [],
      searchQuery: '',
      groupByProperty: null,
    });
  });

  it('should return all rows when no filters/sorts', () => {
    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));

    expect(result.current).toHaveProperty('sortedRows');
    expect(result.current).toHaveProperty('groupedRows');
    expect(result.current.sortedRows).toHaveLength(3);

    expect(result.current.sortedRows.map((r: any) => r.id)).toEqual([
      'r1',
      'r2',
      'r3',
    ]);
  });

  it('should filter by text (contains)', () => {
    (useDatabase as any).mockReturnValue({
      filters: [{ propertyId: 'p1', operator: 'contains', value: 'Al' }],
      sorts: [],
      searchQuery: '',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    expect(result.current.sortedRows).toHaveLength(1);
    expect(result.current.sortedRows[0].id).toBe('r1');
  });

  it('should filter by number (greater than logic - currently only "is" implemented in code but let\'s test)', () => {
    (useDatabase as any).mockReturnValue({
      filters: [{ propertyId: 'p2', operator: 'is', value: '20' }],
      sorts: [],
      searchQuery: '',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    expect(result.current.sortedRows).toHaveLength(1);
    expect(result.current.sortedRows[0].id).toBe('r2');
  });

  it('should filter by date (is_today)', () => {
    (useDatabase as any).mockReturnValue({
      filters: [{ propertyId: 'p4', operator: 'is_today', value: '' }],
      sorts: [],
      searchQuery: '',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    expect(result.current.sortedRows).toHaveLength(1);
    expect(result.current.sortedRows[0].id).toBe('r1');
  });

  it('should filter by global search', () => {
    (useDatabase as any).mockReturnValue({
      filters: [],
      sorts: [],
      searchQuery: 'Red',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    expect(result.current.sortedRows).toHaveLength(1);
    expect(result.current.sortedRows[0].id).toBe('r2');
  });

  it('should sort rows ascending', () => {
    (useDatabase as any).mockReturnValue({
      filters: [],
      sorts: [{ propertyId: 'p2', direction: 'asc' }],
      searchQuery: '',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    const ids = result.current.sortedRows.map((r: any) => r.id);
    expect(ids).toEqual(['r3', 'r1', 'r2']);
  });

  it('should sort rows descending', () => {
    (useDatabase as any).mockReturnValue({
      filters: [],
      sorts: [{ propertyId: 'p2', direction: 'desc' }],
      searchQuery: '',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));
    const ids = result.current.sortedRows.map((r: any) => r.id);
    expect(ids).toEqual(['r2', 'r1', 'r3']);
  });

  it('should group rows', () => {
    (useDatabase as any).mockReturnValue({
      filters: [],
      sorts: [],
      searchQuery: '',
      groupByProperty: 'p3',
    });

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase));

    expect(result.current.isGrouped).toBe(true);
    expect(result.current.groupedRows).toHaveLength(2);

    const groupKeys = result.current.groupedRows.map((g: any) => g.groupValue);
    expect(groupKeys).toEqual(['Blue', 'Red']);

    const blueGroup = result.current.groupedRows.find(
      (g: any) => g.groupValue === 'Blue'
    );
    expect(blueGroup?.rows).toHaveLength(2);
  });
});
