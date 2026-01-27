'use client';

import { DatabaseRow, Page } from '@prisma/client';
import { X, Plus, ExternalLink } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

type DatabaseRowWithPage = DatabaseRow & { page?: Page | null };

import { getLinkedRows } from '@/app/(main)/_actions/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RelationCellProperties {
  propertyId: string;
  rowId: string;
  value: { linkedRowIds: string[] } | null;
  config: {
    targetDatabaseId: string;
    limitType: 'none' | 'one';
  };
  editable?: boolean;
}

export function RelationCell({
  propertyId,
  rowId,
  value,
  config,
  editable = true,
}: RelationCellProperties) {
  const [linkedRows, setLinkedRows] = useState<DatabaseRowWithPage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableRows, setAvailableRows] = useState<DatabaseRowWithPage[]>([]);

  const linkedRowIds = useMemo(
    () => value?.linkedRowIds || [],
    [value?.linkedRowIds]
  );

  useEffect(() => {
    if (linkedRowIds.length > 0 && config?.targetDatabaseId) {
      getLinkedRows(config.targetDatabaseId, linkedRowIds).then(setLinkedRows);
    } else {
      setLinkedRows([]);
    }
  }, [linkedRowIds, config?.targetDatabaseId]);

  const fetchDatabaseRows = async (databaseId: string) => {
    const { getDatabase } = await import('@/app/(main)/_actions/database');
    const database = await getDatabase(databaseId);
    return database?.rows || [];
  };

  useEffect(() => {
    if (isOpen && config?.targetDatabaseId) {
      fetchDatabaseRows(config.targetDatabaseId).then(setAvailableRows);
    }
  }, [isOpen, config?.targetDatabaseId]);

  if (!config) {
    return (
      <div className="text-muted-foreground italic text-xs px-2">
        Invalid configuration
      </div>
    );
  }

  const handleLink = async (targetRowId: string) => {
    const newIds =
      config.limitType === 'one'
        ? [targetRowId]
        : [...linkedRowIds, targetRowId];

    const { updateCellByPosition } =
      await import('@/app/(main)/_actions/database');
    await updateCellByPosition(propertyId, rowId, { linkedRowIds: newIds });

    if (config.limitType === 'one') {
      setIsOpen(false);
    }
  };

  const handleUnlink = async (targetRowId: string) => {
    const newIds = linkedRowIds.filter((id) => id !== targetRowId);
    const { updateCellByPosition } =
      await import('@/app/(main)/_actions/database');
    await updateCellByPosition(propertyId, rowId, { linkedRowIds: newIds });
  };

  const filteredRows = availableRows.filter(
    (row) =>
      !linkedRowIds.includes(row.id) &&
      row.page?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-1 min-h-[32px] px-2">
      {}
      {linkedRows.map((row) => (
        <Badge
          key={row.id}
          variant="secondary"
          className="flex items-center gap-1 max-w-[200px]"
        >
          {}
          {row.page?.icon && <span>{row.page.icon}</span>}
          {}
          <span className="truncate">{row.page?.title || 'Untitled'}</span>

          {}
          <button
            onClick={() => window.open(`/documents/${row.pageId}`, '_blank')}
            className="hover:bg-muted rounded p-0.5"
          >
            <ExternalLink className="h-3 w-3" />
          </button>

          {}
          {editable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUnlink(row.id);
              }}
              className="hover:bg-destructive/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}

      {}
      {editable &&
        (config.limitType === 'none' || linkedRowIds.length === 0) && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Plus className="h-3 w-3 mr-1" />
                Link
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search pages to link..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No pages found</CommandEmpty>
                  {filteredRows.map((row) => (
                    <CommandItem
                      key={row.id}
                      onSelect={() => handleLink(row.id)}
                    >
                      {}
                      {row.page?.icon && (
                        <span className="mr-2">{row.page.icon}</span>
                      )}
                      {}
                      <span>{row.page?.title || 'Untitled'}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
    </div>
  );
}
