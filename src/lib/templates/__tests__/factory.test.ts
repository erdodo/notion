import fs from 'node:fs/promises';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { db as database } from '../../db';
import { goalSettingTemplate } from '../definitions/goal-setting.factory';

vi.mock('../../db', () => ({
  db: {
    page: {
      create: vi.fn(),
      update: vi.fn(),
    },
    database: {
      create: vi.fn(),
    },
    databaseView: {
      create: vi.fn(),
    },
    property: {
      create: vi.fn(),
    },
    cell: {
      create: vi.fn(),
    },
  },
}));

vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn(),
      access: vi.fn().mockResolvedValue(),
    },
  };
});

describe('Template Factory: Goal Setting', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (database.page.create as any).mockResolvedValue({
      id: 'root-page-id',
      databaseRow: { id: 'row-id' },
    });
    (database.database.create as any).mockResolvedValue({ id: 'db-id' });
    (database.databaseView.create as any).mockResolvedValue({ id: 'view-id' });
    (database.property.create as any).mockResolvedValue({ id: 'prop-id' });
  });

  it('should process markdown and import CSV links', async () => {
    (fs.readFile as any).mockImplementation(async (filePath: string) => {
      if (filePath.endsWith('.md')) {
        return `
# Goals
Here are my [Dreams](Dreams.csv)
![Goals](Goals.png)
                `;
      }
      if (filePath.endsWith('.csv')) {
        return `Name,Target Date\nTravel,2025-01-01`;
      }
      return '';
    });

    const context = { userId: 'user-1', parentId: 'parent-1' };

    const pageId = await goalSettingTemplate.factory!(context);

    expect(pageId).toBe('root-page-id');
    expect(database.page.create).toHaveBeenCalledTimes(3);

    expect(database.cell.create).toHaveBeenCalled();

    expect(database.page.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'root-page-id' },
        data: expect.objectContaining({
          content: expect.stringContaining(
            '/templates/Goal Setting and Vision Board Template/Goals.png'
          ),
        }),
      })
    );
  });
});
