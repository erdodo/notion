import { ViewType } from '@prisma/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createDatabaseView, updateDatabaseView } from '../database-view';

import { db } from '@/lib/db';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    databaseView: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    property: {
      findFirst: vi.fn(),
    },
    database: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Database View Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDatabaseView', () => {
    it('should create a view with correct defaults', async () => {
      const databaseId = 'db-1';
      const type = ViewType.table;
      const name = 'New View';

      vi.mocked(db.databaseView.findFirst).mockResolvedValueOnce({
        order: 1,
      } as any);

      const createdView = { id: 'view-1', databaseId, type, name, order: 2 };
      vi.mocked(db.databaseView.create).mockResolvedValueOnce(
        createdView as any
      );

      vi.mocked(db.database.findUnique).mockResolvedValueOnce({
        pageId: 'page-1',
      } as any);

      const result = await createDatabaseView(databaseId, type, name);

      expect(db.databaseView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          databaseId,
          type,
          name,
          order: 2,
          filter: [],
          sort: [],
        }),
      });
      expect(result).toEqual(createdView);
    });

    it('should handle BOARD view default grouping', async () => {
      vi.mocked(db.property.findFirst).mockResolvedValueOnce({
        id: 'prop-status',
        type: 'STATUS',
      } as any);

      await createDatabaseView('db-1', ViewType.board, 'Board');

      expect(db.databaseView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          group: { propertyId: 'prop-status' },
        }),
      });
    });
  });

  describe('updateDatabaseView', () => {
    it('should update view data', async () => {
      const viewId = 'view-1';
      const updateData = { name: 'Updated Name' };

      vi.mocked(db.databaseView.update).mockResolvedValueOnce({
        id: viewId,
        databaseId: 'db-1',
        ...updateData,
      } as any);

      vi.mocked(db.database.findUnique).mockResolvedValueOnce({
        pageId: 'page-1',
      } as any);

      await updateDatabaseView(viewId, updateData as any);

      expect(db.databaseView.update).toHaveBeenCalledWith({
        where: { id: viewId },
        data: updateData,
      });
    });
  });
});
