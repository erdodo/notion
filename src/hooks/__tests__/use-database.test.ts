import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useDatabase } from '../use-database';
import type { FilterRule, SortRule } from '../use-database';

describe('useDatabase', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty filters and sorts', () => {
    const { result } = renderHook(() => useDatabase());

    expect(result.current.filters).toEqual([]);
    expect(result.current.sorts).toEqual([]);
  });

  it('should add a filter', () => {
    const { result } = renderHook(() => useDatabase());

    const filter: FilterRule = {
      id: '1',
      propertyId: 'name',
      operator: 'contains',
      value: 'test',
    };

    act(() => {
      result.current.addFilter(filter);
    });

    expect(result.current.filters).toHaveLength(1);
    expect(result.current.filters[0]).toEqual(filter);
  });

  it('should update a filter', () => {
    const { result } = renderHook(() => useDatabase());

    const filter: FilterRule = {
      id: '1',
      propertyId: 'name',
      operator: 'contains',
      value: 'test',
    };

    act(() => {
      result.current.addFilter(filter);
    });

    const updatedFilter: FilterRule = {
      id: '1',
      propertyId: 'name',
      operator: 'is',
      value: 'updated',
    };

    act(() => {
      result.current.updateFilter(0, updatedFilter);
    });

    expect(result.current.filters[0]).toEqual(updatedFilter);
  });

  it('should remove a filter', () => {
    const { result } = renderHook(() => useDatabase());

    const filter: FilterRule = {
      id: '1',
      propertyId: 'name',
      operator: 'contains',
      value: 'test',
    };

    act(() => {
      result.current.addFilter(filter);
    });

    expect(result.current.filters).toHaveLength(1);

    act(() => {
      result.current.removeFilter(0);
    });

    expect(result.current.filters).toHaveLength(0);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useDatabase());

    act(() => {
      result.current.addFilter({
        id: '1',
        propertyId: 'name',
        operator: 'contains',
        value: 'test',
      });
      result.current.addFilter({
        id: '2',
        propertyId: 'status',
        operator: 'is',
        value: 'active',
      });
    });

    expect(result.current.filters).toHaveLength(2);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toHaveLength(0);
  });

  it('should add a sort', () => {
    const { result } = renderHook(() => useDatabase());

    const sort: SortRule = {
      id: '1',
      propertyId: 'name',
      direction: 'asc',
    };

    act(() => {
      result.current.addSort(sort);
    });

    expect(result.current.sorts).toHaveLength(1);
    expect(result.current.sorts[0]).toEqual(sort);
  });

  it('should update a sort', () => {
    const { result } = renderHook(() => useDatabase());

    const sort: SortRule = {
      id: '1',
      propertyId: 'name',
      direction: 'asc',
    };

    act(() => {
      result.current.addSort(sort);
    });

    const updatedSort: SortRule = {
      id: '1',
      propertyId: 'name',
      direction: 'desc',
    };

    act(() => {
      result.current.updateSort(0, updatedSort);
    });

    expect(result.current.sorts[0]).toEqual(updatedSort);
  });

  it('should remove a sort', () => {
    const { result } = renderHook(() => useDatabase());

    const sort: SortRule = {
      id: '1',
      propertyId: 'name',
      direction: 'asc',
    };

    act(() => {
      result.current.addSort(sort);
    });

    expect(result.current.sorts).toHaveLength(1);

    act(() => {
      result.current.removeSort(0);
    });

    expect(result.current.sorts).toHaveLength(0);
  });

  it('should clear all sorts', () => {
    const { result } = renderHook(() => useDatabase());

    act(() => {
      result.current.addSort({
        id: '1',
        propertyId: 'name',
        direction: 'asc',
      });
      result.current.addSort({
        id: '2',
        propertyId: 'date',
        direction: 'desc',
      });
    });

    expect(result.current.sorts).toHaveLength(2);

    act(() => {
      result.current.clearSorts();
    });

    expect(result.current.sorts).toHaveLength(0);
  });
});
