import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as userActions from '@/app/(main)/_actions/users';
import * as utilActions from '@/app/(main)/_actions/utils';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

const globalFetch = globalThis.fetch;
globalThis.fetch = vi.fn() as never as typeof fetch;

describe('Users and Utils Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' }, expires: '2025-12-31T00:00:00.000Z' } as any);
  });

  afterEach(() => {
    globalThis.fetch = globalFetch;
  });

  describe('Users: searchUsers', () => {
    it('returns matched users', async () => {
      const mockUsers = [{ id: 'u1', name: 'User 1', email: null, emailVerified: null, image: null, createdAt: new Date(), updatedAt: new Date() }];
      vi.mocked(db.user.findMany).mockResolvedValue(
        mockUsers as never as typeof mockUsers
      );

      const result = await userActions.searchUsers('User');

      expect(result).toEqual(mockUsers);
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'User', mode: 'insensitive' } },
              { email: { contains: 'User', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('returns empty if query is empty/null', async () => {
      const result = await userActions.searchUsers('');
      expect(result).toEqual([]);
      expect(db.user.findMany).not.toHaveBeenCalled();
    });

    it('returns empty if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const result = await userActions.searchUsers('User');
      expect(result).toEqual([]);
    });
  });

  describe('Utils: fetchLinkMetadata', () => {
    it('fetches and parses metadata successfully', async () => {
      const mockHtml = `
                <html>
                    <head>
                        <title>Test Page</title>
                        <meta property="og:description" content="Test Desc" />
                        <meta property="og:image" content="http://test.com/img.png" />
                    </head>
                </html>
             `;
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        text: async () => mockHtml,
      } as never as Response);

      const url = 'http://test.com';
      const result = await utilActions.fetchLinkMetadata(url);

      expect(result).toEqual({
        title: 'Test Page',
        description: 'Test Desc',
        image: 'http://test.com/img.png',
        favicon: 'https://www.google.com/s2/favicons?domain=test.com&sz=64',
        url,
      });
    });

    it('returns null if fetch fails', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
      } as never as Response);

      const result = await utilActions.fetchLinkMetadata('http://fail.com');
      expect(result).toBeNull();
    });

    it('returns null if input is empty', async () => {
      const result = await utilActions.fetchLinkMetadata('');
      expect(result).toBeNull();
    });
  });
});
