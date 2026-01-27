'use client';

import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  DatabaseView,
} from '@prisma/client';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { BoardCard } from './board-card';
import { BoardColumn } from './board-column';

import {
  addRow,
  updateCellByPosition,
  updateProperty,
} from '@/app/(main)/_actions/database';
import { useDatabase } from '@/hooks/use-database';
import {
  useFilteredSortedData,
  FilteredDataResult,
} from '@/hooks/use-filtered-sorted-data';
import { useOptimisticDatabase } from '@/hooks/use-optimistic-database';

interface BoardViewProperties {
  database: Database & {
    properties: Property[];
    rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
    views: DatabaseView[];
  };
}

interface PropertyOption {
  id: string;
  name: string;
  color: string;
  group?: string;
}

interface OptionValue {
  value: string | null;
}

export function BoardView({ database: initialDatabase }: BoardViewProperties) {
  const {
    database,
    updateCell,
    addRow: addOptimisticRow,
    addProperty: _addOptimisticProperty,
    updateProperty: _optimisticUpdateProperty,
  } = useOptimisticDatabase(initialDatabase);

  const { boardGroupByProperty } = useDatabase();

  const { sortedRows: filteredRows } = useFilteredSortedData(
    database
  ) as unknown as FilteredDataResult;

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupByProperty = useMemo(() => {
    if (!boardGroupByProperty) {
      return (
        database.properties.find((p) => p.type === 'STATUS') ||
        database.properties.find((p) => p.type === 'SELECT') ||
        null
      );
    }
    return (
      database.properties.find((p) => p.id === boardGroupByProperty) || null
    );
  }, [database.properties, boardGroupByProperty]);

  const { groups, groupedRows } = useMemo(() => {
    if (!groupByProperty) {
      return {
        groups: [{ id: 'uncategorized', title: 'No Status', color: 'gray' }],
        groupedRows: { uncategorized: filteredRows },
      };
    }

    const groupsMap: Record<string, typeof filteredRows> = {};

    if (groupByProperty.type === 'STATUS') {
      const statusGroups = [
        { id: 'todo', title: 'To Do', color: 'gray' },
        { id: 'inprogress', title: 'In Progress', color: 'blue' },
        { id: 'complete', title: 'Complete', color: 'green' },
      ];

      for (const g of statusGroups) groupsMap[g.id] = [];
      groupsMap.uncategorized = [];

      const options =
        (groupByProperty.options as unknown as PropertyOption[]) || [];

      for (const row of filteredRows) {
        const cell = row.cells.find((c) => c.propertyId === groupByProperty.id);
        const value = cell?.value;

        const optionId =
          typeof value === 'object'
            ? (value as OptionValue).value
            : (value as string);
        const option = options.find((o) => o.id === optionId);

        if (option?.group) {
          if (groupsMap[option.group]) {
            groupsMap[option.group].push(row);
          } else {
            groupsMap.uncategorized.push(row);
          }
        } else {
          if (value) {
            groupsMap.uncategorized.push(row);
          } else {
            groupsMap.todo.push(row);
          }
        }
      }

      return {
        groups: statusGroups,
        groupedRows: groupsMap,
      };
    }

    const propertyOptions =
      (groupByProperty.options as unknown as PropertyOption[]) || [];

    const uniqueGroups = new Map<
      string,
      { id: string; title: string; color: string }
    >();

    if (propertyOptions.length > 0) {
      for (const opt of propertyOptions) {
        uniqueGroups.set(opt.id, {
          id: opt.id,
          title: opt.name,
          color: opt.color,
        });
        groupsMap[opt.id] = [];
      }
    }

    groupsMap.uncategorized = [];

    for (const row of filteredRows) {
      const cell = row.cells.find((c) => c.propertyId === groupByProperty.id);
      const value = cell?.value;

      let groupId =
        typeof value === 'object'
          ? (value as OptionValue).value
          : String(value);

      if (!value) groupId = 'uncategorized';

      if (groupId !== 'uncategorized' && !groupsMap[groupId]) {
        const opt = propertyOptions.find((o) => o.id === groupId);
        if (opt) {
          uniqueGroups.set(groupId, {
            id: groupId,
            title: opt.name,
            color: opt.color,
          });
          groupsMap[groupId] = [];
        } else {
          if (!uniqueGroups.has(groupId)) {
            uniqueGroups.set(groupId, {
              id: groupId,
              title: 'Unknown',
              color: 'gray',
            });
          }
          if (!groupsMap[groupId]) groupsMap[groupId] = [];
        }
      }

      if (groupsMap[groupId]) {
        groupsMap[groupId].push(row);
      } else {
        groupsMap.uncategorized.push(row);
      }
    }

    const sortedGroups = [...uniqueGroups.values()];

    return {
      groups: [
        ...sortedGroups,
        { id: 'uncategorized', title: 'No Status', color: 'gray' },
      ],
      groupedRows: groupsMap,
    };
  }, [filteredRows, groupByProperty]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (_event: DragOverEvent) => {};

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeRowId = active.id as string;
    const overId = over.id as string;

    let targetGroupId = overId;

    const isGroupDrop = groups.some((g) => g.id === overId);

    if (!isGroupDrop) {
      const targetRow = filteredRows.find((r) => r.id === overId);
      if (targetRow) {
        if (groupByProperty?.type === 'STATUS') {
          const cell = targetRow.cells.find(
            (c) => c.propertyId === groupByProperty.id
          );
          const value = cell?.value;
          const optionId =
            typeof value === 'object'
              ? (value as OptionValue).value
              : (value as string);
          const options =
            (groupByProperty.options as unknown as PropertyOption[]) || [];
          const option = options.find((o) => o.id === optionId);
          targetGroupId = option?.group || (value ? 'uncategorized' : 'todo');
        } else {
          const cell = targetRow.cells.find(
            (c) => c.propertyId === groupByProperty?.id
          );
          const _value = cell?.value;

          const foundGroup = Object.entries(groupedRows).find(([_gid, rows]) =>
            rows.some((r) => r.id === overId)
          );
          if (foundGroup) targetGroupId = foundGroup[0];
        }
      }
    }

    if (targetGroupId && groupByProperty) {
      let newValue: unknown = targetGroupId;

      if (groupByProperty.type === 'STATUS') {
        const options =
          (groupByProperty.options as unknown as PropertyOption[]) || [];
        const targetOptions = options.filter((o) => o.group === targetGroupId);
        if (targetOptions.length > 0) {
          newValue = { value: targetOptions[0].id };
        } else {
          return;
        }
      } else if (groupByProperty.type === 'SELECT') {
        newValue =
          targetGroupId === 'uncategorized'
            ? { value: null }
            : { value: targetGroupId };
      }

      updateCell(activeRowId, groupByProperty.id, newValue);

      await updateCellByPosition(groupByProperty.id, activeRowId, newValue);
    }
  };

  const handleAddRow = async (groupId: string) => {
    const groupByPropertyId = boardGroupByProperty;

    const temporaryId = crypto.randomUUID();
    const newRow = {
      id: temporaryId,
      databaseId: database.id,
      pageId: null,
      order: database.rows.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      cells: [],
    } as unknown as DatabaseRow & { cells: Cell[]; page: Page | null };

    addOptimisticRow(newRow);

    const createdRow = await addRow(database.id);

    if (groupByPropertyId && groupId !== 'uncategorized') {
      const property = database.properties.find(
        (p) => p.id === groupByPropertyId
      );
      let value: unknown = null;

      if (property?.type === 'STATUS') {
        const options = (property.options as unknown as PropertyOption[]) || [];

        const targetOption = options.find((o) => o.group === groupId);
        if (targetOption) {
          value = { value: targetOption.id };
        }
      } else if (
        property?.type === 'SELECT' ||
        property?.type === 'MULTI_SELECT'
      ) {
        const options = (property.options as unknown as PropertyOption[]) || [];
        const option = options.find(
          (o) => o.id === groupId || o.name === groupId
        );
        if (option) {
          value = { value: option.id };
        }
      }

      if (value) {
        await updateCellByPosition(groupByPropertyId, createdRow.id, value);
      }
    }
  };

  const handleAddGroup = async () => {
    const groupByPropertyId = boardGroupByProperty;
    if (!groupByPropertyId) return;

    const property = database.properties.find(
      (p) => p.id === groupByPropertyId
    );
    if (
      !property ||
      (property.type !== 'SELECT' && property.type !== 'MULTI_SELECT')
    )
      return;

    const name = prompt('New Group Name:');
    if (!name) return;

    const newOption = {
      id: crypto.randomUUID(),
      name,
      color: 'default',
    };

    const currentOptions =
      (property.options as unknown as PropertyOption[]) || [];
    const newOptions = [...currentOptions, newOption];

    await updateProperty(property.id, { options: newOptions });
  };

  useEffect(() => {
    const handleAddEvent = () => {
      const firstGroup = groups[0]?.id || 'uncategorized';
      handleAddRow(firstGroup);
    };
    globalThis.addEventListener('database-add-row', handleAddEvent);
    return () => {
      globalThis.removeEventListener('database-add-row', handleAddEvent);
    };
  }, [groups, handleAddRow]);

  if (!groupByProperty) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Please select a property to group by.
      </div>
    );
  }

  const activeRow = activeId
    ? filteredRows.find((r) => r.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full overflow-x-auto p-4 gap-4 items-start">
        {groups.map((group) => (
          <BoardColumn
            key={group.id}
            group={group}
            rows={groupedRows[group.id] || []}
            properties={database.properties}
            onAddRow={() => handleAddRow(group.id)}
          />
        ))}

        <div
          className="shrink-0 w-72 h-10 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer"
          onClick={handleAddGroup}
        >
          <span className="flex items-center text-sm font-medium">
            Add Group
          </span>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeRow && (
              <div className="w-72">
                <BoardCard row={activeRow} properties={database.properties} />
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
