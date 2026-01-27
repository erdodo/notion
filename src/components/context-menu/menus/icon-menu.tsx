'use client';

import { useMutation } from '@tanstack/react-query';
import { Smile, Shuffle, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { updateDocument } from '@/app/(main)/_actions/documents';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface IconMenuProperties {
  data: {
    id: string;
    onRemoveIcon?: () => void;
  };
}

export const IconMenu = ({ data }: IconMenuProperties) => {
  const { closeContextMenu } = useContextMenuStore();

  const { mutate: update } = useMutation({
    mutationFn: (icon: string | null) =>
      updateDocument(data.id, { icon: icon || undefined }),
    onSuccess: () => {
      toast.success('Icon updated');
      closeContextMenu();
    },
    onError: () => {
      toast.error('Failed to update icon');
      closeContextMenu();
    },
  });

  const onRandom = () => {
    const emojis = [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '😂',
      '🤣',
      '😊',
      '😇',
      '🚀',
      '💻',
      '🎨',
      '🎉',
      '🔥',
      '✨',
    ];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    update(randomEmoji);
  };

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          toast.info('Please click the icon directly to change it');
          closeContextMenu();
        }}
      >
        <Smile className="h-4 w-4 mr-2" />
        Change
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onRandom}>
        <Shuffle className="h-4 w-4 mr-2" />
        Random
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => {
          if (data.onRemoveIcon) {
            data.onRemoveIcon();
          } else {
            update('');
          }
          closeContextMenu();
        }}
      >
        <Trash className="h-4 w-4 mr-2" />
        Remove
      </DropdownMenuItem>
    </>
  );
};
