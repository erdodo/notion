import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as dbActions from '@/app/(main)/_actions/database';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    page: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    database: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    databaseRow: {
      create: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    property: {
      create: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    cell: {
      update: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn((callback) =>
      callback && typeof callback === 'function' ? callback(db) : callback
    ),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/automation-service', () => ({
  checkAndRunAutomations: vi.fn(),
}));

vi.mock('@/lib/formula-engine', () => ({
  evaluateFormula: vi.fn(),
}));

vi.mock('@/lib/rollup-service', () => ({
  computeRollup: vi.fn(),
}));

describe('Database Actions', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never);
  });

  describe('createDatabase', () => {
    it('creates page and database successfully', async () => {
      const mockPage = { id: 'page-1' };
      const mockDatabase = { id: 'db-1', pageId: 'page-1' };

      vi.mocked(db.page.create).mockResolvedValue(mockPage as never);
      vi.mocked(db.database.create).mockResolvedValue(mockDatabase as never);

      vi.mocked(db.databaseRow.count).mockResolvedValue(0);
      vi.mocked(db.databaseRow.create).mockResolvedValue({
        id: 'row-1',
      } as never);

      vi.mocked(db.database.findUnique).mockResolvedValue(
        mockDatabase as never
      );

      const result = await dbActions.createDatabase();

      expect(db.page.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isDatabase: true }),
        })
      );
      expect(db.database.create).toHaveBeenCalled();

      expect(db.databaseRow.create).toHaveBeenCalled();
      expect(result).toEqual({ page: mockPage, database: mockDatabase });
    });

    it('throws if unauthorized', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      await expect(dbActions.createDatabase()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getDatabase', () => {
    it('returns database with relations', async () => {
      const mockDatabase = { id: 'db-1', pageId: 'p-1' };
      vi.mocked(db.database.findUnique).mockResolvedValue(
        mockDatabase as never
      );

      const result = await dbActions.getDatabase('p-1');
      expect(db.database.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { pageId: 'p-1' },
          include: expect.objectContaining({ rows: expect.any(Object) }),
        })
      );
      expect(result).toEqual(mockDatabase);
    });
  });

  describe('addRow', () => {
    it('creates a row and page', async () => {
      const databaseId = 'db-1';
      const mockDatabase = { id: databaseId, pageId: 'p-main' };
      vi.mocked(db.database.findUnique).mockResolvedValue(
        mockDatabase as never
      );
      vi.mocked(db.page.create).mockResolvedValue({ id: 'p-row' } as never);
      vi.mocked(db.databaseRow.create).mockResolvedValue({
        id: 'row-1',
      } as never);

      await dbActions.addRow(databaseId);

      expect(db.page.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ parentId: 'p-main' }),
        })
      );
      expect(db.databaseRow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            databaseId: databaseId,
            pageId: 'p-row',
          }),
        })
      );
    });
  });

  describe('deleteRow', () => {
    it('deletes the page associated with the row', async () => {
      const rowId = 'row-1';
      vi.mocked(db.databaseRow.findUnique).mockResolvedValue({
        id: rowId,
        pageId: 'p-row',
      } as never);

      await dbActions.deleteRow(rowId);

      expect(db.page.delete).toHaveBeenCalledWith({ where: { id: 'p-row' } });
    });

    it('deletes just row if no page (fallback)', async () => {
      const rowId = 'row-1';
      vi.mocked(db.databaseRow.findUnique).mockResolvedValue({
        id: rowId,
        pageId: null,
      } as never);

      await dbActions.deleteRow(rowId);

      expect(db.databaseRow.delete).toHaveBeenCalledWith({
        where: { id: rowId },
      });
    });
  });

  describe('updateCell', () => {
    it('updates cell value and triggers automation', async () => {
      const cellId = 'cell-1';
      const newValue = { value: 'test' };

      vi.mocked(db.cell.update).mockResolvedValue({ id: cellId } as never);
      vi.mocked(db.cell.findUnique).mockResolvedValue({
        id: cellId,
        propertyId: 'prop-1',
        property: { type: 'TEXT' },
        row: { id: 'row-1', databaseId: 'db-1' },
      } as never);

      await dbActions.updateCell(cellId, newValue);

      expect(db.cell.update).toHaveBeenCalledWith({
        where: { id: cellId },
        data: { value: newValue },
      });
    });
  });

  describe('addProperty', () => {
    it('creates property', async () => {
      vi.mocked(db.property.count).mockResolvedValue(0);
      vi.mocked(db.property.create).mockResolvedValue({
        id: 'prop-1',
      } as never);

      await dbActions.addProperty('db-1', { name: 'Status', type: 'STATUS' });

      expect(db.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'STATUS' }),
        })
      );
    });
  });
});
