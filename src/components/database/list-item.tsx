'use client';

import { DatabaseRow, Cell, Property, Page } from '@prisma/client';
import { FileIcon } from 'lucide-react';

import { PropertyTypeIcon } from './property-type-icon';
import { PropertyValue } from './shared/property-value';

import { useContextMenu } from '@/hooks/use-context-menu';

interface ListItemProperties {
  row: DatabaseRow & { cells: Cell[]; page: Page | null };
  properties: Property[];
  onClick?: () => void;
}

export function ListItem({ row, properties, onClick }: ListItemProperties) {
  const titleProperty = properties.find((p) => p.type === 'TITLE');
  const titleCell = row.cells.find((c) => c.propertyId === titleProperty?.id);
  const rawTitle = titleCell?.value;
  const title =
    typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
      ? String((rawTitle as { value: unknown }).value)
      : String(rawTitle || 'Untitled');

  const otherProperties = properties.filter((p) => p.type !== 'TITLE');

  const { onContextMenu, onTouchStart, onTouchEnd, onTouchMove } =
    useContextMenu({
      type: 'database-row',
      data: { id: row.id, title },
    });

  return (
    <div
      className="group flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer border-b border-border/40 last:border-0"
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {}
      <div className="w-6 flex justify-center shrink-0">
        {row.page?.icon ? (
          <span>{row.page.icon}</span>
        ) : (
          <FileIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {}
      <span className="text-sm font-medium flex-1 truncate text-foreground">
        {title}
      </span>

      {}
      <div className="flex items-center gap-4 text-xs text-muted-foreground overflow-hidden">
        {otherProperties.slice(0, 3).map((property) => {
          const cell = row.cells.find((c) => c.propertyId === property.id);
          if (!cell?.value) return null;

          return (
            <div
              key={property.id}
              className="flex items-center gap-1.5 max-w-[150px]"
            >
              <PropertyTypeIcon
                type={property.type}
                className="h-3 w-3 opacity-70 shrink-0"
              />
              <div className="truncate">
                <PropertyValue
                  property={property}
                  value={cell.value as any}
                  compact
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
