import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/csv/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    page: {
      findUnique: (...arguments_: any[]) => mockFindUnique(...arguments_),
    },
    pageShare: {
      findFirst: (...arguments_: any[]) => mockFindFirst(...arguments_),
    },
  },
}));

vi.mock('@/lib/export-utils', () => ({
  formatCellValueForCSV: vi.fn((value) => value || ''),
}));

describe('API: export/csv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/csv?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if pageId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const request = new NextRequest('http://localhost/api/export/csv');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('should return 404 if page not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/csv?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(404);
  });

  it('should return 400 if page is not a database', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user1',
      database: null,
    });
    const request = new NextRequest(
      'http://localhost/api/export/csv?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain('not a database');
  });

  it('should return 200 and CSV content on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user1',
      title: 'Test DB',
      database: {
        properties: [
          { id: 'p1', name: 'Name', type: 'TITLE' },
          { id: 'p2', name: 'Status', type: 'SELECT' },
        ],
        rows: [
          {
            cells: [
              { propertyId: 'p1', value: 'Row 1' },
              { propertyId: 'p2', value: 'Done' },
            ],
          },
          {
            cells: [{ propertyId: 'p1', value: 'Row 2' }],
          },
        ],
      },
    });

    const request = new NextRequest(
      'http://localhost/api/export/csv?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv');

    const text = await res.text();

    expect(text).toContain('Name,Status');
    expect(text).toContain('Row 1,Done');
  });
});
