import { DatabaseRow, Cell, Page } from '@prisma/client';
import { flexRender, ColumnDef, Table } from '@tanstack/react-table';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { GroupedResult } from '@/hooks/use-filtered-sorted-data';

type DetailedRow = DatabaseRow & {
  cells: Cell[];
  page: Page | null;
  depth?: number;
  hasChildren?: boolean;
};

interface GroupSectionProperties {
  group: GroupedResult;
  table: Table<DetailedRow>;
  columns: ColumnDef<DetailedRow>[];
  isGrouped?: boolean;
}

export function GroupSection({ group, table }: GroupSectionProperties) {
  const [isOpen, setIsOpen] = useState(true);

  const groupRows = table
    .getRowModel()
    .rows.filter((r) => group.rows.some((gr) => gr.id === r.id));

  return (
    <>
      <div className="bg-secondary/20 hover:bg-secondary/30 flex min-w-full border-b border-border/50">
        <div className="p-0 flex-1">
          <div
            className="flex items-center gap-2 p-1 pl-2 cursor-pointer select-none"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm flex items-center gap-2">
              {group.groupKey === '__empty__' ? (
                'No Group'
              ) : (
                <span>{String(group.groupValue)}</span>
              )}
              <span className="text-muted-foreground font-normal ml-1">
                {groupRows.length}
              </span>
            </span>
          </div>
        </div>
      </div>
      {isOpen &&
        groupRows.map((row) => (
          <div
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            className="group h-[33px] flex hover:bg-muted/50 transition-colors border-b border-border/50 min-w-full"
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="p-0 border-r border-border/50 last:border-r-0 relative flex-shrink-0"
                style={{ width: cell.column.getSize() }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
            <div className="border-l border-border/50 bg-transparent p-0 flex-1 min-w-[50px]">
              <div className="h-full w-full" />
            </div>
          </div>
        ))}
    </>
  );
}
