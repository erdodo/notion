import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '@/hooks/use-search'
import { useSidebar } from '@/hooks/use-sidebar'
import { useSettings } from '@/hooks/use-settings'
import { useOrigin } from '@/hooks/use-origin'
import { useFilteredSortedData, DetailedDatabase } from '@/hooks/use-filtered-sorted-data'
import { useDatabase } from '@/hooks/use-database'
import { PropertyType } from '@prisma/client'
import { vi } from 'vitest'

describe('Zustand Hooks', () => {
    describe('useSearch', () => {
        beforeEach(() => {
            act(() => useSearch.getState().onClose())
        })

        it('should have initial state isOpen false', () => {
            const { result } = renderHook(() => useSearch())
            expect(result.current.isOpen).toBe(false)
        })

        it('should open and close', () => {
            const { result } = renderHook(() => useSearch())
            act(() => result.current.onOpen())
            expect(result.current.isOpen).toBe(true)
            act(() => result.current.onClose())
            expect(result.current.isOpen).toBe(false)
        })

        it('should toggle', () => {
            const { result } = renderHook(() => useSearch())
            act(() => result.current.toggle())
            expect(result.current.isOpen).toBe(true)
            act(() => result.current.toggle())
            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('useSidebar', () => {
        it('should handle sidebar state', () => {
            const { result } = renderHook(() => useSidebar())
            act(() => result.current.collapse())
            expect(result.current.isCollapsed).toBe(true)
            act(() => result.current.expand())
            expect(result.current.isCollapsed).toBe(false)
        })
    })

    describe('useSettings', () => {
        beforeEach(() => {
            act(() => useSettings.getState().onClose())
        })

        it('should handle settings modal', () => {
            const { result } = renderHook(() => useSettings())
            expect(result.current.isOpen).toBe(false)
            act(() => result.current.onOpen())
            expect(result.current.isOpen).toBe(true)
        })
    })
})

describe('Utility Hooks', () => {
    describe('useOrigin', () => {
        it('should return empty string on server side and window.location.origin on client side', () => {
            // In jsdom environment, window is defined
            const { result } = renderHook(() => useOrigin())
            expect(result.current).toBe(typeof window !== 'undefined' ? window.location.origin : '')
        })
    })
})

describe('Complex Hooks', () => {
    const mockDatabase: DetailedDatabase = {
        id: 'db-1',
        title: 'Test DB',
        description: null,
        icon: null,
        cover: null,
        parentDocumentId: 'doc-1',
        workspaceId: 'ws-1',
        layout: 'TABLE',
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        properties: [
            { id: 'p1', name: 'Name', type: 'TEXT', databaseId: 'db-1', config: {}, createdAt: new Date(), updatedAt: new Date() },
            { id: 'p2', name: 'Status', type: 'SELECT', databaseId: 'db-1', config: {}, createdAt: new Date(), updatedAt: new Date() },
        ],
        rows: [
            {
                id: 'r1', databaseId: 'db-1', parentRowId: null, createdAt: new Date(), updatedAt: new Date(),
                cells: [
                    { id: 'c1', rowId: 'r1', propertyId: 'p1', value: 'Task 1', createdAt: new Date(), updatedAt: new Date() },
                    { id: 'c2', rowId: 'r1', propertyId: 'p2', value: 'Done', createdAt: new Date(), updatedAt: new Date() },
                ],
                page: null
            },
            {
                id: 'r2', databaseId: 'db-1', parentRowId: null, createdAt: new Date(), updatedAt: new Date(),
                cells: [
                    { id: 'c3', rowId: 'r2', propertyId: 'p1', value: 'Task 2', createdAt: new Date(), updatedAt: new Date() },
                    { id: 'c4', rowId: 'r2', propertyId: 'p2', value: 'To Do', createdAt: new Date(), updatedAt: new Date() },
                ],
                page: null
            }
        ]
    }

    it('useFilteredSortedData should return all rows by default', () => {
        const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
        expect(result.current.sortedRows).toHaveLength(2)
        expect(result.current.isGrouped).toBe(false)
    })

    it('useFilteredSortedData should filter rows', () => {
        act(() => {
            useDatabase.getState().clearFilters()
            useDatabase.getState().addFilter({ id: 'f1', propertyId: 'p2', operator: 'is', value: 'Done' })
        })
        const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
        expect(result.current.sortedRows).toHaveLength(1)
        expect(result.current.sortedRows[0].id).toBe('r1')
    })

    it('useFilteredSortedData should search rows', () => {
        act(() => {
            useDatabase.getState().clearFilters()
            useDatabase.getState().setSearchQuery('Task 2')
        })
        const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
        expect(result.current.sortedRows).toHaveLength(1)
        expect(result.current.sortedRows[0].id).toBe('r2')
    })

    it('useFilteredSortedData should sort rows', () => {
        act(() => {
            useDatabase.getState().setSearchQuery('')
            useDatabase.getState().clearSorts()
            useDatabase.getState().addSort({ id: 's1', propertyId: 'p1', direction: 'desc' })
        })
        const { result } = renderHook(() => useFilteredSortedData(mockDatabase))
        expect(result.current.sortedRows[0].id).toBe('r2') // Task 2 comes before Task 1 in desc
    })
})
