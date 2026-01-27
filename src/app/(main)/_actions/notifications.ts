'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getNotifications(
  options: {
    unreadOnly?: boolean;
    limit?: number;
  } = {}
) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.notification.findMany({
    where: {
      userId: session.user.id,
      ...(options.unreadOnly ? { read: false } : {}),
    },
    include: {
      actor: { select: { name: true, image: true } },
      page: { select: { title: true, icon: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit || 50,
  });
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return db.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });
}

export async function markAsRead(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllAsRead(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true, readAt: new Date() },
  });

  revalidatePath('/');
}
