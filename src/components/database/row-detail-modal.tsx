'use client';

import { DatabaseRow, Cell, Property, Page, Database } from '@prisma/client';

import { PageRenderer } from '@/components/page/page-renderer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface RowDetailModalProperties {
  row: DatabaseRow & { cells: Cell[]; page: Page | null };
  database: Database & { properties: Property[] };
  isOpen: boolean;
  onClose: () => void;
}

export function RowDetailModal({
  row,
  database,
  isOpen,
  onClose,
}: RowDetailModalProperties) {
  if (!row.page) {
    return null;
  }

  const rowWithDatabase = {
    ...row,
    database: database,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none bg-background shadow-2xl">
        <DialogTitle className="sr-only">{row.page.title}</DialogTitle>

        <div className="flex-1 h-full overflow-hidden">
          <PageRenderer
            page={row.page}
            row={rowWithDatabase}
            isPreview={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
