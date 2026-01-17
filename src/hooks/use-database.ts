
import { create } from 'zustand'

export type FilterOperator = 'is' | 'is_not' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty'
export type SortDirection = 'asc' | 'desc'

export interface FilterRule {
    propertyId: string
    operator: FilterOperator
    value?: any
}

export interface SortRule {
    propertyId: string
    direction: SortDirection
}

interface DatabaseState {
    // Filters
    filters: FilterRule[]
    addFilter: (filter: FilterRule) => void
    updateFilter: (index: number, filter: FilterRule) => void
    removeFilter: (index: number) => void
    clearFilters: () => void

    // Sorts
    sorts: SortRule[]
    addSort: (sort: SortRule) => void
    updateSort: (index: number, sort: SortRule) => void
    removeSort: (index: number) => void
    clearSorts: () => void

    // Selection
    selectedRows: string[]
    selectRow: (rowId: string) => void
    deselectRow: (rowId: string) => void
    toggleRow: (rowId: string) => void
    selectAll: (rowIds: string[]) => void
    deselectAll: () => void

    // Search
    searchQuery: string
    setSearchQuery: (query: string) => void

    // UI State
    editingCell: { propertyId: string, rowId: string } | null
    setEditingCell: (cell: { propertyId: string, rowId: string } | null) => void
}

export const useDatabase = create<DatabaseState>((set) => ({
    filters: [],
    addFilter: (filter) => set((state) => ({ filters: [...state.filters, filter] })),
    updateFilter: (index, filter) => set((state) => {
        const newFilters = [...state.filters]
        newFilters[index] = filter
        return { filters: newFilters }
    }),
    removeFilter: (index) => set((state) => ({
        filters: state.filters.filter((_, i) => i !== index)
    })),
    clearFilters: () => set({ filters: [] }),

    sorts: [],
    addSort: (sort) => set((state) => ({ sorts: [...state.sorts, sort] })),
    updateSort: (index, sort) => set((state) => {
        const newSorts = [...state.sorts]
        newSorts[index] = sort
        return { sorts: newSorts }
    }),
    removeSort: (index) => set((state) => ({
        sorts: state.sorts.filter((_, i) => i !== index)
    })),
    clearSorts: () => set({ sorts: [] }),

    selectedRows: [],
    selectRow: (rowId) => set((state) => ({ selectedRows: [...state.selectedRows, rowId] })),
    deselectRow: (rowId) => set((state) => ({
        selectedRows: state.selectedRows.filter(id => id !== rowId)
    })),
    toggleRow: (rowId) => set((state) => {
        const isSelected = state.selectedRows.includes(rowId)
        return {
            selectedRows: isSelected
                ? state.selectedRows.filter(id => id !== rowId)
                : [...state.selectedRows, rowId]
        }
    }),
    selectAll: (rowIds) => set({ selectedRows: rowIds }),
    deselectAll: () => set({ selectedRows: [] }),

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    editingCell: null,
    setEditingCell: (cell) => set({ editingCell: cell }),
}))
