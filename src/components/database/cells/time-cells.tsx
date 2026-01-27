import { format } from 'date-fns';

import { CellProps as CellProperties } from './types';

export function CreatedTimeCell({ row }: CellProperties) {
  const value = row?.original?.originalRow?.createdAt;

  if (!value)
    return (
      <div className="text-xs text-muted-foreground pl-2 h-full flex items-center">
        -
      </div>
    );

  let formattedDate;
  try {
    formattedDate = format(new Date(value), 'MMM d, yyyy HH:mm');
  } catch {
    formattedDate = '-';
  }

  return (
    <div className="px-2 h-full flex items-center text-sm text-muted-foreground whitespace-nowrap">
      {formattedDate}
    </div>
  );
}

export function UpdatedTimeCell({ row }: CellProperties) {
  const value = row?.original?.originalRow?.updatedAt;

  if (!value)
    return (
      <div className="text-xs text-muted-foreground pl-2 h-full flex items-center">
        -
      </div>
    );

  let formattedDate;
  try {
    formattedDate = format(new Date(value), 'MMM d, yyyy HH:mm');
  } catch {
    formattedDate = '-';
  }

  return (
    <div className="px-2 h-full flex items-center text-sm text-muted-foreground whitespace-nowrap">
      {formattedDate}
    </div>
  );
}
