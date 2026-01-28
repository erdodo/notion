import { PartialBlock, BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import {
  getBlock,
  updateSyncedBlockContent,
} from '@/app/(main)/_actions/blocks';

interface SyncedBlockProperties {
  block: PartialBlock;
  editor: BlockNoteEditor;
}

export const SyncedBlockView = ({ block, editor }: SyncedBlockProperties) => {
  const { sourcePageId, sourceBlockId, childrenJSON } = (block.props ||
    {}) as any;
  const { resolvedTheme } = useTheme();

  const isMaster = !sourcePageId || !sourceBlockId;

  const [loading, setLoading] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<PartialBlock[] | null>(
    null
  );

  const initialContent = useMemo(() => {
    try {
      return JSON.parse(childrenJSON) as PartialBlock[];
    } catch (error) {
      console.error('Failed to parse synced block content', error);
      return undefined;
    }
  }, [childrenJSON]);

  const nestedEditor = useCreateBlockNote({
    schema: editor.schema,
    initialContent: initialContent,
  });

  const fetchContent = useCallback(async () => {
    if (isMaster || !sourcePageId || !sourceBlockId) return;

    if (!fetchedContent) setLoading(true);

    try {
      const data = await getBlock(sourcePageId, sourceBlockId);
      if (data?.props?.childrenJSON) {
        try {
          const parameters = JSON.parse(data.props.childrenJSON as string);

          setFetchedContent((previous) => {
            if (JSON.stringify(previous) === (data.props as any)?.childrenJSON)
              return previous;
            return parameters;
          });
        } catch (error) {
          console.error('Parse error', error);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isMaster, sourcePageId, sourceBlockId, fetchedContent]);

  useEffect(() => {
    if (!isMaster && sourcePageId && sourceBlockId) {
      fetchContent();

      const interval = setInterval(fetchContent, 3000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isMaster, sourcePageId, sourceBlockId, fetchContent]);

  useEffect(() => {
    if (nestedEditor && fetchedContent) {
      const currentJSON = JSON.stringify(nestedEditor.document);
      const newJSON = JSON.stringify(fetchedContent);

      if (currentJSON !== newJSON) {
        nestedEditor.replaceBlocks(nestedEditor.document, fetchedContent);
      }
    }
  }, [fetchedContent, nestedEditor]);

  const handleChange = async () => {
    if (!nestedEditor) return;

    const currentContent = nestedEditor.document;
    const contentString = JSON.stringify(currentContent);

    if (isMaster) {
      if (contentString !== childrenJSON) {
        editor.updateBlock(block as any, {
          props: { childrenJSON: contentString },
        });
      }
    } else {
      updateSyncedBlockContent(sourcePageId, sourceBlockId, currentContent);
    }
  };
  const copyLink = () => {
    const path = globalThis.location.pathname;
    const match = /\/documents\/([^/]+)/.exec(path);
    const currentPageId = match ? match[1] : '';

    if (!currentPageId) {
      toast.error('Could not determine Page ID');
      return;
    }

    const currentBlocks = nestedEditor ? nestedEditor.document : [];
    const currentContent = JSON.stringify(currentBlocks);

    const syncData = {
      sourcePageId: sourcePageId || currentPageId,
      sourceBlockId: block.id,
      childrenJSON: currentContent,
    };

    const clipboardText = JSON.stringify(syncData);
    navigator.clipboard.writeText(clipboardText);
    toast.success('Synced Block Reference copied!');
  };

  return (
    <div
      className={`synced-block group relative rounded border transition-colors w-full ${isMaster ? 'border-red-400 bg-red-50/10' : 'border-red-400 border-dashed bg-transparent'}`}
    >
      {}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-red-400 select-none bg-red-50/50 dark:bg-red-900/20 rounded-t">
        <span className="flex items-center gap-1 font-medium">
          <RefreshCw
            size={11}
            className={`cursor-pointer hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              fetchContent();
            }}
          />
          {isMaster ? 'Synced Block (Original)' : 'Synced Block (Mirror)'}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyLink}
            className="hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded"
            title="Copy sync reference"
          >
            <Copy size={11} />
          </button>
          {!isMaster && (
            <a
              href={`/documents/${sourcePageId}`}
              target="_blank"
              className="hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded"
              title="Go to original"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {}
      <div
        className="p-1"
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <BlockNoteView
          editor={nestedEditor}
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          onChange={handleChange}
          className="min-h-[2rem]"
        />
      </div>
    </div>
  );
};
