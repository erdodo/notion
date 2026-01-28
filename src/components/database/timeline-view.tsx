'use client';

import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  type DatabaseView,
} from '@prisma/client';
import moment from 'moment';
import { useEffect, useRef, useState, useMemo } from 'react';
import { DataSet } from 'vis-data';
import {
  Timeline,
  TimelineOptions,
  DataItem,
  DataGroup,
} from 'vis-timeline/standalone';

import { TimelineDependencies } from './timeline-dependencies';

import { updateCellByPosition } from '@/app/(main)/_actions/database';
import { useDatabase } from '@/hooks/use-database';
import { useFilteredSortedData } from '@/hooks/use-filtered-sorted-data';

import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineViewProperties {
  database: Database & {
    properties: Property[];
    rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
    views: DatabaseView[];
  };
}

export function TimelineView({ database }: TimelineViewProperties) {
  const containerReference = useRef<HTMLDivElement>(null);
  const timelineReference = useRef<Timeline | null>(null);
  const [timelineInstance, setTimelineInstance] = useState<Timeline | null>(
    null
  );

  const {
    timelineDateProperty,
    timelineGroupByProperty,
    timelineScale,
    setSelectedRowId,
    setTimelineDateProperty,
    timelineDependencyProperty,
  } = useDatabase();

  const { sortedRows: filteredRows } = useFilteredSortedData(database);

  const dateProperty =
    database.properties.find((p) =>
      timelineDateProperty ? p.id === timelineDateProperty : p.type === 'DATE'
    ) || database.properties.find((p) => p.type === 'CREATED_TIME');

  useEffect(() => {
    if (!timelineDateProperty && dateProperty) {
      setTimelineDateProperty(dateProperty.id);
    }
  }, [dateProperty, timelineDateProperty, setTimelineDateProperty]);

  const { items, groups } = useMemo(() => {
    const newItems = new DataSet<DataItem>();
    const newGroups = new DataSet<DataGroup>();

    if (!dateProperty) return { items: newItems, groups: newGroups };

    const groupIdSet = new Set<string>();

    const groupProperty = database.properties.find(
      (p) => p.id === timelineGroupByProperty
    );
    if (
      groupProperty &&
      (groupProperty.type === 'SELECT' || groupProperty.type === 'MULTI_SELECT')
    ) {
      const options =
        (groupProperty.options as { id: string; name: string }[]) || [];

      options.forEach((opt: { id: string; name: string }) => {
        newGroups.add({ id: opt.id, content: opt.name });
        groupIdSet.add(opt.id);
      });

      newGroups.add({
        id: 'uncategorized',
        content: 'No ' + groupProperty.name,
      });
      groupIdSet.add('uncategorized');
    }

    for (const row of filteredRows) {
      const dateCell = row.cells.find((c) => c.propertyId === dateProperty.id);
      let start = new Date();
      let end: Date | undefined;

      if (dateCell?.value) {
        try {
          const parsed =
            typeof dateCell.value === 'string'
              ? JSON.parse(dateCell.value)
              : (dateCell.value as { start?: string; end?: string });
          if (parsed.start) start = new Date(parsed.start);
          if (parsed.end) end = new Date(parsed.end);
          if (
            !parsed.start &&
            !parsed.end &&
            typeof dateCell.value === 'string'
          ) {
            start = new Date(dateCell.value);
          }
        } catch {
          if (typeof dateCell.value === 'string') {
            start = new Date(dateCell.value);
          }
        }
      } else if (dateProperty.type === 'CREATED_TIME') {
        start = new Date(row.createdAt);
      } else if (dateProperty.type === 'UPDATED_TIME') {
        start = new Date(row.updatedAt);
      } else {
        continue;
      }

      let groupId: string | number = 'uncategorized';
      if (groupProperty) {
        const groupCell = row.cells.find(
          (c) => c.propertyId === groupProperty.id
        );
        if (groupCell?.value) {
          try {
            const value =
              typeof groupCell.value === 'string'
                ? JSON.parse(groupCell.value)
                : (groupCell.value as { id?: string } | { id?: string }[]);
            if (groupProperty.type === 'SELECT') {
              groupId = (value as { id: string }).id || 'uncategorized';
            } else if (
              groupProperty.type === 'MULTI_SELECT' &&
              Array.isArray(value) &&
              value.length > 0
            ) {
              groupId = value[0].id || 'uncategorized';
            }
          } catch {
            groupId = String(groupCell.value);
          }
        }
      }

      if (timelineGroupByProperty && !newGroups.get(groupId)) {
        newGroups.add({ id: groupId, content: String(groupId) });
      }

      newItems.add({
        id: row.id,
        content: row.page?.title || 'Untitled',
        start: start,
        end: end,
        group: timelineGroupByProperty ? groupId : undefined,
        type: end ? 'range' : 'point',
      });
    }

    return { items: newItems, groups: newGroups };
  }, [database, filteredRows, dateProperty, timelineGroupByProperty]);

  const dependencies = useMemo(() => {
    if (!timelineDependencyProperty) {
      return [];
    }

    const newDeps: { source: string; target: string }[] = [];

    for (const row of filteredRows) {
      const depCell = row.cells.find(
        (c) => c.propertyId === timelineDependencyProperty
      );
      if (depCell?.value) {
        let blockedByIds: string[] = [];
        try {
          const value =
            typeof depCell.value === 'string'
              ? JSON.parse(depCell.value)
              : (depCell.value as { linkedRowIds: string[] });
          if (value && Array.isArray(value.linkedRowIds)) {
            blockedByIds = value.linkedRowIds;
          }
        } catch (error) {
          console.error('Failed to parse dependency cell', error);
        }

        for (const blockerId of blockedByIds) {
          newDeps.push({ source: blockerId, target: row.id });
        }
      }
    }
    return newDeps;
  }, [filteredRows, timelineDependencyProperty]);

  useEffect(() => {
    if (!containerReference.current || !items) return;

    const options: TimelineOptions = {
      height: '100%',
      orientation: 'top',
      zoomKey: 'ctrlKey',
      start: moment().startOf('month').toDate(),
      end: moment().endOf('month').toDate(),
      editable: {
        add: false,
        remove: false,
        updateGroup: true,
        updateTime: true,
        overrideItems: false,
      },
      onMove: async (
        item: any,
        callback: any
      ) => {
        let allowed = true;
        const newStart = item.start;
        const newEnd = item.end;

        if (timelineDependencyProperty) {
          const blockers = dependencies.filter((d: any) => d.target === item.id);
          for (const dep of blockers) {
            const blockerItem = items.get(dep.source);
            if (
              blockerItem &&
              blockerItem.end &&
              new Date(newStart) < new Date(blockerItem.end)
            ) {
              allowed = false;
            }
          }

          const blockedItems = dependencies.filter((d: any) => d.source === item.id);
          for (const dep of blockedItems) {
            const targetItem = items.get(dep.target);
            if (
              targetItem &&
              targetItem.start &&
              new Date(newEnd as any) >
                new Date(targetItem.start)
            ) {
              allowed = false;
            }
          }
        }

        if (!allowed) {
          callback(null);

          return;
        }

        if (dateProperty && item.id) {
          let newValue: any = item.start;
          if (item.end) {
            newValue = {
              start: item.start,
              end: item.end,
            };
          }
          await updateCellByPosition(
            dateProperty.id,
            item.id as string,
            newValue
          );
        }
        callback(item);
      },
    };

    const timeline = new Timeline(
      containerReference.current,
      items,
      groups,
      options
    );

    timeline.on('select', (properties) => {
      if (properties.items && properties.items.length > 0) {
        setSelectedRowId(properties.items[0]);
      }
    });

    timelineReference.current = timeline;
    setTimelineInstance(timeline);

    return () => {
      timeline.destroy();
      if (timelineReference.current === timeline) {
        timelineReference.current = null;
        setTimelineInstance(null);
      }
    };
  }, [
    items,
    groups,
    timelineScale,
    dateProperty,
    setSelectedRowId,
    dependencies,
    timelineDependencyProperty,
  ]);

  useEffect(() => {
    if (!timelineReference.current) return;

    const start = moment();
    let end = moment();

    switch (timelineScale) {
      case 'day': {
        end = start.clone().add(1, 'week');
        break;
      }
      case 'week': {
        start.startOf('month');
        end = start.clone().add(1, 'month');
        break;
      }
      case 'month': {
        start.startOf('year');
        end = start.clone().add(1, 'year');
        break;
      }
      case 'year': {
        start.subtract(1, 'year');
        end = start.clone().add(3, 'years');
        break;
      }
    }

    timelineReference.current.setWindow(start.toDate(), end.toDate());
  }, [timelineScale]);

  if (!dateProperty) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No date property found. Please add a Date property to use Timeline view.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full bg-background" ref={containerReference} />
      {timelineInstance && (
        <TimelineDependencies
          timeline={timelineInstance as any}
          items={items as any}
          dependencies={dependencies}
        />
      )}
    </div>
  );
}
