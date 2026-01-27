import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FilterOperator =
  | 'is'
  | 'is_not'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_checked'
  | 'is_unchecked'
  | 'before'
  | 'after'
  | 'is_on_or_before'
  | 'is_on_or_after'
  | 'is_today'
  | 'is_tomorrow'
  | 'is_yesterday'
  | 'is_one_week_ago'
  | 'is_one_month_ago';

export type SortDirection = 'asc' | 'desc';

export interface FilterRule {
  id: string;
  propertyId: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface SortRule {
  id: string;
  propertyId: string;
  direction: SortDirection;
}

export type ViewType =
  | 'table'
  | 'list'
  | 'board'
  | 'calendar'
  | 'gallery'
  | 'timeline';

interface ViewConfig {
  id: string;
  type: string;
  filter?: FilterRule[] | null;
  sort?: SortRule[] | null;
  group?: { propertyId: string } | null;
  hiddenProperties?: string[] | null;
  database?: {
    properties: { id: string }[];
  };
}

interface DatabaseState {
  filters: FilterRule[];
  addFilter: (filter: FilterRule) => void;
  updateFilter: (index: number, filter: FilterRule) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;

  sorts: SortRule[];
  addSort: (sort: SortRule) => void;
  updateSort: (index: number, sort: SortRule) => void;
  removeSort: (index: number) => void;
  clearSorts: () => void;

  groupByProperty: string | null;
  setGroupByProperty: (propertyId: string | null) => void;

  selectedRows: string[];
  selectRow: (rowId: string) => void;
  deselectRow: (rowId: string) => void;
  toggleRow: (rowId: string) => void;
  selectAll: (rowIds: string[]) => void;
  deselectAll: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  editingCell: { propertyId: string; rowId: string } | null;
  setEditingCell: (cell: { propertyId: string; rowId: string } | null) => void;

  focusedCell: { propertyId: string; rowId: string } | null;
  setFocusedCell: (cell: { propertyId: string; rowId: string } | null) => void;

  currentViewId: string | null;
  setCurrentViewId: (id: string | null) => void;

  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  setFromView: (view: ViewConfig) => void;

  updateView: (view: ViewConfig) => void;

  hiddenProperties: string[];
  setHiddenProperties: (propertyIds: string[]) => void;

  boardGroupByProperty: string | null;
  setBoardGroupByProperty: (propertyId: string | null) => void;
  boardHiddenGroups: string[];
  toggleBoardGroup: (optionId: string) => void;

  calendarDateProperty: string | null;
  setCalendarDateProperty: (propertyId: string | null) => void;
  calendarView: 'month' | 'week';
  setCalendarView: (view: 'month' | 'week') => void;
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;

  galleryCardSize: 'small' | 'medium' | 'large';
  setGalleryCardSize: (size: string) => void;
  galleryColumns: number;
  setGalleryColumns: (columns: number) => void;
  galleryCoverProperty: string | null;
  setGalleryCoverProperty: (propertyId: string | null) => void;
  galleryFitImage: boolean;
  toggleGalleryFitImage: () => void;

  visibleProperties: string[];
  togglePropertyVisibility: (propertyId: string) => void;

  selectedRowId: string | null;
  setSelectedRowId: (rowId: string | null) => void;

  openMode: 'side' | 'center';
  setOpenMode: (mode: 'side' | 'center') => void;

  pageOpenMode: 'current' | 'new-tab' | 'dialog' | 'drawer';
  setPageOpenMode: (mode: 'current' | 'new-tab' | 'dialog' | 'drawer') => void;

  timelineDateProperty: string | null;
  setTimelineDateProperty: (propertyId: string | null) => void;
  timelineGroupByProperty: string | null;
  setTimelineGroupByProperty: (propertyId: string | null) => void;
  timelineScale: 'day' | 'week' | 'month' | 'year';
  setTimelineScale: (scale: 'day' | 'week' | 'month' | 'year') => void;

  timelineDependencyProperty: string | null;
  setTimelineDependencyProperty: (propertyId: string | null) => void;
}

export const useDatabase = create<DatabaseState>()(
  persist(
    (set) => ({
      filters: [],
      addFilter: (filter) =>
        set((state) => ({ filters: [...state.filters, filter] })),
      updateFilter: (index, filter) =>
        set((state) => {
          const newFilters = [...state.filters];
          newFilters[index] = filter;
          return { filters: newFilters };
        }),
      removeFilter: (index) =>
        set((state) => ({
          filters: state.filters.filter((_, index_) => index_ !== index),
        })),
      clearFilters: () => set({ filters: [] }),

      sorts: [],
      updateView: (view: ViewConfig) =>
        set({
          filters: view.filter || [],
          sorts: view.sort || [],
          groupByProperty: view.group?.propertyId || null,
          visibleProperties:
            view.hiddenProperties && view.database?.properties
              ? view.database.properties
                  .map((p) => p.id)
                  .filter((id) => !view.hiddenProperties?.includes(id))
              : [],
        }),

      hiddenProperties: [],
      setHiddenProperties: (propertyIds) =>
        set({ hiddenProperties: propertyIds }),

      addSort: (sort) => set((state) => ({ sorts: [...state.sorts, sort] })),
      updateSort: (index, sort) =>
        set((state) => {
          const newSorts = [...state.sorts];
          newSorts[index] = sort;
          return { sorts: newSorts };
        }),
      removeSort: (index) =>
        set((state) => ({
          sorts: state.sorts.filter((_, index_) => index_ !== index),
        })),
      clearSorts: () => set({ sorts: [] }),

      groupByProperty: null,
      setGroupByProperty: (propertyId) => set({ groupByProperty: propertyId }),

      selectedRows: [],
      selectRow: (rowId) =>
        set((state) => ({ selectedRows: [...state.selectedRows, rowId] })),
      deselectRow: (rowId) =>
        set((state) => ({
          selectedRows: state.selectedRows.filter((id) => id !== rowId),
        })),
      toggleRow: (rowId) =>
        set((state) => {
          const isSelected = state.selectedRows.includes(rowId);
          return {
            selectedRows: isSelected
              ? state.selectedRows.filter((id) => id !== rowId)
              : [...state.selectedRows, rowId],
          };
        }),
      selectAll: (rowIds) => set({ selectedRows: rowIds }),
      deselectAll: () => set({ selectedRows: [] }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      editingCell: null,
      setEditingCell: (cell) => set({ editingCell: cell }),

      focusedCell: null,
      setFocusedCell: (cell) => set({ focusedCell: cell }),

      currentViewId: null,
      setCurrentViewId: (id) => set({ currentViewId: id }),

      currentView: 'table',
      setCurrentView: (view) => set({ currentView: view }),

      setFromView: (view: ViewConfig) =>
        set({
          currentViewId: view.id,
          currentView: view.type.toLowerCase() as ViewType,
          filters: view.filter || [],
          sorts: view.sort || [],
          groupByProperty: view.group?.propertyId || null,
          visibleProperties:
            view.hiddenProperties && view.database?.properties
              ? view.database.properties
                  .map((p) => p.id)
                  .filter((id) => !view.hiddenProperties?.includes(id))
              : [],
        }),

      boardGroupByProperty: null,
      setBoardGroupByProperty: (propertyId) =>
        set({ boardGroupByProperty: propertyId }),
      boardHiddenGroups: [],
      toggleBoardGroup: (optionId) =>
        set((state) => {
          const isHidden = state.boardHiddenGroups.includes(optionId);
          return {
            boardHiddenGroups: isHidden
              ? state.boardHiddenGroups.filter((id) => id !== optionId)
              : [...state.boardHiddenGroups, optionId],
          };
        }),

      calendarDateProperty: null,
      setCalendarDateProperty: (propertyId) =>
        set({ calendarDateProperty: propertyId }),
      calendarView: 'month',
      setCalendarView: (view) => set({ calendarView: view }),
      calendarDate: new Date(),
      setCalendarDate: (date) => set({ calendarDate: date }),

      galleryCardSize: 'medium',
      setGalleryCardSize: (size) =>
        set({ galleryCardSize: size as 'small' | 'medium' | 'large' }),
      galleryColumns: 4,
      setGalleryColumns: (columns) => set({ galleryColumns: columns }),
      galleryCoverProperty: null,
      setGalleryCoverProperty: (propertyId) =>
        set({ galleryCoverProperty: propertyId }),
      galleryFitImage: false,
      toggleGalleryFitImage: () =>
        set((state) => ({ galleryFitImage: !state.galleryFitImage })),

      visibleProperties: [],
      togglePropertyVisibility: (propertyId) =>
        set((state) => {
          const isVisible = state.visibleProperties.includes(propertyId);
          return {
            visibleProperties: isVisible
              ? state.visibleProperties.filter((id) => id !== propertyId)
              : [...state.visibleProperties, propertyId],
          };
        }),

      selectedRowId: null,
      setSelectedRowId: (id) => set({ selectedRowId: id }),

      openMode: 'center',
      setOpenMode: (mode) => set({ openMode: mode }),

      pageOpenMode: 'current',
      setPageOpenMode: (mode) => set({ pageOpenMode: mode }),

      timelineDateProperty: null,
      setTimelineDateProperty: (propertyId) =>
        set({ timelineDateProperty: propertyId }),
      timelineGroupByProperty: null,
      setTimelineGroupByProperty: (propertyId) =>
        set({ timelineGroupByProperty: propertyId }),
      timelineScale: 'month',
      setTimelineScale: (scale) => set({ timelineScale: scale }),

      timelineDependencyProperty: null,
      setTimelineDependencyProperty: (propertyId) =>
        set({ timelineDependencyProperty: propertyId }),
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
        galleryColumns: state.galleryColumns,
        galleryCoverProperty: state.galleryCoverProperty,
        galleryFitImage: state.galleryFitImage,
        timelineDateProperty: state.timelineDateProperty,
        timelineGroupByProperty: state.timelineGroupByProperty,
        timelineScale: state.timelineScale,
        timelineDependencyProperty: state.timelineDependencyProperty,
        openMode: state.openMode,
        pageOpenMode: state.pageOpenMode,
      }),
    }
  )
);
