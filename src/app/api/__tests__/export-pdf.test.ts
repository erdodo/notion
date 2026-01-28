import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/pdf/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockFindUnique = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    page: {
      findUnique: (...arguments_: any[]) => mockFindUnique(...arguments_),
    },
  },
}));

vi.mock('@/lib/export-utils', () => ({
  blocksToHTML: vi.fn(() => '<h1>Title</h1><p>Mocked HTML Content</p>'),
}));

describe('API: export/pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/pdf?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if pageId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const request = new NextRequest('http://localhost/api/export/pdf');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('should return 404 if page not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue(null);
    const request = new NextRequest(
      'http://localhost/api/export/pdf?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(404);
  });

  it('should return 200 and JSON with HTML on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindUnique.mockResolvedValue({
      id: '123',
      userId: 'user1',
      title: 'Test Page',
      content: JSON.stringify([{ type: 'paragraph' }]),
      coverImage: 'http://example.com/cover.png',
      icon: '📄',
    });

    const request = new NextRequest(
      'http://localhost/api/export/pdf?pageId=123'
    );
    const res = await GET(request);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.html).toContain('<p>Mocked HTML Content</p>');
    expect(json.html).toContain('http://example.com/cover.png');
    expect(json.title).toBe('Test Page');
    expect(json.filename).toBe('Test_Page');
  });
});
