import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/html/route';

const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
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
    mockAuth.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if pageId is missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user1' } });
    const request = new NextRequest('http://localhost/api/export/html');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('should return 404 if page not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user1' } });
    mockFindUnique.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(404);
  });

  it('should return 403 if access denied', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user1', email: 'user1@test.com' },
    });
    mockFindUnique.mockResolvedValue({ id: '123', userId: 'user2' });
    mockFindFirst.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/html?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(403);
  });

  it('should return 200 and HTML content on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user1' } });
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
