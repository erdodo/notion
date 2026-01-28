'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useState, useEffect } from 'react';

export const TOCBlock = createReactBlockSpec(
  {
    type: 'toc',
    content: 'none',
    propSchema: {},
  },
  {
    render: (properties) => {
      return <TOCBlockComponent {...properties} />;
    },
  }
);

function TOCBlockComponent({ editor }: { editor: any }) {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number; blockId: string }[]
  >([]);

  useEffect(() => {
    const updateHeadings = () => {
      const document_ = editor.document;
      const newHeadings: typeof headings = [];

      for (const block of document_) {
        if (block.type === 'heading') {
          const level = (
            block.props as {
              level: number;
            }
          ).level;
          const content = block.content as { text: string }[];

          const text = content.map((c) => c.text).join('');

          if (text) {
            newHeadings.push({
              id: block.id,
              text,
              level,
              blockId: block.id,
            });
          }
        }
      }

      setHeadings((previous) =>
        JSON.stringify(previous) === JSON.stringify(newHeadings)
          ? previous
          : newHeadings
      );
    };

    updateHeadings();
    const interval = setInterval(updateHeadings, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [editor]);

  return (
    <div
      className="bg-muted/30 p-4 rounded-lg my-2 w-full"
      contentEditable={false}
    >
      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
        {' '}
        Table of Contents{' '}
      </p>
      {headings.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {' '}
          No headings found.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {headings.map((h) => (
            <div
              key={h.blockId}
              className="text-sm hover:underline cursor-pointer text-blue-600 dark:text-blue-400 select-none"
              style={{ marginLeft: `${(h.level - 1) * 1.5}rem` }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                const element = document.querySelector(
                  `[data-id="${h.blockId}"]`
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }
              }}
            >
              {h.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
