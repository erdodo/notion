import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/markdown/route';
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
  blocksToMarkdown: vi.fn(() => 'Mocked Markdown Content'),
}));

describe('API: export/markdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/markdown?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if pageId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const request = new NextRequest('http://localhost/api/export/markdown');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('should return 404 if page not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost/api/export/markdown?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(404);
  });

  it('should return 403 if user does not have access', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user1', email: 'user1@test.com' },
    } as any);
    mockFindUnique.mockResolvedValue({ id: '123', userId: 'user2' });
    mockFindFirst.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost/api/export/markdown?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(403);
  });

  it('should return 200 and markdown content if successful (owner)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user1',
      title: 'Test Page',
      content: JSON.stringify([{ type: 'paragraph' }]),
    });

    const request = new NextRequest(
      'http://localhost/api/export/markdown?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/markdown');
    expect(res.headers.get('Content-Disposition')).toContain(
      'filename="Test_Page.md"'
    );

    const text = await res.text();
    expect(text).toContain('# Test Page');
    expect(text).toContain('Mocked Markdown Content');
  });

  it('should return 200 and markdown content if successful (shared)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user1', email: 'user1@test.com' },
    } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user2',
      title: 'Shared Page',
      content: JSON.stringify([{ type: 'paragraph' }]),
    });
    mockFindFirst.mockResolvedValue({ id: 'share1' });

    const request = new NextRequest(
      'http://localhost/api/export/markdown?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('# Shared Page');
  });
});
