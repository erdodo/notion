'use server';

import { User } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function searchUsers(query: string): Promise<User[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  if (!query) return [];

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
  });
  return users;
}
