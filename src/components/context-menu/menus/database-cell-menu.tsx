'use client';

import { useMutation } from '@tanstack/react-query';
import { Copy, Trash, CopyPlus, Edit2 } from 'lucide-react';
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
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface DatabaseCellMenuProperties {
  data: {
    rowId: string;
    pageId?: string;
    propertyId: string;
    value: unknown;
  };
}

export const DatabaseCellMenu = ({ data }: DatabaseCellMenuProperties) => {
  const router = useRouter();
  const { closeContextMenu } = useContextMenuStore();

  const { mutate: remove } = useMutation({
    mutationFn: () => removeDocument(data.pageId || data.rowId),
    onSuccess: () => {
      toast.success('Row moved to trash');
      router.refresh();
      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to delete row');
    },
  });

  const { mutate: duplicate } = useMutation({
    mutationFn: () => duplicateDocument(data.pageId || data.rowId),
    onSuccess: () => {
      toast.success('Row duplicated');
      router.refresh();
      closeContextMenu();
    },
  });

  const onCopyContent = () => {
    let text = '';
    if (typeof data.value === 'string') text = data.value;
    else if (typeof data.value === 'number') text = String(data.value);
    else if (data.value === null || data.value === undefined) text = '';
    else if (typeof data.value === 'object') text = JSON.stringify(data.value);

    navigator.clipboard.writeText(text);
    toast.success('Cell content copied');
    closeContextMenu();
  };

  const onEditProperty = () => {
    globalThis.dispatchEvent(
      new CustomEvent('database-edit-cell', {
        detail: { rowId: data.rowId, propertyId: data.propertyId },
      })
    );
    closeContextMenu();
  };

  return (
    <>
      <DropdownMenuItem onClick={onEditProperty}>
        <Edit2 className="h-4 w-4 mr-2" />
        Edit Property
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onCopyContent}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Content
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => {
          duplicate();
        }}
      >
        <CopyPlus className="h-4 w-4 mr-2" />
        Duplicate Row
      </DropdownMenuItem>

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
