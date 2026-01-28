'use client';

import { PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { createReactBlockSpec, useCreateBlockNote } from '@blocknote/react';
import { useTheme } from 'next-themes';
import { useState, useMemo, useEffect, useCallback } from 'react';

import { cn } from '@/lib/utils';

const ResizeHandle = ({
  onMouseDown,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className="w-1 cursor-col-resize hover:bg-primary/50 transition-colors h-auto mx-1 rounded"
      onMouseDown={onMouseDown}
    />
  );
};

const GridColumn = ({
  initialContentJSON,
  onContentChange,
  editorSchema,
  readOnly = false,
  className,
  width,
}: {
  initialContentJSON: string;
  onContentChange: (json: string) => void;
  editorSchema: any;
  readOnly?: boolean;
  className?: string;
  width?: number;
}) => {
  const { resolvedTheme } = useTheme();

  const initialContent = useMemo(() => {
    try {
      const parsed = JSON.parse(initialContentJSON) as PartialBlock[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const clean = { ...p };
          if (clean.type === 'image') {
            delete clean.content;

            if (!clean.props) clean.props = { url: '' };
          }

          if ((clean as any).type === 'inlineDatabase') {
            delete (clean as any).content;
            if (!(clean as any).props)
              (clean as any).props = { linkedDatabaseId: '' };
          }
          return clean;
        });
      }
      return;
    } catch {
      return;
    }
  }, [initialContentJSON]);

  const nestedEditor = useCreateBlockNote({
    schema: editorSchema,
    initialContent: initialContent,
  });

  const handleChange = () => {
    if (!nestedEditor) return;
    const json = JSON.stringify(nestedEditor.document);
    if (json !== initialContentJSON) {
      onContentChange(json);
    }
  };

  return (
    <div
      className={cn('flex-1 min-w-[50px] relative group/col', className)}
      style={{
        width: width ? `${width}%` : undefined,
        flex: width ? `0 0 ${width}%` : 1,
      }}
    >
      <BlockNoteView
        editor={nestedEditor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        onChange={handleChange}
        editable={!readOnly}
        className="min-h-[2rem]"
        sideMenu={false}
      />
    </div>
  );
};

export const GridBlock = createReactBlockSpec(
  {
    type: 'grid',
    propSchema: {
      columns: { default: 2 },

      col1: { default: '[]' },
      col2: { default: '[]' },
      col3: { default: '[]' },
      col4: { default: '[]' },
      col5: { default: '[]' },
      col6: { default: '[]' },

      widths: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      return <GridBlockComponent block={block as any} editor={editor as any} />;
    },
  }
);

function GridBlockComponent({ block, editor }: { block: any; editor: any }) {
  const cols = Math.min(Math.max((block.props as any).columns || 2, 2), 6);

  const [colWidths, setColWidths] = useState<number[]>(() => {
    const w = (block.props as any).widths
      ? (block.props as any).widths.split(',').map(Number)
      : [];
    if (w.length === cols) return w;

    return new Array(cols).fill(100 / cols);
  });

  useEffect(() => {
    const w = (block.props as any).widths
      ? (block.props as any).widths.split(',').map(Number)
      : [];
    if (w.length === cols && w.join(',') !== colWidths.join(',')) {
      setColWidths(w);
    }
  }, [(block.props as any).widths, cols, colWidths]);

  const updateColumn = (index: number, contentJSON: string) => {
    const propertyKey = `col${index + 1}`;
    if ((block.props as any)[propertyKey] !== contentJSON) {
      editor.updateBlock(block as any, {
        props: { [propertyKey]: contentJSON },
      });
    }
  };

  const handleResize = useCallback(
    (index: number, deltaPercent: number) => {
      const newWidths = [...colWidths];

      const left = index;
      const right = index + 1;

      if (
        newWidths[left] + deltaPercent < 5 ||
        newWidths[right] - deltaPercent < 5
      )
        return;

      newWidths[left] += deltaPercent;
      newWidths[right] -= deltaPercent;

      setColWidths(newWidths);
    },
    [colWidths]
  );

  const saveWidths = useCallback(() => {
    editor.updateBlock(block as any, {
      props: { widths: colWidths.join(',') },
    });
  }, [editor, block, colWidths]);

  const [isResizing, setIsResizing] = useState<number | null>(null);
  const startX = useMemo(() => ({ value: 0 }), []);

  useEffect(() => {
    if (isResizing === null) return;

    const onMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - startX.value;

      const deltaPercent = (deltaPx / window.innerWidth) * 200;

      if (Math.abs(deltaPercent) > 0.5) {
        handleResize(isResizing, deltaPercent);
        startX.value = e.clientX;
      }
    };

    const onUp = () => {
      saveWidths();
      setIsResizing(null);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, handleResize, saveWidths, startX]);

  return (
    <div
      className="my-2 w-full flex relative select-none"
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      {Array.from({ length: cols }).map((_, index) => {
        const propertyKey = `col${index + 1}`;
        const content = (block.props as any)[propertyKey] as string;
        const width = colWidths[index];

        return (
          <div
            key={index}
            className="flex flex-1"
            style={{ width: `${width}%`, flex: `0 0 ${width}%` }}
          >
            <GridColumn
              initialContentJSON={content}
              onContentChange={(json) => {
                updateColumn(index, json);
              }}
              editorSchema={editor.schema}
              readOnly={!editor.isEditable}
              width={100}
              className="border-none bg-transparent pl-2"
            />
            {index < cols - 1 && (
              <ResizeHandle
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startX.value = e.clientX;
                  setIsResizing(index);
                  document.body.style.cursor = 'col-resize';
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
