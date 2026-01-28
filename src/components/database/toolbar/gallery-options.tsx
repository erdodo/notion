import { Database, Property } from '@prisma/client';
import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDatabase } from '@/hooks/use-database';

interface GalleryOptionsProps {
  _database?: Database & { properties: Property[] };
}

export function GalleryOptions({ _database }: GalleryOptionsProps) {
  const {
    galleryCardSize,
    setGalleryCardSize,
    galleryFitImage,
    toggleGalleryFitImage,
    galleryColumns,
    setGalleryColumns,
  } = useDatabase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-muted-foreground"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Options</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none mb-4">Gallery Options</h4>

            <div className="flex items-center justify-between">
              <label className="text-sm">Fit Image</label>
              <Button
                variant={galleryFitImage ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs"
                onClick={toggleGalleryFitImage}
              >
                {galleryFitImage ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm">Card Size</label>
                <select
                  className="bg-transparent text-sm border rounded px-1 h-6"
                  value={galleryCardSize}
                  onChange={(e) => {
                    setGalleryCardSize(e.target.value);
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t mt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm">Columns</label>
                <span className="text-xs text-muted-foreground">
                  {galleryColumns || 4}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                className="w-full accent-primary"
                value={galleryColumns || 4}
                onChange={(e) => {
                  setGalleryColumns(Number(e.target.value));
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
