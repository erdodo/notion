'use client';

import { useMutation } from '@tanstack/react-query';
import { ImageIcon, Trash, Move } from 'lucide-react';
import { toast } from 'sonner';

import { updateDocument } from '@/app/(main)/_actions/documents';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useEdgeStore } from '@/lib/edgestore';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface CoverImageMenuProperties {
  data: {
    id: string;
    url?: string;
    onChangeCover?: () => void;
    onReposition?: () => void;
  };
}

export const CoverImageMenu = ({ data }: CoverImageMenuProperties) => {
  const { closeContextMenu } = useContextMenuStore();
  const { edgestore } = useEdgeStore();

  const { mutate: update } = useMutation({
    mutationFn: (url: string) => updateDocument(data.id, { coverImage: url }),
    onSuccess: () => {
      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to update cover');
    },
  });

  const onRemove = async () => {
    if (data.url) {
      try {
        await edgestore.coverImages.delete({ url: data.url });
      } catch (error) {
        console.error(error);
      }
    }
    update('');
    toast.success('Cover removed');
  };

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          if (data.onChangeCover) {
            data.onChangeCover();
          } else {
            toast.error('Action not available');
          }
          closeContextMenu();
        }}
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Change
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          if (data.onReposition) {
            data.onReposition();
          } else {
            toast.info('Reposition not available');
          }
          closeContextMenu();
        }}
      >
        <Move className="h-4 w-4 mr-2" />
        Reposition
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={onRemove}>
        <Trash className="h-4 w-4 mr-2" />
        Remove
      </DropdownMenuItem>
    </>
  );
};
