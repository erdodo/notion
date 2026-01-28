import path from 'node:path';

import { db as database } from '../../db';
import { Block } from '../../import/markdown-parser';
import { Template, TemplateContext } from '../types';
import { getTemplateBlocks } from '../utils';

const TEMPLATE_DIR = path.join(
  process.cwd(),
  'public',
  'templates',
  'Goal Setting and Vision Board Template'
);
const MAIN_FILE =
  'Goal Setting and Vision Board Template 2f46d7d7e05f80809fc8ccbd9545dafe.md';

export const goalSettingTemplate: Template = {
  id: 'goal-setting-vision-board',
  label: 'Goal Setting & Vision Board',
  icon: '🎯',
  description: 'Plan your life with clarity using this comprehensive template.',
  factory: async (context: TemplateContext): Promise<string> => {
    let pageId = context.targetPageId;

    const pageData = {
      title: 'Goal Setting & Vision Board',
      icon: '🎯',
      coverImage:
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3',
    };

    if (pageId) {
      await database.page.update({
        where: { id: pageId },
        data: pageData,
      });
    } else {
      const page = await database.page.create({
        data: {
          ...pageData,
          userId: context.userId,
          parentId: context.parentId || null,
        },
      });
      pageId = page.id;
    }

    const blocks = await getTemplateBlocks(
      TEMPLATE_DIR,
      MAIN_FILE,
      pageId,
      context.userId
    );

    const newBlocks: Block[] = [];
    let index = 0;

    while (index < blocks.length) {
      const block = blocks[index];

      if (block.type === 'inlineDatabase') {
        const buffer = [block];
        const next = blocks[index + 1];
        if (next?.type === 'inlineDatabase') {
          buffer.push(next);
          index += 2;

          newBlocks.push({
            type: 'grid',
            props: {
              columns: 2,
              col1: JSON.stringify([buffer[0]]),
              col2: JSON.stringify([buffer[1]]),
            },
          });
          continue;
        }
      }

      if (
        block.type === 'callout' ||
        (block.type === 'image' && block.props?.url && String(block.props.url).includes('gumroad'))
      ) {
        const buffer = [block];
        let lookahead = 1;
        while (index + lookahead < blocks.length) {
          const next = blocks[index + lookahead];
          if (
            next.type === 'callout' ||
            next.type === 'image' ||
            next.type === 'quote' ||
            (next.type === 'paragraph' && next.content && Array.isArray(next.content) && next.content.length === 0)
          ) {
            buffer.push(next);
            lookahead++;
          } else {
            break;
          }
        }

        if (buffer.length > 2) {
          index += lookahead;

          const col1: Block[] = [];
          const col2: Block[] = [];
          const col3: Block[] = [];

          for (const [index_, b] of buffer.entries()) {
            const colIndex = index_ % 3;
            if (colIndex === 0) col1.push(b);
            else if (colIndex === 1) col2.push(b);
            else col3.push(b);
          }

          newBlocks.push({
            type: 'grid',
            props: {
              columns: 3,
              col1: JSON.stringify(col1),
              col2: JSON.stringify(col2),
              col3: JSON.stringify(col3),
            },
          });
          continue;
        }
      }

      newBlocks.push(block);
      index++;
    }

    await database.page.update({
      where: { id: pageId },
      data: {
        content: JSON.stringify(newBlocks),
      },
    });

    return pageId;
  },
};
