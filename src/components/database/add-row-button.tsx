import { Plus } from 'lucide-react';

import { addRow } from '@/app/(main)/_actions/database';

interface AddRowButtonProperties {
  databaseId: string;
  onAdd?: () => void;
}

export function AddRowButton({ databaseId, onAdd }: AddRowButtonProperties) {
  const onClick = async () => {
    try {
      await addRow(databaseId);
      onAdd?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="flex items-center text-muted-foreground hover:bg-muted/50 cursor-pointer p-2 text-sm select-none"
      onClick={onClick}
    >
      <Plus className="h-4 w-4 mr-2" />
      New
    </div>
  );
}
