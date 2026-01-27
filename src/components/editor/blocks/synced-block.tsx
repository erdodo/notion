'use client';

import { createReactBlockSpec } from '@blocknote/react';
import dynamic from 'next/dynamic';

const SyncedBlockView = dynamic(
  () =>
    import('./synced-block-view').then((module_) => module_.SyncedBlockView),
  {
    ssr: false,
    loading: () => (
      <div className="p-2 border border-red-200 rounded text-xs text-red-500">
        Loading Synced Block...
      </div>
    ),
  }
);

export const SyncedBlock = createReactBlockSpec(
  {
    type: 'syncedBlock',
    propSchema: {
      sourcePageId: {
        default: '',
      },
      sourceBlockId: {
        default: '',
      },
      childrenJSON: {
        default: '[]',
      },
    },
    content: 'none',
  },
  {
    render: (properties) => {
      return (
        <SyncedBlockView block={properties.block} editor={properties.editor} />
      );
    },
  }
);
