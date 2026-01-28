'use client';

import { useRef, useState } from 'react';

import { CoreEditor } from './core-editor';
import { SlashCommandManager } from './slash-command-manager';
import { DragDropManager } from './drag-drop-manager';
import { ThemeManager } from './theme-manager';

interface BlockNoteEditorProperties {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  documentId?: string;
  disableCollaboration?: boolean;
}

export const BlockNoteEditorComponent = ({
  initialContent,
  onChange,
  editable = true,
  documentId,
  disableCollaboration = false,
}: BlockNoteEditorProperties) => {
  const editorWrapperReference = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleMentionSelect = (pageId: string) => {
    if (!editorInstance) return;

    const currentBlock = editorInstance.getTextCursorPosition().block;

    editorInstance.replaceBlocks(
      [currentBlock],
      [
        {
          type: 'pageMention',
          props: { pageId },
        } as any,
      ]
    );
  };

  return (
    <div
      ref={editorWrapperReference}
      className={`blocknote-editor relative rounded-md transition-colors`}
    >
      <CoreEditor
        initialContent={initialContent}
        onChange={onChange}
        editable={editable}
        documentId={documentId}
        disableCollaboration={disableCollaboration}
        onEditorReady={setEditorInstance}
      />

      {editorInstance && (
        <>
          <SlashCommandManager
            editor={editorInstance}
            documentId={documentId}
            onMentionSelect={handleMentionSelect}
          />

          <DragDropManager editor={editorInstance} documentId={documentId} />

          <ThemeManager />
        </>
      )}
    </div>
  );
};
