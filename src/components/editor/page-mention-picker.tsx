'use client';

import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { searchPages } from '@/app/(main)/_actions/documents';
import { getRecentPages } from '@/app/(main)/_actions/navigation';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';

interface PageMentionPickerProperties {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pageId: string) => void;
  position: { top: number; left: number };
  currentPageId?: string;
}

interface Page {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

export function PageMentionPicker({
  isOpen,
  onClose,
  onSelect,
  position,
  currentPageId,
}: PageMentionPickerProperties) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 500);
  const [results, setResults] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      getRecentPages(5)
        .then((pages) => {
          setResults(
            pages.map((p) => ({
              id: p.id,
              title: p.title,
              icon: p.icon,
              parentId: p.parentId,
            }))
          );
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    searchPages(debouncedQuery)
      .then((docs) => {
        setResults(
          docs.map((d) => ({
            id: d.id,
            title: d.title,
            icon: d.icon,
            parentId: d.parentId,
          }))
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQuery, currentPageId]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value !== query) {
      setLoading(true);
    }
  };

  const handleSelect = (pageId: string) => {
    onSelect(pageId);
    onClose();
    setQuery('');
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
        }}
      />
      <PopoverContent className="w-72 p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput
            placeholder="Search pages..."
            value={query}
            onValueChange={handleQueryChange}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Searching...' : 'No pages found'}
            </CommandEmpty>

            {!query && results.some((p) => p.id !== currentPageId) && (
              <CommandGroup heading="Recent">
                {results
                  .filter((p) => p.id !== currentPageId)
                  .map((page) => (
                    <CommandItem
                      key={page.id}
                      onSelect={() => {
                        handleSelect(page.id);
                      }}
                      className="flex items-center gap-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <span>
                        {page.icon || <FileText className="h-4 w-4" />}
                      </span>
                      <span className="truncate">
                        {page.title || 'Untitled'}
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {query &&
              results
                .filter((p) => p.id !== currentPageId)
                .map((page) => (
                  <CommandItem
                    key={page.id}
                    onSelect={() => {
                      handleSelect(page.id);
                    }}
                    className="flex items-center gap-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">
                        {page.title || 'Untitled'}
                      </span>
                      {}
                    </div>
                  </CommandItem>
                ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
