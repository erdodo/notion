'use client';

import { createReactBlockSpec } from '@blocknote/react';

export const DividerBlock = createReactBlockSpec(
  {
    type: 'divider',
    content: 'none',
    propSchema: {
      style: {
        default: 'solid',
        values: ['solid', 'dashed', 'dotted'],
      },
    },
  },
  {
    render: (properties) => (
      <div className="py-2 cursor-pointer group w-full" contentEditable={false}>
        <hr
          className={`w-full border-t-2 border-border group-hover:border-primary/50 transition-colors
              ${properties.block.props.style === 'dashed' ? 'border-dashed' : ''} 
              ${properties.block.props.style === 'dotted' ? 'border-dotted' : ''}
              ${properties.block.props.style === 'solid' ? 'border-solid' : ''}
            `}
        />
      </div>
    ),
  }
);
