'use client';

import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  DatabaseView,
} from '@prisma/client';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';

import { GalleryCard } from './gallery-card';

import { addRow } from '@/app/(main)/_actions/database';
import { useDatabase } from '@/hooks/use-database';
import {
  useFilteredSortedData,
  FilteredDataResult,
} from '@/hooks/use-filtered-sorted-data';
import { cn } from '@/lib/utils';

interface GalleryViewProperties {
  database: Database & {
    properties: Property[];
    rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
    views: DatabaseView[];
  };
}

export function GalleryView({ database }: GalleryViewProperties) {
  const {
    galleryCardSize,
    galleryCoverProperty,
    galleryFitImage,
    setSelectedRowId,
    galleryColumns,
  } = useDatabase();

  const { sortedRows: filteredRows } = useFilteredSortedData(
    database
  ) as unknown as FilteredDataResult;

  const handleAddRow = async () => {
    await addRow(database.id);
  };

  useEffect(() => {
    const handleAddEvent = () => handleAddRow();
    globalThis.addEventListener('database-add-row', handleAddEvent);
    return () => {
      globalThis.removeEventListener('database-add-row', handleAddEvent);
    };
  }, [handleAddRow]);

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${galleryColumns || 4}, minmax(0, 1fr))`,
        }}
      >
        {filteredRows.map((row) => (
          <GalleryCard
            key={row.id}
            row={row}
            properties={database.properties}
            coverPropertyId={galleryCoverProperty}
            fitImage={galleryFitImage}
            size={galleryCardSize}
            onClick={() => {
              setSelectedRowId(row.id);
            }}
          />
        ))}

        {}
        <div
          role="button"
          className={cn(
            'border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors',
            galleryCardSize === 'small'
              ? 'h-[200px]'
              : galleryCardSize === 'medium'
                ? 'h-[260px]'
                : 'h-[320px]'
          )}
          onClick={handleAddRow}
        >
          <Plus className="h-8 w-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">New</span>
        </div>
      </div>
    </div>
  );
}
