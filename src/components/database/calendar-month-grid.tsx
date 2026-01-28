'use client';

import { DatabaseRow, Cell, Property, Page } from '@prisma/client';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
} from 'date-fns';

import { CalendarDayCell } from './calendar-day-cell';

interface MonthGridProperties {
  date: Date;
  rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
  datePropertyId: string;
  properties: Property[];
  onAddRow?: (date: Date) => void;
  onEventClick?: (rowId: string) => void;
}

export function MonthGrid({
  date,
  rows,
  datePropertyId,
  properties,
  onAddRow,
  onEventClick,
}: MonthGridProperties) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const eventsByDate: Record<
    string,
    (DatabaseRow & { cells: Cell[]; page: Page | null; title: string })[]
  > = {};

  const titleProperty = properties.find((p) => p.type === 'TITLE');

  const unwrapValue = (value: unknown): unknown => {
    if (value && typeof value === 'object' && 'value' in value) {
      return unwrapValue(value.value);
    }
    return value;
  };

  for (const row of rows) {
    const dateCell = row.cells.find((c) => c.propertyId === datePropertyId);

    const rawValue = unwrapValue(dateCell?.value);

    if (!rawValue) continue;

    const dateString = format(new Date(String(rawValue)), 'yyyy-MM-dd');
    if (!eventsByDate[dateString]) eventsByDate[dateString] = [];

    const titleCell = row.cells.find((c) => c.propertyId === titleProperty?.id);
    const rawTitle = unwrapValue(titleCell?.value);

    const title = rawTitle ? String(rawTitle) : 'Untitled';

    eventsByDate[dateString].push({ ...row, title } as DatabaseRow & {
      cells: Cell[];
      page: Page | null;
      title: string;
    });
  }

  return (
    <div className="border-t border-l rounded-t-none rounded-lg overflow-hidden">
      {}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-muted-foreground border-r bg-muted/20"
          >
            {day}
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayDate = day;
          const dateKey = format(dayDate, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(dayDate, monthStart);

          return (
            <div
              key={dateKey}
              className={isCurrentMonth ? '' : 'bg-muted/10 opacity-60'}
            >
              <CalendarDayCell
                date={dayDate}
                events={dayEvents}
                isToday={isSameDay(dayDate, new Date())}
                onAddEvent={onAddRow}
                onEventClick={onEventClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
