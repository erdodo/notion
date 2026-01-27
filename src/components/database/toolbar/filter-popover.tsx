import { Property, PropertyType } from '@prisma/client';
import { format } from 'date-fns';
import { Filter, X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDatabase, FilterOperator } from '@/hooks/use-database';
import { cn } from '@/lib/utils';

interface FilterPopoverProperties {
  properties: Property[];
}

const getOperatorsForType = (
  type: PropertyType
): { label: string; value: FilterOperator }[] => {
  switch (type) {
    case 'TEXT':
    case 'URL':
    case 'EMAIL':
    case 'PHONE': {
      return [
        { label: 'Is', value: 'is' },
        { label: 'Is not', value: 'is_not' },
        { label: 'Contains', value: 'contains' },
        { label: 'Does not contain', value: 'not_contains' },
        { label: 'Starts with', value: 'starts_with' },
        { label: 'Ends with', value: 'ends_with' },
        { label: 'Is empty', value: 'is_empty' },
        { label: 'Is not empty', value: 'is_not_empty' },
      ];
    }
    case 'SELECT':
    case 'MULTI_SELECT': {
      return [
        { label: 'Is', value: 'is' },
        { label: 'Is not', value: 'is_not' },
        { label: 'Contains', value: 'contains' },
        { label: 'Does not contain', value: 'not_contains' },
        { label: 'Is empty', value: 'is_empty' },
        { label: 'Is not empty', value: 'is_not_empty' },
      ];
    }
    case 'DATE':
    case 'CREATED_TIME':
    case 'UPDATED_TIME': {
      return [
        { label: 'Is', value: 'is' },
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
        { label: 'Is on or before', value: 'is_on_or_before' },
        { label: 'Is on or after', value: 'is_on_or_after' },
        { label: 'Is today', value: 'is_today' },
        { label: 'Is tomorrow', value: 'is_tomorrow' },
        { label: 'Is yesterday', value: 'is_yesterday' },
        { label: 'Is one week ago', value: 'is_one_week_ago' },
        { label: 'Is one month ago', value: 'is_one_month_ago' },
        { label: 'Is empty', value: 'is_empty' },
        { label: 'Is not empty', value: 'is_not_empty' },
      ];
    }
    case 'CHECKBOX': {
      return [
        { label: 'Is checked', value: 'is_checked' },
        { label: 'Is unchecked', value: 'is_unchecked' },
      ];
    }
    default: {
      return [
        { label: 'Is', value: 'is' },
        { label: 'Is not', value: 'is_not' },
        { label: 'Contains', value: 'contains' },
        { label: 'Is empty', value: 'is_empty' },
        { label: 'Is not empty', value: 'is_not_empty' },
      ];
    }
  }
};

export function FilterPopover({ properties }: FilterPopoverProperties) {
  const { filters, addFilter, updateFilter, removeFilter } = useDatabase();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${filters.length > 0 ? 'text-primary' : ''}`}
          title="Filter"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            {filters.length === 0
              ? 'No filters applied'
              : 'In this view, filter by:'}
          </div>

          {filters.map((filter) => {
            const index = filters.indexOf(filter);
            const property = properties.find((p) => p.id === filter.propertyId);
            if (!property) return null;

            const operators = getOperatorsForType(property.type);

            return (
              <div
                key={index}
                className="flex flex-col gap-2 p-2 rounded bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="text-muted-foreground min-w-[80px] truncate font-medium"
                    title={property.name}
                  >
                    {property.name}
                  </span>
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => {
                      updateFilter(index, {
                        ...filter,
                        operator: value as FilterOperator,
                      });
                    }}
                  >
                    <SelectTrigger className="h-6 w-[120px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeFilter(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {![
                  'is_empty',
                  'is_not_empty',
                  'is_checked',
                  'is_unchecked',
                  'is_today',
                  'is_tomorrow',
                  'is_yesterday',
                  'is_one_week_ago',
                  'is_one_month_ago',
                ].includes(filter.operator) && (
                  <div className="pl-[88px]">
                    {property.type === 'DATE' ||
                    property.type === 'CREATED_TIME' ||
                    property.type === 'UPDATED_TIME' ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-8 text-xs',
                              !filter.value && 'text-muted-foreground'
                            )}
                          >
                            {filter.value ? (
                              format(new Date(filter.value), 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              filter.value ? new Date(filter.value) : undefined
                            }
                            onSelect={(date) => {
                              updateFilter(index, {
                                ...filter,
                                value: date?.toISOString(),
                              });
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : property.type === 'SELECT' ||
                      property.type === 'MULTI_SELECT' ? (
                      <Input
                        className="h-7 text-xs"
                        placeholder="Type option..."
                        value={filter.value || ''}
                        onChange={(e) => {
                          updateFilter(index, {
                            ...filter,
                            value: e.target.value,
                          });
                        }}
                      />
                    ) : (
                      <Input
                        className="h-7 text-xs"
                        placeholder="Value..."
                        value={filter.value || ''}
                        onChange={(e) => {
                          updateFilter(index, {
                            ...filter,
                            value: e.target.value,
                          });
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground text-xs justify-start px-2"
              >
                <Plus className="h-3 w-3 mr-2" /> Add filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[200px] p-0"
              side="bottom"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search properties..." />
                <CommandList>
                  <CommandEmpty>No property found.</CommandEmpty>
                  <CommandGroup>
                    {properties.map((property) => (
                      <CommandItem
                        key={property.id}
                        value={property.name}
                        onSelect={() => {
                          addFilter({
                            id: crypto.randomUUID(),
                            propertyId: property.id,
                            operator: getOperatorsForType(property.type)[0]
                              .value,
                            value: '',
                          });
                          setAddOpen(false);
                        }}
                      >
                        {property.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
}
