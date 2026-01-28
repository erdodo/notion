import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  createStyleSpec,
} from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import dynamic from 'next/dynamic';

import { AudioBlock } from './blocks/audio-block';
import { BookmarkBlock } from './blocks/bookmark-block';
import { CalloutBlock } from './blocks/callout-block';
import { DividerBlock } from './blocks/divider-block';
import { EmbedBlock } from './blocks/embed-block';
import { FileBlock } from './blocks/file-block';
import { GridBlock } from './blocks/grid-block';
import { ImageBlock } from './blocks/image-block';
import { InlineDatabaseBlock } from './blocks/inline-database-block';
import { PageMentionBlock } from './blocks/page-mention-block';
import { QuoteBlock } from './blocks/quote-block';
import { TOCBlock } from './blocks/toc-block';
import { ToggleBlock } from './blocks/toggle-block';
import { VideoBlock } from './blocks/video-block';

const customStyleSpecs = {
  ...defaultStyleSpecs,

  code: createStyleSpec(
    {
      type: 'code',
      propSchema: 'boolean',
    },
    {
      render: () => {
        const code = document.createElement('code');
        code.className = 'bn-inline-code';
        return {
          dom: code,
        };
      },
    }
  ),

  textColor: createStyleSpec(
    {
      type: 'textColor',
      propSchema: 'string',
    },
    {
      render: (value) => {
        const span = document.createElement('span');
        span.dataset.textColor = value || 'default';
        return {
          dom: span,
        };
      },
    }
  ),

  backgroundColor: createStyleSpec(
    {
      type: 'backgroundColor',
      propSchema: 'string',
    },
    {
      render: (value) => {
        const span = document.createElement('span');
        span.dataset.backgroundColor = value || 'default';
        return {
          dom: span,
        };
      },
    }
  ),
};

const SyncedBlockView = dynamic(
  () =>
    import('./blocks/synced-block-view').then(
      (module_) => module_.SyncedBlockView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-2 border border-red-200 rounded text-xs text-red-500">
        Loading Synced Block...
      </div>
    ),
  }
);

const SyncedBlock = createReactBlockSpec(
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
        <SyncedBlockView
          block={properties.block as any}
          editor={properties.editor as any}
        />
      );
    },
  }
);

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,

    callout: CalloutBlock(),
    divider: DividerBlock(),
    quote: QuoteBlock(),
    toc: TOCBlock(),
    toggle: ToggleBlock(),
    bookmark: BookmarkBlock(),
    image: ImageBlock(),
    video: VideoBlock(),
    audio: AudioBlock(),
    file: FileBlock(),
    embed: EmbedBlock(),

    pageMention: PageMentionBlock(),
    inlineDatabase: InlineDatabaseBlock(),
    syncedBlock: SyncedBlock(),
    grid: GridBlock(),
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: customStyleSpecs,
});
