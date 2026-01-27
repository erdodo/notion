import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as BlockActions from '@/app/(main)/_actions/blocks';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    page: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('Block Actions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockSession = {
    user: mockUser,
  };

  const mockBlocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      props: { textColor: 'default' },
      children: [
        {
          id: 'block-2',
          type: 'paragraph',
          children: [],
        },
      ],
    },
    {
      id: 'synced-1',
      type: 'syncedBlock',
      props: {
        childrenJSON: '[]',
      },
      children: [],
    },
  ];

  const mockPage = {
    id: 'page-1',
    userId: 'user-1',
    content: JSON.stringify(mockBlocks),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  describe('getBlock', () => {
    beforeEach(() => {
      vi.mocked(db.page.findUnique).mockResolvedValue(mockPage as any);
    });

    it('returns block when found at root level', async () => {
      const result = await BlockActions.getBlock('page-1', 'block-1');
      expect(result).toMatchObject({ id: 'block-1', type: 'paragraph' });
    });

    it('returns block when found nested', async () => {
      const result = await BlockActions.getBlock('page-1', 'block-2');
      expect(result).toMatchObject({ id: 'block-2', type: 'paragraph' });
    });

    it('returns null if block not found', async () => {
      const result = await BlockActions.getBlock('page-1', 'non-existent');
      expect(result).toBeNull();
    });

    it('returns null if page not found', async () => {
      vi.mocked(db.page.findUnique).mockResolvedValue(null);
      const result = await BlockActions.getBlock('page-1', 'block-1');
      expect(result).toBeNull();
    });

    it('returns null if user not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const result = await BlockActions.getBlock('page-1', 'block-1');
      expect(result).toBeNull();
    });
  });

  describe('updateSyncedBlockContent', () => {
    beforeEach(() => {
      vi.mocked(db.page.findUnique).mockResolvedValue(mockPage as any);
    });

    it('updates synced block content correctly', async () => {
      const newChildren = [{ id: 'new-child', type: 'paragraph' }];

      const result = await BlockActions.updateSyncedBlockContent(
        'page-1',
        'synced-1',
        newChildren
      );

      expect(result.success).toBe(true);
      expect(db.page.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'page-1' },
          data: expect.objectContaining({
            content: expect.any(String),
          }),
        })
      );

      const updateCallArguments = vi.mocked(db.page.update).mock.calls[0][0];
      const updatedContent = JSON.parse(
        updateCallArguments.data.content as string
      );
      const updatedBlock = updatedContent.find((b: any) => b.id === 'synced-1');

      expect(updatedBlock.props.childrenJSON).toBe(JSON.stringify(newChildren));
    });

    it('updates regular block children correctly', async () => {
      const newChildren = [{ id: 'new-child', type: 'paragraph' }];

      const result = await BlockActions.updateSyncedBlockContent(
        'page-1',
        'block-1',
        newChildren
      );

      expect(result.success).toBe(true);
      const updateCallArguments = vi.mocked(db.page.update).mock.calls[0][0];
      const updatedContent = JSON.parse(
        updateCallArguments.data.content as string
      );
      const updatedBlock = updatedContent.find((b: any) => b.id === 'block-1');

      expect(updatedBlock.children).toEqual(newChildren);
    });

    it('updates nested block correctly', async () => {
      const newChildren = [{ id: 'new-nested', type: 'text' }];
      await BlockActions.updateSyncedBlockContent(
        'page-1',
        'block-2',
        newChildren
      );

      const updateCallArguments = vi.mocked(db.page.update).mock.calls[0][0];
      const updatedContent = JSON.parse(
        updateCallArguments.data.content as string
      );

      const parent = updatedContent.find((b: any) => b.id === 'block-1');
      const nested = parent.children.find((b: any) => b.id === 'block-2');

      expect(nested.children).toEqual(newChildren);
    });

    it('returns error if block not found', async () => {
      const result = await BlockActions.updateSyncedBlockContent(
        'page-1',
        'non-existent',
        []
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Block not found');
      expect(db.page.update).not.toHaveBeenCalled();
    });

    it('throws unauthorized if user not logged in', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(
        BlockActions.updateSyncedBlockContent('page-1', 'block-1', [])
      ).rejects.toThrow('Unauthorized');
    });

    it('throws error if page not found', async () => {
      vi.mocked(db.page.findUnique).mockResolvedValue(null);
      await expect(
        BlockActions.updateSyncedBlockContent('page-1', 'block-1', [])
      ).rejects.toThrow('Page not found or empty');
    });
  });
});
