
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilterOperator =
    | 'is' | 'is_not' | 'contains' | 'not_contains'
    | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty'
    | 'is_checked' | 'is_unchecked'
    | 'before' | 'after' | 'is_on_or_before' | 'is_on_or_after'
    | 'is_today' | 'is_tomorrow' | 'is_yesterday' | 'is_one_week_ago' | 'is_one_month_ago'

export type SortDirection = 'asc' | 'desc'

export interface FilterRule {
    id: string
    propertyId: string
    operator: FilterOperator
    value?: any
}

export interface SortRule {
    id: string
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

    // Grouping
    groupByProperty: string | null
    setGroupByProperty: (propertyId: string | null) => void

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

    // Focus State
    focusedCell: { propertyId: string, rowId: string } | null
    setFocusedCell: (cell: { propertyId: string, rowId: string } | null) => void

    // View State
    currentView: 'table' | 'list' | 'board' | 'calendar' | 'gallery'
    setCurrentView: (view: 'table' | 'list' | 'board' | 'calendar' | 'gallery') => void

    // Board View Configuration
    boardGroupByProperty: string | null
    setBoardGroupByProperty: (propertyId: string | null) => void
    boardHiddenGroups: string[]
    toggleBoardGroup: (optionId: string) => void

    // Calendar View Configuration
    calendarDateProperty: string | null
    setCalendarDateProperty: (propertyId: string | null) => void
    calendarView: 'month' | 'week'
    setCalendarView: (view: 'month' | 'week') => void
    calendarDate: Date
    setCalendarDate: (date: Date) => void

    // Gallery View Configuration
    galleryCardSize: 'small' | 'medium' | 'large'
    setGalleryCardSize: (size: string) => void
    galleryCoverProperty: string | null
    setGalleryCoverProperty: (propertyId: string | null) => void
    galleryFitImage: boolean
    toggleGalleryFitImage: () => void

    // Shared Card Configuration
    visibleProperties: string[]
    togglePropertyVisibility: (propertyId: string) => void

    // UI Interactions
    selectedRowId: string | null
    setSelectedRowId: (rowId: string | null) => void // Side Peek or Center Peek

    openMode: 'side' | 'center'
    setOpenMode: (mode: 'side' | 'center') => void
}



export const useDatabase = create<DatabaseState>()(
    persist(
        (set) => ({
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

            groupByProperty: null,
            setGroupByProperty: (propertyId) => set({ groupByProperty: propertyId }),

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

            focusedCell: null,
            setFocusedCell: (cell) => set({ focusedCell: cell }),

            // View State Initial Values
            currentView: 'table',
            setCurrentView: (view) => set({ currentView: view }),

            boardGroupByProperty: null,
            setBoardGroupByProperty: (propertyId) => set({ boardGroupByProperty: propertyId }),
            boardHiddenGroups: [],
            toggleBoardGroup: (optionId) => set((state) => {
                const isHidden = state.boardHiddenGroups.includes(optionId)
                return {
                    boardHiddenGroups: isHidden
                        ? state.boardHiddenGroups.filter(id => id !== optionId)
                        : [...state.boardHiddenGroups, optionId]
                }
            }),

            calendarDateProperty: null,
            setCalendarDateProperty: (propertyId) => set({ calendarDateProperty: propertyId }),
            calendarView: 'month',
            setCalendarView: (view) => set({ calendarView: view }),
            calendarDate: new Date(),
            setCalendarDate: (date) => set({ calendarDate: date }),

            galleryCardSize: 'medium',
            setGalleryCardSize: (size) => set({ galleryCardSize: size as any }),
            galleryCoverProperty: null,
            setGalleryCoverProperty: (propertyId) => set({ galleryCoverProperty: propertyId }),
            galleryFitImage: false,
            toggleGalleryFitImage: () => set((state) => ({ galleryFitImage: !state.galleryFitImage })),

            visibleProperties: [],
            togglePropertyVisibility: (propertyId) => set((state) => {
                const isVisible = state.visibleProperties.includes(propertyId)
                return {
                    visibleProperties: isVisible
                        ? state.visibleProperties.filter(id => id !== propertyId)
                        : [...state.visibleProperties, propertyId]
                }
            }),

            selectedRowId: null,
            setSelectedRowId: (id) => set({ selectedRowId: id }),

            openMode: 'center',
            setOpenMode: (mode) => set({ openMode: mode }),
        }),
        {
            name: 'database-storage',
            partialize: (state) => ({
                filters: state.filters,
                sorts: state.sorts,
                groupByProperty: state.groupByProperty,
                currentView: state.currentView,
                visibleProperties: state.visibleProperties,
                boardGroupByProperty: state.boardGroupByProperty,
                boardHiddenGroups: state.boardHiddenGroups,
                calendarDateProperty: state.calendarDateProperty,
                calendarView: state.calendarView,
                galleryCardSize: state.galleryCardSize,
                galleryCoverProperty: state.galleryCoverProperty,
                galleryFitImage: state.galleryFitImage,
                openMode: state.openMode
            }),
        }
    )
)
