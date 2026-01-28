'use client';

import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import '@blocknote/mantine/style.css';

import { useOptionalCollaboration } from '@/components/providers/collaboration-provider';
import { useEdgeStore } from '@/lib/edgestore';
import { schema } from './schema';

interface CoreEditorProperties {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  documentId?: string;
  disableCollaboration?: boolean;
  onEditorReady?: (editor: any) => void;
}

export const CoreEditor = ({
  initialContent,
  onChange,
  editable = true,
  documentId,
  disableCollaboration = false,
  onEditorReady,
}: CoreEditorProperties) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [mounted, setMounted] = useState(false);

  const parsedContent = useMemo(() => {
    if (!initialContent) return;
    try {
      return JSON.parse(initialContent);
    } catch (error) {
      console.error('Error parsing initial content:', error);
      return;
    }
  }, [initialContent]);

  const collaboration = useOptionalCollaboration();

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    uploadFile: async (file: File) => {
      const res = await edgestore.editorMedia.upload({ file });
      return res.url;
    },
    collaboration:
      !disableCollaboration && collaboration
        ? {
            provider: collaboration.provider,
            fragment: collaboration.yDoc.getXmlFragment('document-store'),
            user: {
              name: collaboration.user?.name || 'Anonymous',
              color: collaboration.user?.color || '#505050',
            },
          }
        : undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  const handleEditorChange = () => {
    const blocks = editor.document;
    const jsonContent = JSON.stringify(blocks);
    onChange(jsonContent);
  };

  if (!mounted) {
    return null;
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      onChange={handleEditorChange}
      slashMenu={false}
      formattingToolbar={false}
      data-background-color-support="true"
    />
  );
};
