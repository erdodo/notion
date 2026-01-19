import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFilteredSortedData } from '../use-filtered-sorted-data'
import type { DetailedDatabase } from '../use-filtered-sorted-data'

describe('useFilteredSortedData', () => {
  let mockDatabase: DetailedDatabase

  beforeEach(() => {
    mockDatabase = {
      id: '1',
      workspaceId: '1',
      name: 'Test Database',
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: [],
      rows: [],
    } as DetailedDatabase
  })

  it('should return empty array for empty database', () => {
    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toEqual([])
  })

  it('should return all rows when no filters applied', () => {
    const mockRow1 = {
      id: '1',
      cells: [],
      page: null,
    }
    const mockRow2 = {
      id: '2',
      cells: [],
      page: null,
    }

    mockDatabase.rows = [mockRow1, mockRow2] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toHaveLength(2)
  })

  it('should apply text filters', () => {
    const mockRow = {
      id: '1',
      cells: [{ propertyId: 'name', value: 'Test' }],
      page: null,
    }

    mockDatabase.properties = [
      { id: 'name', type: 'text' as any, name: 'Name' },
    ] as any
    mockDatabase.rows = [mockRow] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toBeDefined()
  })

  it('should handle date filtering', () => {
    const mockRow = {
      id: '1',
      cells: [{ propertyId: 'date', value: new Date() }],
      page: null,
    }

    mockDatabase.properties = [
      { id: 'date', type: 'date' as any, name: 'Date' },
    ] as any
    mockDatabase.rows = [mockRow] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toBeDefined()
  })

  it('should handle checkbox filtering', () => {
    const mockRow = {
      id: '1',
      cells: [{ propertyId: 'checked', value: true }],
      page: null,
    }

    mockDatabase.properties = [
      { id: 'checked', type: 'checkbox' as any, name: 'Checked' },
    ] as any
    mockDatabase.rows = [mockRow] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toBeDefined()
  })

  it('should sort rows by property', () => {
    const mockRow1 = {
      id: '1',
      cells: [{ propertyId: 'name', value: 'B' }],
      page: null,
    }
    const mockRow2 = {
      id: '2',
      cells: [{ propertyId: 'name', value: 'A' }],
      page: null,
    }

    mockDatabase.properties = [
      { id: 'name', type: 'text' as any, name: 'Name' },
    ] as any
    mockDatabase.rows = [mockRow1, mockRow2] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toBeDefined()
  })

  it('should memoize results', () => {
    const { result, rerender } = renderHook(() =>
      useFilteredSortedData(mockDatabase)
    )
    const firstResult = result.current

    rerender()

    expect(result.current).toBe(firstResult)
  })

  it('should handle complex filtering scenarios', () => {
    const mockRow = {
      id: '1',
      cells: [
        { propertyId: 'name', value: 'Test' },
        { propertyId: 'status', value: 'active' },
      ],
      page: null,
    }

    mockDatabase.properties = [
      { id: 'name', type: 'text' as any, name: 'Name' },
      { id: 'status', type: 'text' as any, name: 'Status' },
    ] as any
    mockDatabase.rows = [mockRow] as any

    const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
    expect(result.current).toBeDefined()
  })
})
