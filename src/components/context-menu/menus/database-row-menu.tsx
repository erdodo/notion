'use client';

import { useMutation } from '@tanstack/react-query';
import { Copy, Trash, CopyPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  removeDocument,
  duplicateDocument,
} from '@/app/(main)/_actions/documents';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { useOrigin } from '@/hooks/use-origin';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface DatabaseRowMenuProperties {
  data: {
    id: string;
  };
}

export const DatabaseRowMenu = ({ data }: DatabaseRowMenuProperties) => {
  const router = useRouter();
  const origin = useOrigin();
  const { closeContextMenu } = useContextMenuStore();

  const { mutate: remove } = useMutation({
    mutationFn: () => removeDocument(data.id),
    onSuccess: () => {
      toast.success('Row moved to trash');
      router.refresh();
      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to delete row');
      closeContextMenu();
    },
  });

  const { mutate: duplicate } = useMutation({
    mutationFn: () => duplicateDocument(data.id),
    onSuccess: () => {
      toast.success('Row duplicated');
      router.refresh();
      closeContextMenu();
    },
  });

  const onCopyLink = () => {
    const url = `${origin}/documents/${data.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link to row copied');
    closeContextMenu();
  };

  return (
    <>
      <DropdownMenuItem onClick={onCopyLink}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Link
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          duplicate();
        }}
      >
        <CopyPlus className="h-4 w-4 mr-2" />
        Duplicate Row
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => {
          remove();
        }}
        className="text-red-600 focus:text-red-600"
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete Row
        <DropdownMenuShortcut>Del</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
};
