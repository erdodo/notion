'use client';

import { DatabaseRow, Cell, Property, Page, Database } from '@prisma/client';

import { PageRenderer } from '@/components/page/page-renderer';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface RowDetailDrawerProperties {
  row: DatabaseRow & { cells: Cell[]; page: Page | null };
  database: Database & { properties: Property[] };
  isOpen: boolean;
  onClose: () => void;
}

export function RowDetailDrawer({
  row,
  database,
  isOpen,
  onClose,
}: RowDetailDrawerProperties) {
  if (!row.page) {
    return null;
  }

  const rowWithDatabase = {
    ...row,
    database: database,
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[900px] sm:w-[540px] md:w-[700px] lg:w-[900px] sm:max-w-none p-0 border-l border-border/50 bg-background shadow-2xl flex flex-col h-full">
        <SheetTitle className="sr-only">{row.page.title}</SheetTitle>
        <div className="flex-1 h-full overflow-hidden">
          <PageRenderer
            page={row.page}
            row={rowWithDatabase}
            isPreview={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
