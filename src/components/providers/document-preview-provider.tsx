'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Maximize2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { getDatabase } from '@/app/(main)/_actions/database';
import { getDocument } from '@/app/(main)/_actions/documents';
import { DatabaseView } from '@/components/database/database-view';
import { PageRenderer } from '@/components/page/page-renderer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreview } from '@/hooks/use-preview';

// Content component'ini render dışına taşıdık
interface ContentProps {
  loading: boolean;
  page: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  database: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  row: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const Content = ({ loading, page, database, row }: ContentProps) => {
  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!page)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Page not found
      </div>
    );

  return (
    <div className="h-full overflow-auto">
      {page.isDatabase && database ? (
        <DatabaseView database={database} page={page} />
      ) : (
        <PageRenderer page={page} row={row} isPreview={false} />
      )}
    </div>
  );
};

export const DocumentPreviewProvider = () => {
  const { isOpen, onClose, documentId, mode } = usePreview();
  const router = useRouter();
  const [page, setPage] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [database, setDatabase] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [row, setRow] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Async fonksiyon içinde tüm state güncellemelerini yönetiyoruz
    const fetchData = async () => {
      if (isOpen && documentId) {
        setLoading(true);

        try {
          const pageData = await getDocument(documentId);

          if (!pageData) {
            setPage(null);
            setLoading(false);
            return;
          }

          setPage(pageData);

          if (pageData.isDatabase) {
            const databaseData = await getDatabase(documentId);
            setDatabase(databaseData);
          }

          if (pageData.databaseRow) {
            const rowData = pageData.databaseRow;
            setRow(rowData);

            if (rowData.databaseId) {
              const databaseData = await getDatabase(rowData.databaseId);
              setRow({ ...rowData, database: databaseData });
            }
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching page:', error);
          setLoading(false);
        }
      } else {
        setPage(null);
        setDatabase(null);
        setRow(null);
      }
    };

    fetchData();
  }, [isOpen, documentId]);

  const handleOpenFullPage = () => {
    if (documentId) {
      onClose();
      router.push(`/documents/${documentId}`);
    }
  };

  if (mode === 'center') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{page?.title || 'Page'}</DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          {}
          <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
            <button
              onClick={handleOpenFullPage}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Open in full page</span>
            </button>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <Content
            loading={loading}
            page={page}
            database={database}
            row={row}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-xl md:max-w-2xl w-full border-l [&>button]:hidden"
      >
        <VisuallyHidden>
          <SheetHeader>
            <SheetTitle>{page?.title || 'Page'}</SheetTitle>
          </SheetHeader>
        </VisuallyHidden>
        {}
        <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
          <button
            onClick={handleOpenFullPage}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Open in full page</span>
          </button>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
        <Content loading={loading} page={page} database={database} row={row} />
      </SheetContent>
    </Sheet>
  );
};
