import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/import/backup/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    page: {
      create: (...arguments_: any[]) => mockCreate(...arguments_),
      deleteMany: (...arguments_: any[]) => mockDeleteMany(...arguments_),
    },
  },
}));

const mockMetadata = JSON.stringify({
  exportedAt: '2023-01-01',
  userId: 'user1',
  pageCount: 2,
  format: 'markdown',
});

const mockStructure = JSON.stringify([
  {
    id: '1',
    title: 'Page 1',
    children: [{ id: '2', title: 'Page 2', children: [] }],
  },
]);

const filesMap: Record<string, string> = {
  '_metadata.json': mockMetadata,
  '_structure.json': mockStructure,
  'Page 1.md': '# Page 1 Content',
  'Page 2.md': '# Page 2 Content',
};

const mockZipFileFunction = vi.fn().mockImplementation((argument) => {
  if (typeof argument === 'string') {
    if (filesMap[argument]) {
      return {
        async: vi.fn().mockResolvedValue(filesMap[argument]),
      };
    }
    return null;
  } else if (argument instanceof RegExp) {
    const keys = Object.keys(filesMap).filter((k) => argument.test(k));
    if (keys.length > 0) {
      return keys.map((k) => ({
        name: k,
        async: vi.fn().mockResolvedValue(filesMap[k]),
      }));
    }
    return [];
  }
  return null;
});

const mockLoadAsync = vi.fn().mockResolvedValue({
  file: mockZipFileFunction,
});

vi.mock('jszip', () => {
  const MockJSZip = {
    loadAsync: (...arguments_: any[]) => mockLoadAsync(...arguments_),
  };
  return {
    default: MockJSZip,
    JSZip: MockJSZip,
  };
});

describe('API: import/backup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/import/backup', {
      method: 'POST',
    });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  it('should return 400 if zip file missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/import/backup', {
      method: 'POST',
      body: formData,
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  it('should return 200 and import pages on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockCreate.mockResolvedValue({ id: 'new-id' });

    const formData = new FormData();
    const file = new File([new ArrayBuffer(10)], 'backup.zip', {
      type: 'application/zip',
    });
    formData.append('file', file);
    formData.append('mode', 'merge');

    const request = new NextRequest('http://localhost/api/import/backup', {
      method: 'POST',
      body: formData,
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    expect(json.importedCount).toBe(2);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Page 1',
          parentId: null,
        }),
      })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Page 2',

          parentId: 'new-id',
        }),
      })
    );
  });
});
