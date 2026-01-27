import { Database } from '@prisma/client';
import { Database as DatabaseIcon, Plus, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DataSourceDialogProperties {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDatabaseId: string;
}

export function DataSourceDialog({
  open,
  onOpenChange,
  currentDatabaseId,
}: DataSourceDialogProperties) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchDatabases();
    }
  }, [open]);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/databases');
      const data = await response.json();
      setDatabases(data);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDatabase = (databaseId: string) => {
    router.push(`/documents/${databaseId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage data sources</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Source
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-1">
                {databases.map((database) => (
                  <button
                    key={database.id}
                    onClick={() => {
                      handleSelectDatabase(database.id);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors ${
                      database.id === currentDatabaseId ? 'bg-secondary' : ''
                    }`}
                  >
                    <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">
                      {database.title || 'Untitled'}
                    </span>
                    {database.id === currentDatabaseId && (
                      <span className="text-xs text-muted-foreground">
                        Current
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="space-y-2 pt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Add data source
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              <LinkIcon className="h-4 w-4" />
              Link existing data source
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
