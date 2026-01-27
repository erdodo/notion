'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

interface Block {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: Block[];
}

function findBlockRecursive(blocks: Block[], blockId: string): Block | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    if (block.children) {
      const found = findBlockRecursive(block.children, blockId);
      if (found) return found;
    }
  }
  return null;
}

function updateBlockRecursive(
  blocks: Block[],
  blockId: string,
  newContent: Block[]
): boolean {
  for (const block of blocks) {
    if (block.id === blockId) {
      if (block.type === 'syncedBlock') {
        block.props = {
          ...block.props,
          childrenJSON: JSON.stringify(newContent),
        };
      } else {
        block.children = newContent;
      }
      return true;
    }
    if (
      block.children &&
      updateBlockRecursive(block.children, blockId, newContent)
    ) {
      return true;
    }
  }
  return false;
}

export async function getBlock(pageId: string, blockId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const page = await db.page.findUnique({
    where: { id: pageId },
    select: { content: true, userId: true, shares: true },
  });

  if (!page) return null;

  if (!page.content) return null;

  const blocks = JSON.parse(page.content);
  const block = findBlockRecursive(blocks, blockId);

  return block;
}

export async function updateSyncedBlockContent(
  pageId: string,
  blockId: string,
  newChildren: Block[]
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const page = await db.page.findUnique({
    where: { id: pageId },
  });

  if (!page?.content) throw new Error('Page not found or empty');

  const blocks = JSON.parse(page.content);
  const updated = updateBlockRecursive(blocks, blockId, newChildren);

  if (updated) {
    await db.page.update({
      where: { id: pageId },
      data: { content: JSON.stringify(blocks) },
    });
    return { success: true };
  }

  return { success: false, error: 'Block not found' };
}
