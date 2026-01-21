import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all databases that belong to the user
        const databases = await db.database.findMany({
            where: {
                page: {
                    userId: session.user.id,
                    isArchived: false
                }
            },
            include: {
                page: {
                    select: {
                        id: true,
                        title: true,
                        icon: true,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        // Transform to include title at top level for easier consumption
        const result = databases.map(db => ({
            id: db.page.id, // Use page ID for navigation
            databaseId: db.id,
            title: db.page.title,
            icon: db.page.icon,
            createdAt: db.createdAt,
            updatedAt: db.updatedAt,
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching databases:', error)
        return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 })
    }
}
