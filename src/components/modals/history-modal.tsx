'use client';

import { formatDistanceToNow } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getPageHistory, restorePage } from '@/app/(main)/_actions/documents';
import { BlockNoteEditorComponent } from '@/components/editor/blocknote-editor';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHistory } from '@/hooks/use-history';

interface Page {
  id: string;
  title?: string;
  icon?: string | null;
  parentId?: string | null;
  content?: string;
  savedAt: string | Date;
  user: {
    image?: string | null;
    name?: string | null;
  };
}

export const HistoryModal = () => {
  const history = useHistory();

  const [versions, setVersions] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState<Page | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (history.isOpen && history.documentId) {
        setLoading(true);
        try {
          const data = await getPageHistory(history.documentId);
          setVersions(data as any);
          if (data.length > 0) setSelectedVersion(data[0] as any);
        } catch {
          toast.error('Failed to load history');
        } finally {
          setLoading(false);
        }
      }
    };

    loadHistory();
  }, [history.isOpen, history.documentId]);

  const onRestore = async () => {
    if (!selectedVersion || !history.documentId) return;

    const promise = restorePage(history.documentId, selectedVersion.id);

    toast.promise(promise, {
      loading: 'Restoring version...',
      success: () => {
        history.onClose();
        return 'Page restored!';
      },
      error: 'Failed to restore',
    });
  };

  if (!history.isOpen) return null;

  return (
    <Dialog open={history.isOpen} onOpenChange={history.onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b pb-2 hidden">
          <DialogTitle>Page History</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 h-full overflow-hidden">
          {}
          <div className="w-64 border-r overflow-y-auto bg-secondary/30">
            <div className="p-4 border-b font-medium text-sm">
              Version History
            </div>
            {loading && (
              <div className="p-4 text-xs text-muted-foreground">
                Loading...
              </div>
            )}

            {!loading && versions.length === 0 && (
              <div className="p-4 text-xs text-muted-foreground">
                No history found.
              </div>
            )}

            {versions.map((version) => (
              <div
                key={version.id}
                onClick={() => {
                  setSelectedVersion(version);
                }}
                className={`p-3 border-b text-sm cursor-pointer hover:bg-secondary/50 transition-colors ${selectedVersion?.id === version.id ? 'bg-secondary' : ''}`}
              >
                <div className="font-medium">
                  {formatDistanceToNow(new Date(version.savedAt), {
                    addSuffix: true,
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={version.user.image || undefined} />
                    <AvatarFallback>{version.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{version.user.name}</span>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
            <div className="p-4 border-b flex items-center justify-between bg-background z-10">
              <span className="font-medium">
                {selectedVersion ? 'Preview' : 'Select a version'}
              </span>
              <Button size="sm" onClick={onRestore} disabled={!selectedVersion}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore this version
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none">
              {selectedVersion?.content ? (
                <div className="pl-4">
                  <BlockNoteEditorComponent
                    editable={false}
                    initialContent={selectedVersion.content}
                    onChange={() => {}}
                    disableCollaboration={true}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a version to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
