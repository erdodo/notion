import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/export/backup/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const mockFindMany = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    page: {
      findMany: (...arguments_: any[]) => mockFindMany(...arguments_),
    },
  },
}));

vi.mock('@/lib/export-utils', () => ({
  blocksToMarkdown: vi.fn(() => 'Mocked Markdown'),
  blocksToHTML: vi.fn(() => 'Mocked HTML'),
  formatCellValueForCSV: vi.fn((value) => value || ''),
}));

const mockZipFile = vi.fn();
const mockGenerateAsync = vi.fn();

vi.mock('jszip', () => {
  const MockJSZip = vi.fn().mockImplementation(() => {
    return {
      file: (...arguments_: any[]) => mockZipFile(...arguments_),
      generateAsync: (...arguments_: any[]) => mockGenerateAsync(...arguments_),
    };
  });
  return {
    default: MockJSZip,
    JSZip: MockJSZip,
  };
});

describe('API: export/backup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/export/backup');
    const res = await GET(request);
    expect(res.status).toBe(401);
  });

  it.skip('should return 200 and zip file on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindMany.mockResolvedValue([
      {
        id: '1',
        title: 'Page 1',
        content: '[]',
        parentId: null,
      },
      {
        id: '2',
        title: 'Page 2',
        content: '[]',
        parentId: '1',
      },
    ]);
    mockGenerateAsync.mockResolvedValue(Buffer.from('fake-zip-content'));

    const request = new NextRequest(
      'http://localhost/api/export/backup?format=markdown'
    );

    try {
      const res = await GET(request);
      if (res.status !== 200) {
        try {
          const json = await res.json();
          console.error('Backup Failed JSON:', json);
        } catch {
          console.error('Backup Failed Status:', res.status);
        }
      }
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/zip');

      expect(mockZipFile).toHaveBeenCalledWith(
        '_metadata.json',
        expect.any(String)
      );
      expect(mockZipFile).toHaveBeenCalledWith(
        '_structure.json',
        expect.any(String)
      );

      expect(mockZipFile).toHaveBeenCalledWith(
        'Page_1.md',
        expect.stringContaining('Page 1')
      );
      expect(mockZipFile).toHaveBeenCalledWith(
        'Page_1/Page_2.md',
        expect.stringContaining('Page 2')
      );
    } catch (error) {
      console.error('Test Exception:', error);
      throw error;
    }
  });

  it('should handle error during backup generation', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user1' } } as any);
    mockFindMany.mockRejectedValue(new Error('DB Error'));

    const request = new NextRequest('http://localhost/api/export/backup');
    const res = await GET(request);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Backup failed');
  });
});
