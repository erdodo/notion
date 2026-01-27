'use client';

import { DatabaseRow, Cell, Property, Page } from '@prisma/client';
import { ImageIcon } from 'lucide-react';

import { PropertyBadge } from './shared/property-badge';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GalleryCardProperties {
  row: DatabaseRow & { cells: Cell[]; page: Page | null };
  properties: Property[];
  coverPropertyId: string | null;
  fitImage: boolean;
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function GalleryCard({
  row,
  properties,
  coverPropertyId,
  fitImage,
  size,
  onClick,
}: GalleryCardProperties) {
  const coverCell = coverPropertyId
    ? row.cells.find((c) => c.propertyId === coverPropertyId)
    : null;
  const coverImage = coverCell?.value ? String(coverCell.value) : null;

  const titleProperty = properties.find((p) => p.type === 'TITLE');
  const titleCell = row.cells.find((c) => c.propertyId === titleProperty?.id);
  const rawTitle = titleCell?.value;
  const title =
    typeof rawTitle === 'object' && rawTitle !== null && 'value' in rawTitle
      ? String((rawTitle as Record<string, unknown>).value)
      : String(rawTitle || 'Untitled');

  const displayProperties = properties.filter(
    (p) => !['TITLE', coverPropertyId].includes(p.id)
  );

  const heightClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      {}
      <div
        className={cn(
          'bg-muted relative w-full overflow-hidden',
          heightClasses[size]
        )}
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className={cn(
              'w-full h-full',
              fitImage ? 'object-contain' : 'object-cover'
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            {row.page?.icon ? (
              <span className="text-4xl">{row.page.icon}</span>
            ) : (
              <ImageIcon className="h-10 w-10" />
            )}
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {row.page?.icon && <span className="text-lg">{row.page.icon}</span>}
          <h3 className="font-medium text-sm truncate">{title}</h3>
        </div>

        <div className="flex flex-col gap-1">
          {displayProperties.map((property) => {
            const cell = row.cells.find((c) => c.propertyId === property.id);

            return (
              <PropertyBadge
                key={property.id}
                property={property}
                value={cell?.value}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
