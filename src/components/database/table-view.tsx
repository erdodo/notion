'use client';

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DatabaseRow, Cell, Page } from '@prisma/client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

import { AddPropertyButton } from './add-property-button';
import { AddRowButton } from './add-row-button';
import { CalculationCell } from './calculation-cell';
import { CellRenderer } from './cell-renderer';
import { CellProperties as BaseCellProperties } from './cells/types';
import { PropertyConfigDialog } from './property-config-dialog';
import { PropertyHeader } from './property-header';
import { GroupSection } from './shared/group-section';

import {
  updateCellByPosition,
  addRow,
  updateProperty,
} from '@/app/(main)/_actions/database';
import { cn } from '@/lib/utils';
import { useContextMenu } from '@/hooks/use-context-menu';
import { useDatabase } from '@/hooks/use-database';
import {
  useFilteredSortedData,
  FilteredDataResult,
} from '@/hooks/use-filtered-sorted-data';
import { useOptimisticDatabase } from '@/hooks/use-optimistic-database';
import { DetailedDatabase } from '@/hooks/use-optimistic-database';

type DetailedRow = DatabaseRow & {
  cells: Cell[];
  page: Page | null;
  depth?: number;
  hasChildren?: boolean;
};

interface TableViewProperties {
  database: DetailedDatabase;
}

export function TableView({ database: initialDatabase }: TableViewProperties) {
  const {
    database,
    updateCell,
    addRow: addOptimisticRow,
    updateProperty: optimisticUpdateProperty,
  } = useOptimisticDatabase(initialDatabase as DetailedDatabase);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [configDialog, setConfigDialog] = useState<{
    propertyId: string;
    type: 'relation' | 'rollup' | 'formula' | 'select';
  } | null>(null);

  const { focusedCell, setFocusedCell, setEditingCell, editingCell } =
    useDatabase();
  const tableContainerReference = useRef<HTMLDivElement>(null);

  const { sortedRows, groupedRows, isGrouped } = useFilteredSortedData(
    database
  ) as unknown as FilteredDataResult;

  const data = useMemo(() => {
    return sortedRows.map((row) => {
      return row as DetailedRow;
    });
  }, [sortedRows]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const visibleData = useMemo(() => {
    if (isGrouped) return data;

    const visible: DetailedRow[] = [];

    let skipUntilDepth = Infinity;

    data.forEach((row) => {
      const rowDepth = row.depth ?? 0;

      if (rowDepth > skipUntilDepth) {
        return;
      }

      if (rowDepth <= skipUntilDepth) {
        skipUntilDepth = Infinity;
      }

      visible.push(row);

      if (row.hasChildren && !expanded.has(row.id)) {
        skipUntilDepth = rowDepth;
      }
    });
    return visible;
  }, [data, expanded, isGrouped]);

  const columns: any = useMemo<ColumnDef<DetailedRow>[]>(() => {
    const indexColumn: ColumnDef<DetailedRow> = {
      id: 'index',
      header: () => (
        <div className="w-full text-center text-muted-foreground text-[10px] font-normal">
          #
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-[30px] flex items-center justify-center text-muted-foreground text-[10px] select-none">
          {row.index + 1}
        </div>
      ),
      size: 40,
      enableResizing: false,
    };

    const propertyColumns: any = database.properties.map((property, index) => ({
      accessorKey: property.id,
      header: ({
        column,
      }: any) => (
        <PropertyHeader
          property={property as any}
          column={column}
          databaseId={database.id}
          allProperties={database.properties}
          onPropertyUpdate={optimisticUpdateProperty}
          onEditProperty={(id, type) => {
            setConfigDialog({ propertyId: id, type });
          }}
        />
      ),
      cell: ({ getValue, row, column, table, cell }: any) => {
        const updateValue = (value: unknown) => {
          updateCell(row.original.id, property.id, value);

          updateCellByPosition(property.id, row.original.id, value);
        };

        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell?.propertyId === property.id;

        const startEditing = () => {
          setEditingCell({
            rowId: row.original.id,
            propertyId: property.id,
          });
        };

        const stopEditing = () => {
          setEditingCell(null);
        };

        const properties = {
          getValue,
          rowId: row.original.id,
          propertyId: property.id,
          table,
          column,
          cell,
          updateValue,
          row,
          onPropertyUpdate: optimisticUpdateProperty,
          isFirstColumn: index === 0,
          depth: row.original.depth,
          hasChildren: row.original.hasChildren,
          isExpanded: expanded.has(row.original.id),
          onToggle: () => {
            toggleRow(row.original.id);
          },
          isFocused:
            focusedCell?.rowId === row.original.id &&
            focusedCell?.propertyId === property.id,
        };

        return (
          <CellWrapper
            {...properties}
            isEditing={isEditing}
            startEditing={startEditing}
            stopEditing={stopEditing}
          />
        );
      },
      footer: ({ table: footerTable }: any) => (
        <CalculationCell
          property={property}
          rows={footerTable.getFilteredRowModel().rows}
        />
      ),
      meta: {
        property: property,
        getPageId: () => null,
      },
      enableSorting: true,
      size: property.width || 200,
    }));

    return [indexColumn, ...propertyColumns];
  }, [
    database.properties,
    database.id,
    expanded,
    updateCell,
    optimisticUpdateProperty,
    editingCell,
    focusedCell,
    setEditingCell,
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table: any = useReactTable({
    data: visibleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
    },
    columnResizeMode: 'onChange',
    getRowId: (row) => row.id,
  });

  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = 33;
  const _containerHeight = 600;

  const [containerH, setContainerH] = useState(600);

  useEffect(() => {
    if (!tableContainerReference.current) return;
    const element = tableContainerReference.current;
    const onScroll = () => {
      setScrollTop(element.scrollTop);
    };
    const onResize = () => {
      setContainerH(element.clientHeight);
    };

    element.addEventListener('scroll', onScroll);

    setContainerH(element.clientHeight);
    setScrollTop(element.scrollTop);

    window.addEventListener('resize', onResize);

    return () => {
      element.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const totalRows = table.getRowModel().rows.length;
  const _totalHeight = totalRows * rowHeight;

  const overscan = 5;
  let startIndex = Math.floor(scrollTop / rowHeight) - overscan;
  startIndex = Math.max(0, startIndex);

  let endIndex = Math.floor((scrollTop + containerH) / rowHeight) + overscan;
  endIndex = Math.min(totalRows, endIndex);

  const virtualRows = [];
  for (let index = startIndex; index < endIndex; index++) {
    virtualRows.push({ index: index });
  }

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (totalRows - endIndex) * rowHeight;

  const handleAddRow = useCallback(async () => {
    const temporaryId = crypto.randomUUID();
    const newRow: DetailedRow = {
      id: temporaryId,
      databaseId: database.id,
      pageId: null,
      parentRowId: null,
      order: database.rows.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      cells: [],
      page: null,
    };
    addOptimisticRow(newRow);

    if (database.properties.length > 0) {
      setFocusedCell({
        rowId: temporaryId,
        propertyId: database.properties[0].id,
      });
    }

    await addRow(database.id);
  }, [
    database.id,
    database.rows.length,
    database.properties,
    addOptimisticRow,
    setFocusedCell,
  ]);

  useEffect(() => {
    const handleAddEvent = () => handleAddRow();
    globalThis.addEventListener('database-add-row', handleAddEvent);
    return () => {
      globalThis.removeEventListener('database-add-row', handleAddEvent);
    };
  }, [handleAddRow]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell) return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentRowIndex = table
        .getRowModel()
        .rows.findIndex((r: any) => r.id === focusedCell.rowId);
      const currentPropertyIndex = database.properties.findIndex(
        (p) => p.id === focusedCell.propertyId
      );

      if (currentRowIndex === -1 || currentPropertyIndex === -1) return;

      let nextRowIndex = currentRowIndex;
      let nextPropertyIndex = currentPropertyIndex;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          nextRowIndex = Math.max(0, currentRowIndex - 1);

          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          nextRowIndex = Math.min(
            table.getRowModel().rows.length - 1,
            currentRowIndex + 1
          );

          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          nextPropertyIndex = Math.max(0, currentPropertyIndex - 1);

          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          nextPropertyIndex = Math.min(
            database.properties.length - 1,
            currentPropertyIndex + 1
          );

          break;
        }
        case 'Enter': {
          e.preventDefault();
          setEditingCell({
            rowId: focusedCell.rowId,
            propertyId: focusedCell.propertyId,
          });
          return;
        }
        default: {
          return;
        }
      }

      const nextRow = table.getRowModel().rows[nextRowIndex];
      const nextProperty = database.properties[nextPropertyIndex];

      if (nextRow && nextProperty) {
        setFocusedCell({ rowId: nextRow.id, propertyId: nextProperty.id });
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedCell, database.properties, table, setEditingCell, setFocusedCell]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = database.properties.findIndex((p) => p.id === active.id);
      const newIndex = database.properties.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // TODO: Implement column reordering
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext
      id="table-view-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full flex-1 flex flex-col h-full overflow-hidden">
        <div className="border border-border/50 rounded-sm overflow-hidden flex flex-col max-h-full">
          <div className="w-max min-w-full flex flex-col">
            <div className="sticky top-0 z-10 bg-background shadow-sm flex min-w-full border-b border-border/50">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <div
                  key={headerGroup.id}
                  className="flex min-w-full hover:bg-transparent"
                >
                  <SortableContext
                    items={database.properties.map((p) => p.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header: any) => {
                      return <SortableHead key={header.id} header={header} />;
                    })}
                  </SortableContext>
                  <div className="w-[50px] p-0 border-l border-border/50 bg-secondary/30 flex-shrink-0">
                    <div className="flex items-center justify-center h-full">
                      <AddPropertyButton databaseId={database.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col min-w-full">
              {isGrouped ? (
                groupedRows.map((group) => (
                  <GroupSection
                    key={group.groupKey}
                    group={group}
                    table={table}
                    columns={columns}
                  />
                ))
              ) : table.getRowModel().rows?.length ? (
                <>
                  {paddingTop > 0 && (
                    <div
                      style={{ height: `${paddingTop}px` }}
                      className="w-full"
                    />
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <div
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="group h-[33px] flex hover:bg-muted/50 transition-colors border-b border-border/50 min-w-full"
                      >
                        {row.getVisibleCells().map((cell: any) => (
                          <div
                            key={cell.id}
                            className="p-0 border-r border-border/50 last:border-r-0 relative flex-shrink-0"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        ))}
                        <div className="border-l border-border/50 bg-transparent p-0 flex-1 min-w-[50px]">
                          <div className="h-full w-full" />
                        </div>
                      </div>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <div
                      style={{ height: `${paddingBottom}px` }}
                      className="w-full"
                    />
                  )}
                </>
              ) : (
                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm w-full border-b border-border/50">
                  No entries.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm sticky bottom-0 z-10 w-full">
          <AddRowButton databaseId={database.id} onAdd={handleAddRow} />
        </div>
      </div>

      <PropertyConfigDialog
        databaseId={database.id}
        isOpen={!!configDialog}
        onOpenChange={(open) => !open && setConfigDialog(null)}
        configType={configDialog?.type || null}
        property={
          configDialog
            ? database.properties.find((p) => p.id === configDialog.propertyId)
            : undefined
        }
        allProperties={database.properties}
        onPropertyUpdate={optimisticUpdateProperty}
      />
    </DndContext>
  );
}

function SortableHead({
  header,
}: {
  header: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition,
    width: header.getSize(),
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'h-9 px-0 border-r border-border/50 last:border-r-0 relative group bg-secondary/30 select-none text-xs font-normal text-muted-foreground flex items-center flex-shrink-0',
        isDragging && 'bg-secondary/50'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="w-full px-3 text-left truncate">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
      {}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          header.getResizeHandler()(e);
          const onMouseUp = () => {
            setTimeout(() => {
              const width = header.column.getSize();
              updateProperty(header.column.id, { width });
            }, 0);
            document.removeEventListener('mouseup', onMouseUp);
          };
          document.addEventListener('mouseup', onMouseUp);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          header.getResizeHandler()(e);
          const onTouchEnd = () => {
            setTimeout(() => {
              const width = header.column.getSize();
              updateProperty(header.column.id, { width });
            }, 0);
            document.removeEventListener('touchend', onTouchEnd);
          };
          document.addEventListener('touchend', onTouchEnd);
        }}
        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/50 opacity-0 group-hover:opacity-100 z-10 ${
          header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
        }`}
        style={{
          transform: 'translateX(50%)',
        }}
      />
    </div>
  );
}

interface CellWrapperProps {
  isFirstColumn: boolean;
  depth?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  getValue: any;
  rowId: any;
  propertyId: any;
  table: any;
  column: any;
  cell?: any;
  updateValue: any;
  row: any;
  onPropertyUpdate: any;
}

function CellWrapper({
  getValue,
  rowId,
  propertyId,
  table,
  column,
  cell: cellProp,
  updateValue,
  row,
  onPropertyUpdate,
  ...properties
}: any) {
  const { focusedCell, setFocusedCell, editingCell, setEditingCell } =
    useDatabase();

  const isFocused =
    focusedCell?.rowId === rowId && focusedCell?.propertyId === propertyId;
  const isEditing =
    editingCell?.rowId === rowId && editingCell?.propertyId === propertyId;

  const startEditing = useCallback(() => {
    setEditingCell({ rowId, propertyId });
    setFocusedCell({ rowId, propertyId });
  }, [rowId, propertyId, setEditingCell, setFocusedCell]);

  const stopEditing = useCallback(() => {
    setEditingCell(null);

    setFocusedCell({ rowId, propertyId });
  }, [rowId, propertyId, setEditingCell, setFocusedCell]);

  const { onContextMenu, onTouchStart, onTouchEnd, onTouchMove } =
    useContextMenu({
      type: 'database-cell',
      data: {
        rowId,
        pageId: (row as any).original.pageId || (row as any).original.originalRow?.pageId,
        propertyId,
        value: getValue(),
      },
    });

  return (
    <div
      className={cn(
        'w-full h-full min-h-[32px] relative outline-none flex items-center',
        isFocused && !isEditing && 'z-10'
      )}
      onClick={() => {
        if (!isEditing) {
          setFocusedCell({ rowId, propertyId });
        }
      }}
      onDoubleClick={() => {
        startEditing();
      }}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {}
      {properties.isFirstColumn && (
        <div
          className="flex items-center"
          style={{ paddingLeft: `${(properties.depth || 0) * 24}px` }}
        >
          {properties.hasChildren ? (
            <div
              role="button"
              className="w-5 h-5 flex items-center justify-center mr-1 hover:bg-muted rounded text-muted-foreground transition-colors cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation();
                if (properties.onToggle) properties.onToggle();
              }}
            >
              {properties.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          ) : (
            <div className="w-6" />
          )}
        </div>
      )}

      {isFocused && !isEditing && (
        <div className="absolute inset-0 ring-2 ring-primary pointer-events-none z-10" />
      )}

      <div className="flex-1 min-w-0">
        <CellRenderer
          getValue={getValue}
          rowId={rowId}
          propertyId={propertyId}
          table={table}
          column={column}
          cell={cellProp}
          isEditing={isEditing}
          startEditing={startEditing}
          stopEditing={stopEditing}
          updateValue={updateValue}
          row={row}
          onPropertyUpdate={onPropertyUpdate}
        />
      </div>
    </div>
  );
}
