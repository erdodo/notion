import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const databases = await db.database.findMany({
      where: {
        page: {
          userId: session.user.id,
          isArchived: false,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const result = databases.map((database) => ({
      id: database.page.id,
      databaseId: database.id,
      title: database.page.title,
      icon: database.page.icon,
      createdAt: database.createdAt,
      updatedAt: database.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch databases' },
      { status: 500 }
    );
  }
}
