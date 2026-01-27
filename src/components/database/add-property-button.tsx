import { PropertyType } from '@prisma/client';
import { Plus } from 'lucide-react';

import { propertyTypeIcons } from './property-type-icon';

import { addProperty } from '@/app/(main)/_actions/database';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddPropertyButtonProperties {
  databaseId: string;
}

export function AddPropertyButton({ databaseId }: AddPropertyButtonProperties) {
  const onSelect = async (type: PropertyType) => {
    await addProperty(databaseId, {
      name: type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' '),
      type,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(propertyTypeIcons).map((key) => {
          const type = key as PropertyType;
          const Icon = propertyTypeIcons[type];
          return (
            <DropdownMenuItem key={type} onClick={() => onSelect(type)}>
              <Icon className="mr-2 h-4 w-4" />
              <span className="capitalize">
                {type.toLowerCase().replace('_', ' ')}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
