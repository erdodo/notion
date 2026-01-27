'use client';

import { defaultProps } from '@blocknote/core';
import { createReactBlockSpec, ToggleWrapper } from '@blocknote/react';

export const ToggleBlock = createReactBlockSpec(
  {
    type: 'toggle',
    propSchema: {
      ...defaultProps,
    },
    content: 'inline',
  },
  {
    render: (properties) => {
      return (
        <>
          <ToggleWrapper block={properties.block} editor={properties.editor}>
            <div
              className="flex-1 min-w-0 min-h-[24px]"
              ref={properties.contentRef}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </ToggleWrapper>
        </>
      );
    },
  }
);
