import { Check, MoreHorizontal, Trash } from 'lucide-react';
import { useState } from 'react';

import { CellProps as CellProperties } from './types';

import { updateProperty } from '@/app/(main)/_actions/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NOTION_COLORS, getOptionColors } from '@/lib/notion-colors';
import { cn } from '@/lib/utils';

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export function SelectCell({
  getValue,
  updateValue,
  column,
  onPropertyUpdate,
}: CellProperties) {
  const initialValue = getValue();
  const value =
    typeof initialValue === 'object' ? (initialValue as any)?.value : initialValue;

  const property = column.columnDef.meta?.property;
  const options: SelectOption[] =
    (property?.options as unknown as SelectOption[]) || [];

  const selectedOption = options.find((o) => o.id === value);
  const selectedColors = selectedOption
    ? getOptionColors(selectedOption.color)
    : null;

  const onSelect = (option: SelectOption) => {
    updateValue({ value: option.id });
  };

  const [search, setSearch] = useState('');

  const createOption = async () => {
    const newOption = {
      id: crypto.randomUUID(),
      name: search,
      color: 'gray',
    };

    const newOptions = [...options, newOption];

    onPropertyUpdate?.(property!.id, { options: newOptions as any });

    await updateProperty(property!.id, {
      options: newOptions as any,
    } as any);

    updateValue({ value: newOption.id });
  };

  return (
    <div className="h-full w-full py-1.5 px-2">
      <Popover>
        <PopoverTrigger asChild>
          <div className="h-full w-full cursor-pointer min-h-[24px]">
            {selectedOption ? (
              <Badge
                variant="secondary"
                className={cn(selectedColors?.bg, selectedColors?.text)}
              >
                {selectedOption.name}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Select...</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="p-2">
            <input
              className="w-full text-sm border-b p-1 mb-2 outline-none bg-transparent"
              placeholder="Search or create..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  search &&
                  !options.find((o) => o.name === search)
                ) {
                  createOption();
                }
              }}
            />
            <div className="max-h-[200px] overflow-auto">
              {options
                .filter((o) =>
                  o.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((option) => {
                  const colors = getOptionColors(option.color);
                  return (
                    <div
                      key={option.id}
                      className="group flex items-center justify-between p-1 hover:bg-muted cursor-pointer rounded text-sm"
                      onClick={() => {
                        onSelect(option);
                      }}
                    >
                      <div className="flex items-center">
                        <Badge
                          variant="secondary"
                          className={cn('mr-2', colors.bg, colors.text)}
                        >
                          {option.name}
                        </Badge>
                        {option.id === value && <Check className="h-3 w-3" />}
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 opacity-0 group-hover:opacity-100 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-48 p-2"
                          side="right"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Edit Option
                          </div>
                          <div className="grid grid-cols-5 gap-1 mb-2">
                            {NOTION_COLORS.filter(
                              (v, index, a) =>
                                a.findIndex((t) => t.value === v.value) ===
                                index
                            ).map((color) => (
                              <div
                                key={color.name}
                                className={cn(
                                  'w-6 h-6 rounded cursor-pointer border hover:opacity-80',
                                  color.bg
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newOptions = options.map((o) =>
                                    o.id === option.id
                                      ? { ...o, color: color.value }
                                      : o
                                  );
                                  onPropertyUpdate?.(property!.id, {
                                    options: newOptions as any,
                                  });
                                  updateProperty(property!.id, {
                                    options: newOptions as any,
                                  } as any);
                                }}
                              />
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-destructive justify-start h-8 px-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newOptions = options.filter(
                                (o) => o.id !== option.id
                              );
                              onPropertyUpdate?.(property!.id, {
                                options: newOptions as any,
                              });
                              updateProperty(property!.id, {
                                options: newOptions as any,
                              } as any);
                            }}
                          >
                            <Trash className="h-3 w-3 mr-2" /> Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
              {search && !options.find((o) => o.name === search) && (
                <div
                  className="text-sm p-1 hover:bg-muted cursor-pointer rounded text-muted-foreground"
                  onClick={createOption}
                >
                  Create "{search}"
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
