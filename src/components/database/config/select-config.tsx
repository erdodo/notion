'use client';

import { Reorder } from 'framer-motion';
import { X, GripVertical, Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NOTION_COLORS } from '@/lib/notion-colors';
import { cn } from '@/lib/utils';

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

interface SelectConfigProperties {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

export function SelectConfig({ options, onChange }: SelectConfigProperties) {
  const [newOptionName, setNewOptionName] = useState('');

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;

    const newOption: SelectOption = {
      id: crypto.randomUUID(),
      name: newOptionName,
      color: 'gray',
    };

    onChange([...options, newOption]);
    setNewOptionName('');
  };

  const handleUpdateOption = (id: string, updates: Partial<SelectOption>) => {
    const newOptions = options.map((opt) =>
      opt.id === id ? { ...opt, ...updates } : opt
    );
    onChange(newOptions);
  };

  const handleDeleteOption = (id: string) => {
    const newOptions = options.filter((opt) => opt.id !== id);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Options
      </div>

      <div className="space-y-1">
        <Reorder.Group
          axis="y"
          values={options}
          onReorder={onChange}
          className="space-y-1"
        >
          {options.map((option) => (
            <Reorder.Item key={option.id} value={option}>
              <div className="flex items-center gap-2 group py-1">
                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors" />

                <div className="flex-1 flex items-center gap-2 border border-transparent hover:border-border rounded px-2 py-1 transition-colors bg-white hover:bg-muted/30">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-sm cursor-pointer flex items-center justify-center shrink-0 transition-all hover:scale-105',
                          NOTION_COLORS.find((c) => c.value === option.color)
                            ?.bg || 'bg-gray-100'
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            NOTION_COLORS.find((c) => c.value === option.color)
                              ?.dot || 'bg-gray-500'
                          )}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      <div className="grid grid-cols-1 gap-0.5">
                        {NOTION_COLORS.filter(
                          (v, index, a) =>
                            a.findIndex((t) => t.value === v.value) === index
                        ).map((color) => (
                          <div
                            key={color.name}
                            className={cn(
                              'w-full px-2 py-1.5 rounded-sm cursor-pointer flex items-center gap-2 hover:bg-muted transition-colors text-sm',
                              option.color === color.value && 'bg-muted'
                            )}
                            onClick={() => {
                              handleUpdateOption(option.id, {
                                color: color.value,
                              });
                            }}
                          >
                            <div
                              className={cn(
                                'w-4 h-4 rounded-sm flex items-center justify-center',
                                color.bg
                              )}
                            >
                              <div
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  color.dot
                                )}
                              />
                            </div>
                            <span className="capitalize flex-1">
                              {color.name}
                            </span>
                            {option.color === color.value && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Input
                    value={option.name}
                    onChange={(e) => {
                      handleUpdateOption(option.id, { name: e.target.value });
                    }}
                    className="h-6 flex-1 text-sm border-0 focus-visible:ring-0 px-1 bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-sm"
                    onClick={() => {
                      handleDeleteOption(option.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
        <Input
          value={newOptionName}
          onChange={(e) => {
            setNewOptionName(e.target.value);
          }}
          placeholder="Add an option..."
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              handleAddOption();
            }
          }}
        />
        <Button
          onClick={handleAddOption}
          size="sm"
          variant="secondary"
          className="h-8"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
