import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  DatabaseView,
} from '@prisma/client';
import {
  isToday,
  isTomorrow,
  isYesterday,
  subWeeks,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
  isSameDay,
} from 'date-fns';
import { useMemo } from 'react';

import { useDatabase } from './use-database';

export type DetailedDatabase = Database & {
  properties: Property[];
  rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
  views: DatabaseView[];
};

export interface GroupedResult {
  groupKey: string;
  groupValue: unknown;
  rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
}

export interface FilteredDataResult {
  sortedRows: (DatabaseRow & { cells: Cell[]; page: Page | null } & {
    depth: number;
    hasChildren: boolean;
  })[];
  groupedRows: GroupedResult[];
  isGrouped: boolean;
}

interface RowNode {
  id: string;
  originalRow: DatabaseRow & { cells: Cell[]; page: Page | null };
  children: RowNode[];
  depth: number;
  [key: string]: unknown;
}

function evaluateTextFilter(
  value: string,
  fValue: string,
  operator: string
): boolean {
  switch (operator) {
    case 'is':
      return value === fValue;
    case 'is_not':
      return value !== fValue;
    case 'contains':
      return value.includes(fValue);
    case 'not_contains':
      return !value.includes(fValue);
    case 'starts_with':
      return value.startsWith(fValue);
    case 'ends_with':
      return value.endsWith(fValue);
    default:
      return true;
  }
}

function evaluateDateFilter(
  date: Date,
  filter: { operator: string; value?: unknown }
): boolean {
  if (filter.operator === 'is_today') return isToday(date);
  if (filter.operator === 'is_tomorrow') return isTomorrow(date);
  if (filter.operator === 'is_yesterday') return isYesterday(date);
  if (filter.operator === 'is_one_week_ago')
    return isSameDay(date, subWeeks(new Date(), 1));
  if (filter.operator === 'is_one_month_ago')
    return isSameDay(date, subMonths(new Date(), 1));

  if (filter.value) {
    const filterDate = new Date(filter.value as string | number | Date);
    if (!isNaN(filterDate.getTime())) {
      switch (filter.operator) {
        case 'is':
          return isSameDay(date, filterDate);
        case 'before':
          return isBefore(date, startOfDay(filterDate));
        case 'after':
          return isAfter(date, filterDate);
        case 'is_on_or_before':
          return isBefore(date, filterDate) || isSameDay(date, filterDate);
        case 'is_on_or_after':
          return isAfter(date, filterDate) || isSameDay(date, filterDate);
      }
    }
  }
  return true;
}

function evaluateFilter(
  property: Property,
  cellValue: unknown,
  filter: { operator: string; value?: unknown }
): boolean {
  if (filter.operator === 'is_empty') {
    return (
      cellValue === null ||
      cellValue === undefined ||
      cellValue === '' ||
      (Array.isArray(cellValue) && cellValue.length === 0)
    );
  }
  if (filter.operator === 'is_not_empty') {
    return !(
      cellValue === null ||
      cellValue === undefined ||
      cellValue === '' ||
      (Array.isArray(cellValue) && cellValue.length === 0)
    );
  }

  if (cellValue === null || cellValue === undefined) return false;

  const filterValue = filter.value;

  switch (property.type) {
    case 'TEXT':
    case 'URL':
    case 'EMAIL':
    case 'PHONE': {
      const value = String(cellValue).toLowerCase();
      const fValue = String(filterValue || '').toLowerCase();
      return evaluateTextFilter(value, fValue, filter.operator);
    }
    case 'NUMBER': {
      const value = Number(cellValue);
      const fValue = Number(filterValue);
      if (filter.operator === 'is') return value === fValue;
      if (filter.operator === 'is_not') return value !== fValue;
      return true;
    }
    case 'CHECKBOX': {
      const value = Boolean(cellValue);
      if (filter.operator === 'is_checked') return value;
      if (filter.operator === 'is_unchecked') return !value;
      return true;
    }
    case 'SELECT':
    case 'MULTI_SELECT': {
      const fValue = String(filterValue || '');
      if (typeof cellValue === 'string') {
        if (filter.operator === 'is') return cellValue === fValue;
        if (filter.operator === 'is_not') return cellValue !== fValue;
        if (filter.operator === 'contains') return cellValue.includes(fValue);
        if (filter.operator === 'not_contains')
          return !cellValue.includes(fValue);
      }
      if (Array.isArray(cellValue)) {
        if (filter.operator === 'contains')
          return (cellValue as string[]).includes(fValue);
        if (filter.operator === 'not_contains')
          return !(cellValue as string[]).includes(fValue);
      }
      return true;
    }
    case 'DATE':
    case 'CREATED_TIME':
    case 'UPDATED_TIME': {
      const date = new Date(cellValue as string | number | Date);
      if (isNaN(date.getTime())) return false;
      return evaluateDateFilter(date, filter);
    }
    default:
      return true;
  }
}

export function useFilteredSortedData(
  database: DetailedDatabase
): FilteredDataResult {
  const { filters, sorts, searchQuery, groupByProperty } = useDatabase();

  const result = useMemo(() => {
    let rows = [...database.rows].map((row) => {
      const rowData: RowNode = {
        id: row.id,
        originalRow: row,
        children: [],
        depth: 0,
      };
      for (const cell of row.cells) {
        rowData[cell.propertyId] = cell.value;
      }
      return rowData;
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter((row) => {
        return row.originalRow.cells.some((cell: Cell) => {
          if (!cell.value) return false;
          const valueString =
            typeof cell.value === 'object'
              ? JSON.stringify(cell.value).toLowerCase()
              : String(cell.value).toLowerCase();
          return valueString.includes(query);
        });
      });
    }

    if (filters.length > 0) {
      rows = rows.filter((row) => {
        return filters.every((filter) => {
          const property = database.properties.find(
            (p) => p.id === filter.propertyId
          );
          if (!property) return true;

          const cellValue = row[filter.propertyId];
          return evaluateFilter(property, cellValue, filter);
        });
      });
    }

    if (sorts.length > 0) {
      rows.sort((a, b) => {
        for (const sort of sorts) {
          const valueA = a[sort.propertyId];
          const valueB = b[sort.propertyId];

          if (valueA === valueB) continue;
          if (valueA === null || valueA === undefined) return 1;
          if (valueB === null || valueB === undefined) return -1;

          const comparison =
            (valueA as number | string) > (valueB as number | string) ? 1 : -1;

          return sort.direction === 'desc' ? comparison * -1 : comparison;
        }
        return 0;
      });
    }

    let groupedRows: GroupedResult[] = [];
    let isGrouped = false;

    if (groupByProperty) {
      isGrouped = true;
      const groups = new Map<string, RowNode[]>();
      const groupValues = new Map<string, unknown>();

      for (const row of rows) {
        const value = row[groupByProperty];

        let key = String(value);
        if (value === null || value === undefined || value === '')
          key = '__empty__';

        if (!groups.has(key)) {
          groups.set(key, []);
          groupValues.set(key, value);
        }
        groups.get(key)?.push(row);
      }

      groupedRows = [...groups.entries()].map(([key, groupRows]) => ({
        groupKey: key,
        groupValue: groupValues.get(key),
        rows: groupRows.map((r) => r.originalRow),
      }));

      groupedRows.sort((a, b) => {
        if (a.groupKey === '__empty__') return 1;
        if (b.groupKey === '__empty__') return -1;
        return String(a.groupValue).localeCompare(String(b.groupValue));
      });
    } else {
      const rowMap = new Map<string, RowNode>();
      const rootRows: RowNode[] = [];

      for (const row of rows) {
        rowMap.set(row.id, { ...row, children: [], depth: 0 });
      }

      for (const row of rows) {
        const rowNode = rowMap.get(row.id);
        const parentId = row.originalRow.parentRowId;

        if (rowNode && parentId && rowMap.has(parentId)) {
          const parent = rowMap.get(parentId);
          parent?.children.push(rowNode);
        } else if (rowNode) {
          rootRows.push(rowNode);
        }
      }

      const flattenData = (nodes: RowNode[], depth: number): RowNode[] => {
        let flat: RowNode[] = [];
        for (const node of nodes) {
          node.depth = depth;
          flat.push(node);
          if (node.children && node.children.length > 0) {
            flat = flat.concat(flattenData(node.children, depth + 1));
          }
        }
        return flat;
      };

      rows = flattenData(rootRows, 0);
    }

    return {
      sortedRows: rows.map((r) => ({
        ...r.originalRow,
        depth: r.depth || 0,
        hasChildren: r.children && r.children.length > 0,
      })),
      groupedRows,
      isGrouped,
    };
  }, [
    database.rows,
    database.properties,
    filters,
    sorts,
    searchQuery,
    groupByProperty,
  ]);

  return result as FilteredDataResult;
}
