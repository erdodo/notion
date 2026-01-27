import { Database, Property } from '@prisma/client';
import { Layers } from 'lucide-react';

import { CalendarOptions } from './calendar-options';
import { GalleryOptions } from './gallery-options';
import { TimelineOptions } from './timeline-options';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useDatabase } from '@/hooks/use-database';

interface ViewOptionsProperties {
  database: Database & { properties: Property[] };
}

export function ViewOptions({ database }: ViewOptionsProperties) {
  const {
    currentView,
    groupByProperty,
    setGroupByProperty,
    boardGroupByProperty,
    setBoardGroupByProperty,
    openMode,
    setOpenMode,
  } = useDatabase();

  const activeGroupBy =
    currentView === 'board' ? boardGroupByProperty : groupByProperty;
  const setActiveGroupBy =
    currentView === 'board' ? setBoardGroupByProperty : setGroupByProperty;

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 md:px-2 px-0 gap-1 text-muted-foreground"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden md:inline">Group</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Group by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={activeGroupBy || 'none'}
            onValueChange={(value) => {
              setActiveGroupBy(value === 'none' ? null : value);
            }}
          >
            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {database.properties.map((property) => (
              <DropdownMenuRadioItem key={property.id} value={property.id}>
                {property.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Open as</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={openMode}
            onValueChange={(value) => {
              setOpenMode(value as 'side' | 'center');
            }}
          >
            <DropdownMenuRadioItem value="center">
              Center Peek
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="side">
              Side Peek
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentView === 'calendar' && <CalendarOptions database={database} />}
      {currentView === 'gallery' && <GalleryOptions database={database} />}
      {currentView === 'timeline' && <TimelineOptions database={database} />}
    </div>
  );
}
