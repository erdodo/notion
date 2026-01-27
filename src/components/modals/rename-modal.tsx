'use client';

import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRenameModal } from '@/hooks/use-rename-modal';

export const RenameModal = () => {
  const { isOpen, onClose, documentId, initialTitle } = useRenameModal();
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const { mutate: update, isPending } = useMutation({
    mutationFn: async () => {
      await updateDocument(documentId, { title: title || 'Untitled' });
    },
    onSuccess: () => {
      toast.success('Renamed successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to rename');
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      update();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Rename Page</DialogTitle>
          <DialogDescription>Enter a new name for this page.</DialogDescription>
        </DialogHeader>
        <div className="my-2">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              update();
            }}
            disabled={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
