import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/import/markdown/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockCreate = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    page: {
      create: (...arguments_: any[]) => mockCreate(...arguments_),
    },
  },
}));

describe('API: import/markdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/import/markdown', {
      method: 'POST',
    });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if file is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/import/markdown', {
      method: 'POST',
      body: formData,
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  it('should return 200 and create page on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockCreate.mockResolvedValue({ id: 'new-page-id', title: 'Test Doc' });

    const formData = new FormData();
    const file = new File(['# Hello\n- Item 1'], 'Test Doc.md', {
      type: 'text/markdown',
    });
    formData.append('file', file, 'Test Doc.md');

    const request = new NextRequest('http://localhost/api/import/markdown', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.pageId).toBe('new-page-id');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: expect.stringMatching(/Test Doc|blob/),
          userId: 'user1',
          content: expect.stringContaining('Hello'),
        }),
      })
    );
  });
});
