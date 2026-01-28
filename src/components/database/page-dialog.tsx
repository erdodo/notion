'use client';

import { Page, Database, DatabaseRow } from '@prisma/client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState, useEffect } from 'react';

import { PageRenderer } from '../page/page-renderer';

import { DatabaseView } from './database-view';

import { getDatabase } from '@/app/(main)/_actions/database';
import { getDocument } from '@/app/(main)/_actions/documents';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface PageDialogProperties {
  pageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageDialog({
  pageId,
  open,
  onOpenChange,
}: PageDialogProperties) {
  const [page, setPage] = useState<(Page & { databaseRow: DatabaseRow | null }) | null>(null);
  const [database, setDatabase] = useState<Database | null>(null);
  const [row, setRow] = useState<DatabaseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!pageId || !open) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const pageData = await getDocument(pageId);
        if (!pageData) {
          setPage(null);
          return;
        }

        setPage(pageData);

        if (pageData.isDatabase) {
          const databaseData = await getDatabase(pageId);
          setDatabase(databaseData);
        }

        if (pageData.databaseRow) {
          setRow(pageData.databaseRow);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pageId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{page?.title || 'Page'}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : page ? (
          <div className="p-8">
            {page.isDatabase && database ? (
              <DatabaseView database={database as any} page={page} />
            ) : (
              <PageRenderer page={page} row={row as any} />
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Page not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
