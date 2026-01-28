import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/html/route';
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
  blocksToHTML: vi.fn(() => '<p>Mocked HTML Content</p>'),
}));

describe('API: export/html', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if pageId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const request = new NextRequest('http://localhost/api/export/html');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('should return 404 if page not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(404);
  });

  it('should return 403 if access denied', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user1', email: 'user1@test.com' },
    } as any);
    mockFindUnique.mockResolvedValue({ id: '123', userId: 'user2' });
    mockFindFirst.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(403);
  });

  it('should return 200 and HTML content on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user1',
      title: 'Test Page',
      content: JSON.stringify([{ type: 'paragraph' }]),
    });

    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/html');

    const text = await res.text();
    expect(text).toContain('<p>Mocked HTML Content</p>');
  });
});
