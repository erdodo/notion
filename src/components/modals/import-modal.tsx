'use client';

import {
  Upload,
  FileText,
  Table,
  Archive,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImportModalProperties {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

type ImportType = 'markdown' | 'csv' | 'backup';

export function ImportModal({
  isOpen,
  onClose,
  parentId,
}: ImportModalProperties) {
  const router = useRouter();
  const [importType, setImportType] = useState<ImportType>('markdown');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    pageId?: string;
  } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setImporting(true);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (parentId) formData.append('parentId', parentId);

        let endpoint = '';
        switch (importType) {
          case 'markdown': {
            endpoint = '/api/import/markdown';
            break;
          }
          case 'csv': {
            endpoint = '/api/import/csv';
            break;
          }
          case 'backup': {
            endpoint = '/api/import/backup';
            break;
          }
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Import failed');
        }

        setResult({
          success: true,
          message: data.message || 'Import successful',
          pageId: data.pageId,
        });

        toast.success('Import successful');

        router.refresh();
      } catch (error) {
        console.error('Import error:', error);
        setResult({
          success: false,
          message: error instanceof Error ? error.message : 'Import failed',
        });
        toast.error('Import failed');
      } finally {
        setImporting(false);
      }
    },
    [importType, parentId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/html': ['.html'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
    disabled: importing,
  });

  const importTypes = [
    {
      id: 'markdown' as ImportType,
      label: 'Markdown',
      icon: FileText,
      accept: '.md',
      description: 'Import .md files as pages',
    },
    {
      id: 'csv' as ImportType,
      label: 'CSV',
      icon: Table,
      accept: '.csv',
      description: 'Import .csv files as database',
    },
    {
      id: 'backup' as ImportType,
      label: 'Backup',
      icon: Archive,
      accept: '.zip',
      description: 'Restore from backup file',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => !importing && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {}
          <div className="flex gap-2">
            {importTypes.map((type) => (
              <Button
                key={type.id}
                variant={importType === type.id ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setImportType(type.id);
                }}
                disabled={importing}
              >
                <type.icon className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>

          {}
          <p className="text-sm text-muted-foreground">
            {importTypes.find((t) => t.id === importType)?.description}
          </p>

          {}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
              importing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />

            {importing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p>Importing...</p>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <p className="text-green-600">{result.message}</p>
                    {result.pageId && (
                      <Button
                        variant="link"
                        onClick={() => {
                          router.push(`/documents/${result.pageId}`);
                          onClose();
                        }}
                      >
                        Open imported page
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="h-10 w-10 text-red-500" />
                    <p className="text-red-600">{result.message}</p>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResult(null);
                  }}
                >
                  Import another
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag & drop a file here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted:{' '}
                  {importTypes.find((t) => t.id === importType)?.accept}
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
