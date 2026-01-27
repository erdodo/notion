'use client';

import { FileText, FolderOpen, Home, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { searchPages } from '@/app/(main)/_actions/documents';
import { movePage } from '@/app/(main)/_actions/navigation';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMovePage } from '@/hooks/use-move-page';

interface Page {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

export function MovePageModal() {
  const { isOpen, onClose, pageId, currentParentId } = useMovePage();
  const router = useRouter();

  const [query, setQuery] = useState('');

  const [pages, setPages] = useState<Page[]>([]);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const results = await searchPages(query, {
          includeDatabases: true,
          limit: 50,
        });
        setPages(results);
      } catch (error) {
        console.error(error);
      }
    };

    if (isOpen) {
      fetchPages();
    } else {
      setQuery('');
    }
  }, [isOpen, query]);

  const handleMove = async (targetParentId: string | null) => {
    if (!pageId) return;

    if (targetParentId === currentParentId) {
      onClose();
      return;
    }

    setMoving(true);
    try {
      await movePage(pageId, targetParentId);
      toast.success('Page moved successfully');
      onClose();

      router.refresh();

      globalThis.dispatchEvent(
        new CustomEvent('notion-document-update', {
          detail: { id: pageId },
        })
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to move page'
      );
    } finally {
      setMoving(false);
    }
  };

  const rootLabel = 'Private pages (root)';
  const showRoot =
    query === '' || rootLabel.toLowerCase().includes(query.toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={() => !moving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move page to...</DialogTitle>
        </DialogHeader>

        <Command shouldFilter={false} className="border rounded-md">
          <CommandInput
            placeholder="Search pages..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-64">
            <CommandEmpty>No pages found</CommandEmpty>

            {}
            {showRoot && (
              <CommandItem
                onSelect={() => handleMove(null)}
                className="flex items-center gap-2"
                value={rootLabel}
              >
                <Home className="h-4 w-4" />
                <span>{rootLabel}</span>
                {currentParentId === null && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </CommandItem>
            )}

            <CommandGroup heading="Pages">
              {pages
                .filter((p) => !pageId || p.id !== pageId)
                .map((page) => (
                  <CommandItem
                    key={page.id}
                    onSelect={() => handleMove(page.id)}
                    className="flex items-center gap-2"
                    value={page.title || 'Untitled'}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>{page.icon || <FileText className="h-4 w-4" />}</span>
                    <span className="truncate">{page.title || 'Untitled'}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
