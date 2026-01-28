'use client';

import { Block, BlockNoteEditor } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { LinkedDatabase as LinkedDatabaseType } from '@prisma/client';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { getLinkedDatabase } from '@/app/(main)/_actions/database';
import { LinkedDatabaseView } from '@/components/database/linked-database';
import { Skeleton } from '@/components/ui/skeleton';

interface InlineDatabaseProps {
  linkedDatabaseId: string;
  editor: BlockNoteEditor;
  block: Block;
}

const InlineDatabase = ({
  linkedDatabaseId,
  editor,
  block,
}: InlineDatabaseProps) => {
  const [linkedDatabase, setLinkedDatabase] =
    useState<LinkedDatabaseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkedDatabaseId) {
      setLoading(false);
      setError('No database ID');
      return;
    }

    getLinkedDatabase(linkedDatabaseId)
      .then((data) => {
        if (data) {
          setLinkedDatabase(data);
        } else {
          setError('Database not found');
        }
      })
      .catch((error_) => {
        setError(error_.message || 'Failed to load database');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [linkedDatabaseId]);

  return (
    <div contentEditable={false} className="my-4 w-full">
      {loading && (
        <div className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && !loading && (
        <div className="border border-destructive/50 rounded-lg p-4 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {linkedDatabase && !loading && !error && (
        <LinkedDatabaseView
          linkedDb={linkedDatabase}
          editable={true}
          onDelete={async () => {
            editor.removeBlocks([block]);

            const { deleteLinkedDatabase } =
              await import('@/app/(main)/_actions/database');
            await deleteLinkedDatabase(linkedDatabase.id);
          }}
        />
      )}
    </div>
  );
};

export const InlineDatabaseBlock = createReactBlockSpec(
  {
    type: 'inlineDatabase',
    content: 'none',
    propSchema: {
      linkedDatabaseId: {
        default: '',
      },
    },
  },
  {
    render: ({ block, editor }) => {
      return (
        <InlineDatabase
          linkedDatabaseId={block.props.linkedDatabaseId}
          editor={editor as any}
          block={block as any}
        />
      );
    },
  }
);
