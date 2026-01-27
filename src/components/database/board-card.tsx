'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DatabaseRow, Property, Cell, Page } from '@prisma/client';

import { PropertyBadge } from './shared/property-badge';

import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/hooks/use-database';
import { usePageNavigation } from '@/hooks/use-page-navigation';
import { cn } from '@/lib/utils';

interface BoardCardProperties {
  row: DatabaseRow & { cells: Cell[]; page: Page | null };
  properties: Property[];
}

export function BoardCard({ row, properties }: BoardCardProperties) {
  const { visibleProperties } = useDatabase();
  const { navigateToPage } = usePageNavigation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: 'Card',
      row,
    },
  });

  const titleProperty = properties.find((p) => p.type === 'TITLE');
  const titleCell = row.cells.find((c) => c.propertyId === titleProperty?.id);
  const rawTitle = titleCell?.value;
  const title =
    typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
      ? String((rawTitle as { value: unknown }).value)
      : String(rawTitle || 'Untitled');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const propertiesToShow = properties.filter(
    (p) => p.type !== 'TITLE' && visibleProperties.includes(p.id)
  );

  const handleClick = () => {
    if (row.pageId) {
      navigateToPage(row.pageId);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 h-24 bg-secondary/50 border-2 border-primary/50 border-dashed rounded-lg"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group"
      onClick={handleClick}
    >
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing hover:bg-secondary/10 transition-colors shadow-sm hover:shadow-md',
          isDragging && 'opacity-50 shadow-lg'
        )}
      >
        <CardContent className="p-3 space-y-2">
          {}
          <div className="flex items-start gap-2">
            {row.page?.icon && (
              <span className="text-lg leading-relaxed shadow-sm">
                {row.page.icon}
              </span>
            )}
            <p className="font-medium text-sm text-foreground/90 leading-relaxed break-words select-none">
              {title}
            </p>
          </div>

          {}
          {propertiesToShow.length > 0 && (
            <div className="space-y-1 pt-1">
              {propertiesToShow.map((property) => {
                const cell = row.cells.find(
                  (c) => c.propertyId === property.id
                );
                return (
                  <PropertyBadge
                    key={property.id}
                    property={property}
                    value={cell?.value}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
