'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toggle, ToggleSummary, ToggleContent } from './extensions/toggle';
import { Callout } from './extensions/callout';
import { PageLink } from './extensions/page-link';
import { Columns, Column } from './extensions/columns';
import { useEffect } from 'react';

interface EditorProperties {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export const Editor = ({
  initialContent = '',
  onChange,
  editable = true,
}: EditorProperties) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Toggle,
      ToggleSummary,
      ToggleContent,
      Callout,
      PageLink,
      Columns,
      Column,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable,
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <EditorContent editor={editor} />
    </div>
  );
};
