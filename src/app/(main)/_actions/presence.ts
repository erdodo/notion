'use server';

import { UserPresence } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function updatePresence(
  pageId: string,
  cursorPosition?: { blockId: string; offset: number }
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.userPresence.upsert({
    where: {
      userId_pageId: {
        userId: session.user.id,
        pageId,
      },
    },
    update: {
      status: 'ONLINE',
      lastSeen: new Date(),
      cursorPosition: cursorPosition || undefined,
    },
    create: {
      userId: session.user.id,
      pageId,
      status: 'ONLINE',
      cursorPosition: cursorPosition || undefined,
    },
  });

  const io = (globalThis as any).io;
  if (io) {
    io.to(`page-${pageId}`).emit('presence-update', {
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image,
      cursorPosition,
      status: 'ONLINE',
    });
  }
}

export async function leavePresence(pageId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.userPresence.updateMany({
    where: {
      userId: session.user.id,
      pageId,
    },
    data: {
      status: 'OFFLINE',
      lastSeen: new Date(),
    },
  });

  const io = (globalThis as any).io;
  if (io) {
    io.to(`page-${pageId}`).emit('presence-leave', {
      userId: session.user.id,
    });
  }
}

export async function getPagePresence(pageId: string): Promise<UserPresence[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  return db.userPresence.findMany({
    where: {
      pageId,
      lastSeen: { gt: fiveMinutesAgo },
      status: { not: 'OFFLINE' },
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  }) as unknown as UserPresence[];
}
