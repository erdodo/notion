'use client';

import { Database, Property } from '@prisma/client';
import { Settings2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDatabase } from '@/hooks/use-database';

interface BoardOptionsProperties {
  database: Database & { properties: Property[] };
}

export function BoardOptions({ database }: BoardOptionsProperties) {
  const { boardGroupByProperty, setBoardGroupByProperty } = useDatabase();

  const groupableProperties = database.properties.filter(
    (p) => p.type === 'SELECT'
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <Settings2 className="h-4 w-4" />
          <span className="text-xs">Group By</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <h4 className="font-medium text-xs text-muted-foreground px-2 mb-2">
            Group by
          </h4>
          {groupableProperties.map((property) => (
            <Button
              key={property.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2 text-sm font-normal"
              onClick={() => {
                setBoardGroupByProperty(property.id);
              }}
            >
              <span className="flex-1 truncate text-left">{property.name}</span>
              {boardGroupByProperty === property.id && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </Button>
          ))}
          {groupableProperties.length === 0 && (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No groupable properties found. Add a "Select" property.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
