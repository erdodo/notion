import { Database, Property } from '@prisma/client';
import { Settings2 } from 'lucide-react';

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

interface TimelineOptionsProperties {
  database: Database & { properties: Property[] };
}

export function TimelineOptions({ database }: TimelineOptionsProperties) {
  const {
    timelineDateProperty,
    setTimelineDateProperty,
    timelineScale,
    setTimelineScale,
    timelineDependencyProperty,
    setTimelineDependencyProperty,
  } = useDatabase();

  const dateProperties = database.properties.filter(
    (p) =>
      p.type === 'DATE' ||
      p.type === 'CREATED_TIME' ||
      p.type === 'UPDATED_TIME'
  );
  const relationProperties = database.properties.filter(
    (p) => p.type === 'RELATION'
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 md:px-2 px-0 gap-1 text-muted-foreground"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden md:inline">Timeline Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Date Property</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={timelineDateProperty || dateProperties[0]?.id || ''}
          onValueChange={(value) => {
            setTimelineDateProperty(value);
          }}
        >
          {dateProperties.map((property) => (
            <DropdownMenuRadioItem key={property.id} value={property.id}>
              {property.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Scale</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={timelineScale}
          onValueChange={(value) => {
            setTimelineScale(value as 'day' | 'week' | 'month' | 'year');
          }}
        >
          <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="week">Week</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="month">Month</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="year">Year</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Dependencies</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={timelineDependencyProperty || 'none'}
          onValueChange={(value) => {
            setTimelineDependencyProperty(value === 'none' ? null : value);
          }}
        >
          <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
          {relationProperties.map((property) => (
            <DropdownMenuRadioItem key={property.id} value={property.id}>
              {property.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
