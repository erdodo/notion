'use client';

import { createReactBlockSpec } from '@blocknote/react';

export const QuoteBlock = createReactBlockSpec(
  {
    type: 'quote',
    content: 'inline',
    propSchema: {},
  },
  {
    render: (properties) => (
      <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 my-2 italic text-muted-foreground bg-accent/20 py-2 rounded-r">
        <div className="flex-1 min-w-0" ref={properties.contentRef} />
      </div>
    ),
  }
);
