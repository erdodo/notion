'use client';

import { useMutation } from '@tanstack/react-query';
import {
  FileEdit,
  Copy,
  ExternalLink,
  FolderInput,
  Star,
  Link2,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  archiveDocument,
  duplicateDocument,
} from '@/app/(main)/_actions/documents';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '@/app/(main)/_actions/navigation';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { useMovePage } from '@/hooks/use-move-page';
import { useOrigin } from '@/hooks/use-origin';
import { useRenameModal } from '@/hooks/use-rename-modal';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface SidebarPageMenuProperties {
  data: {
    id: string;
    title: string;
    icon?: string;
    parentId?: string | null;
  };
}

export const SidebarPageMenu = ({ data }: SidebarPageMenuProperties) => {
  const router = useRouter();
  const { closeContextMenu } = useContextMenuStore();
  const renameModal = useRenameModal();
  const movePage = useMovePage();
  const origin = useOrigin();

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let active = true;
    isFavorite(data.id).then((value) => {
      if (active) setIsFavorited(value);
    });
    return () => {
      active = false;
    };
  }, [data.id]);

  const onCopyLink = () => {
    const url = `${origin}/documents/${data.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    closeContextMenu();
  };

  const { mutate: archive } = useMutation({
    mutationFn: archiveDocument,
    onSuccess: () => {
      toast.success('Moved to trash');
      router.refresh();

      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to delete');
      closeContextMenu();
    },
  });

  const { mutate: duplicate } = useMutation({
    mutationFn: duplicateDocument,
    onSuccess: () => {
      toast.success('Document duplicated');
      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to duplicate');
      closeContextMenu();
    },
  });

  const onFavoriteToggle = async () => {
    const newValue = !isFavorited;
    setIsFavorited(newValue);
    try {
      if (newValue) {
        await addToFavorites(data.id);
        toast.success('Added to favorites');
      } else {
        await removeFromFavorites(data.id);
        toast.success('Removed from favorites');
      }
      document.dispatchEvent(new CustomEvent('favorite-changed'));

      closeContextMenu();
    } catch {
      setIsFavorited(!newValue);
      toast.error('Failed to update favorite');
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          window.open(`/documents/${data.id}`, '_blank');
          closeContextMenu();
        }}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Open in New Tab
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => {
          renameModal.onOpen(data.id, data.title);
          closeContextMenu();
        }}
      >
        <FileEdit className="h-4 w-4 mr-2" />
        Rename
        <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          duplicate(data.id);
        }}
      >
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          movePage.onOpen(data.id, data.parentId ?? null);
          closeContextMenu();
        }}
      >
        <FolderInput className="h-4 w-4 mr-2" />
        Move To
        <DropdownMenuShortcut>⌘⇧P</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          onFavoriteToggle();
        }}
      >
        <Star
          className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`}
        />
        {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onCopyLink}>
        <Link2 className="h-4 w-4 mr-2" />
        Copy Link
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();

          archive(data.id);
        }}
        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
        <DropdownMenuShortcut>Del</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
};
