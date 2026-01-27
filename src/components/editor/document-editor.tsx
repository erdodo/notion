'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { useSocket } from '@/components/providers/socket-provider';

const BlockNoteEditorComponent = dynamic(
  () =>
    import('./blocknote-editor').then(
      (module_) => module_.BlockNoteEditorComponent
    ),
  { ssr: false }
);

interface DocumentEditorProperties {
  documentId: string;
  initialContent?: string | null;
  editable?: boolean;
}

export default function DocumentEditor({
  documentId,
  initialContent,
  editable = true,
}: DocumentEditorProperties) {
  const [content, setContent] = useState(initialContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', `document-${documentId}`);

    socket.on('doc:update', (payload: { updates?: { content?: string } }) => {
      if (payload?.updates?.content && payload.updates.content !== content) {
        setContent(payload.updates.content);
      }
    });

    return () => {
      socket.emit('leave-room', `document-${documentId}`);
      socket.off('doc:update');
    };
  }, [documentId, content, socket]);

  const debouncedSave = useDebouncedCallback(async (newContent: string) => {
    if (!editable) return;

    setIsSaving(true);
    try {
      await updateDocument(documentId, { content: newContent });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  }, 2000);

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!editable) return;
      // Do not update local state immediately to avoid editor re-render/cursor reset
      // setContent(newContent)
      debouncedSave(newContent);
    },
    [debouncedSave, editable]
  );

  return (
    <div className="relative">
      {}
      {editable && (
        <div className="absolute top-0 right-0 text-xs text-muted-foreground">
          {isSaving && <span>Saving...</span>}
          {!isSaving && lastSaved && <span>Saved</span>}
        </div>
      )}

      <BlockNoteEditorComponent
        initialContent={content}
        onChange={handleContentChange}
        editable={editable}
        documentId={documentId}
      />
    </div>
  );
}
