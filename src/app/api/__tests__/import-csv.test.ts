import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/import/csv/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockPageCreate = vi.fn();
const mockDatabaseCreate = vi.fn();
const mockPropertyCreate = vi.fn();
const mockRowCreate = vi.fn();
const mockCellCreate = vi.fn();
const mockRowUpdate = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    page: { create: (...arguments_: any[]) => mockPageCreate(...arguments_) },
    database: {
      create: (...arguments_: any[]) => mockDatabaseCreate(...arguments_),
    },
    property: {
      create: (...arguments_: any[]) => mockPropertyCreate(...arguments_),
    },
    databaseRow: {
      create: (...arguments_: any[]) => mockRowCreate(...arguments_),
      update: (...arguments_: any[]) => mockRowUpdate(...arguments_),
    },
    cell: { create: (...arguments_: any[]) => mockCellCreate(...arguments_) },
  },
}));

describe('API: import/csv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/import/csv', {
      method: 'POST',
    });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if csv is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const formData = new FormData();
    const file = new File([''], 'empty.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', {
      value: vi.fn().mockResolvedValue(''),
    });
    formData.append('file', file);

    const request = {
      formData: async () => formData,
    } as any;
    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  it('should return 200 and verify creation flow on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);

    mockPageCreate.mockResolvedValue({ id: 'page-1' });
    mockDatabaseCreate.mockResolvedValue({ id: 'db-1' });
    mockPropertyCreate.mockResolvedValue({ id: 'prop-1' });
    mockRowCreate.mockResolvedValue({ id: 'row-1' });
    mockCellCreate.mockResolvedValue({ id: 'cell-1' });

    const csvContent = 'Name,Status\nTask 1,Done';
    const formData = new FormData();
    const file = new File([csvContent], 'Tasks.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', {
      value: vi.fn().mockResolvedValue(csvContent),
    });
    formData.append('file', file);

    const request = {
      formData: async () => formData,
    } as any;

    const res = await POST(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.pageId).toBe('page-1');

    expect(mockPageCreate).toHaveBeenCalledTimes(2);
    expect(mockDatabaseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { pageId: 'page-1', defaultView: 'table' },
      })
    );
    expect(mockPropertyCreate).toHaveBeenCalledTimes(2);
    expect(mockRowCreate).toHaveBeenCalledTimes(1);
    expect(mockCellCreate).toHaveBeenCalledTimes(2);
  });
});
