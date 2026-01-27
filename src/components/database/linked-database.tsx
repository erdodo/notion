import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { DatabaseView } from './database-view';

import { getDatabase } from '@/app/(main)/_actions/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedDatabase } from '@/hooks/use-filtered-sorted-data';

interface LinkedDatabaseProperties {
  linkedDb: {
    sourceDatabaseId: string;
    sourceDatabase?: DetailedDatabase;
    title?: string;
  };
  editable?: boolean;
  onDelete?: () => void | Promise<void>;
}

export function LinkedDatabaseView({
  linkedDb,
  editable = true,
  onDelete,
}: LinkedDatabaseProperties) {
  const [sourceDatabase, setSourceDatabase] = useState<DetailedDatabase | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatabase = async () => {
      if (linkedDb.sourceDatabase) {
        setSourceDatabase(linkedDb.sourceDatabase);
        setLoading(false);
        return;
      }

      try {
        const db = await getDatabase(linkedDb.sourceDatabaseId);
        setSourceDatabase(db);
      } finally {
        setLoading(false);
      }
    };

    loadDatabase();
  }, [linkedDb.sourceDatabaseId, linkedDb.sourceDatabase]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!sourceDatabase) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
        Source database not found or was deleted
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <button
          onClick={() =>
            (globalThis.location.href = `/documents/${sourceDatabase.pageId}`)
          }
          className="inline-flex items-center gap-2 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-sm group transition-colors"
        >
          {}
          <span className="text-xl">{sourceDatabase.page?.icon || '📊'}</span>
          <span className="font-medium group-hover:underline underline-offset-2">
            {}
            {linkedDb.title ||
              sourceDatabase.page?.title ||
              'Untitled Database'}
          </span>
        </button>

        <div className="flex items-center gap-1">
          {editable && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove linked database?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the linked database from this page. The
                    source database will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {}
      <DatabaseView database={sourceDatabase} />
    </div>
  );
}
