
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as userActions from '@/app/(main)/_actions/users'
import * as utilActions from '@/app/(main)/_actions/utils'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db', () => ({
    db: {
        user: {
            findMany: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

// Mock global fetch
const globalFetch = global.fetch
global.fetch = vi.fn() as any

describe('Users and Utils Actions', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
    })

    afterEach(() => {
        // Restore global fetch (though we are mocking it at module level, good practice)
        // Actually best to just mock it effectively for tests and clear mocks
    })

    describe('Users: searchUsers', () => {
        it('returns matched users', async () => {
            const mockUsers = [{ id: 'u1', name: 'User 1' }]
            vi.mocked(db.user.findMany).mockResolvedValue(mockUsers as any)

            const result = await userActions.searchUsers('User')

            expect(result).toEqual(mockUsers)
            expect(db.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    OR: [
                        { name: { contains: 'User', mode: 'insensitive' } },
                        { email: { contains: 'User', mode: 'insensitive' } }
                    ]
                }
            }))
        })

        it('returns empty if query is empty/null', async () => {
            const result = await userActions.searchUsers('')
            expect(result).toEqual([])
            expect(db.user.findMany).not.toHaveBeenCalled()
        })

        it('returns empty if unauthenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)
            const result = await userActions.searchUsers('User')
            expect(result).toEqual([])
        })
    })

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
             `
            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                text: async () => mockHtml
            } as any)

            const url = 'http://test.com'
            const result = await utilActions.fetchLinkMetadata(url)

            expect(result).toEqual({
                title: 'Test Page',
                description: 'Test Desc',
                image: 'http://test.com/img.png',
                favicon: 'https://www.google.com/s2/favicons?domain=test.com&sz=64',
                url
            })
        })

        it('returns null if fetch fails', async () => {
            vi.mocked(global.fetch).mockResolvedValue({
                ok: false
            } as any)

            const result = await utilActions.fetchLinkMetadata('http://fail.com')
            expect(result).toBeNull()
        })

        it('returns null if input is empty', async () => {
            const result = await utilActions.fetchLinkMetadata('')
            expect(result).toBeNull()
        })
    })

})
