'use server';

import { revalidatePath } from 'next/cache';

import { checkPageAccess } from './sharing';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getComments(pageId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await checkPageAccess(pageId);
  if (!access.hasAccess) {
    return [];
  }

  return db.comment.findMany({
    where: {
      pageId,
      parentId: null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCommentCount(pageId: string): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const access = await checkPageAccess(pageId);
  if (!access.hasAccess) return 0;

  return db.comment.count({
    where: { pageId },
  });
}

export async function addComment(
  pageId: string,
  data: {
    content: string;
    parentId?: string;
    blockId?: string;
    mentionedUserIds?: string[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const access = await checkPageAccess(pageId);
  if (!access.hasAccess) {
    throw new Error("You don't have permission to comment");
  }

  const comment = await db.comment.create({
    data: {
      content: data.content,
      pageId,
      userId: session.user.id,
      parentId: data.parentId,
      blockId: data.blockId,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: true,
    },
  });

  if (data.mentionedUserIds?.length) {
    await db.userMention.createMany({
      data: data.mentionedUserIds.map((userId) => ({
        commentId: comment.id,
        userId,
        mentionedBy: session.user.id,
      })),
    });

    for (const userId of data.mentionedUserIds) {
      if (userId !== session.user.id) {
        await db.notification.create({
          data: {
            userId,
            type: 'MENTION',
            title: 'You were mentioned',
            message: `${session.user.name} mentioned you in a comment`,
            pageId,
            commentId: comment.id,
            actorId: session.user.id,
          },
        });
      }
    }
  }

  if (data.parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: data.parentId },
    });

    if (parentComment && parentComment.userId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: parentComment.userId,
          type: 'COMMENT_REPLY',
          title: 'New reply to your comment',
          message: `${session.user.name} replied to your comment`,
          pageId,
          commentId: comment.id,
          actorId: session.user.id,
        },
      });
    }
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (page && page.userId !== session.user.id && !data.parentId) {
    await db.notification.create({
      data: {
        userId: page.userId,
        type: 'COMMENT_ADDED',
        title: 'New comment',
        message: `${session.user.name} commented on "${page.title}"`,
        pageId,
        commentId: comment.id,
        actorId: session.user.id,
      },
    });
  }

  const io = (
    globalThis as {
      io?: {
        to: (room: string) => { emit: (event: string, data: unknown) => void };
      };
    }
  ).io;
  if (io) {
    io.to(`page-${pageId}`).emit('comment-added', {
      comment: {
        ...comment,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
      },
    });

    if (data.mentionedUserIds?.length) {
      for (const userId of data.mentionedUserIds) {
        io.to(`user-${userId}`).emit('notification', {
          type: 'MENTION',
          commentId: comment.id,
        });
      }
    }
  }

  revalidatePath(`/documents/${pageId}`);
  return comment;
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (comment?.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.comment.update({
    where: { id: commentId },
    data: {
      content,
      editedAt: new Date(),
    },
  });

  const io = (
    globalThis as {
      io?: {
        to: (room: string) => { emit: (event: string, data: unknown) => void };
      };
    }
  ).io;
  if (io) {
    io.to(`page-${comment.pageId}`).emit('comment-updated', {
      commentId,
      content,
    });
  }

  revalidatePath(`/documents/${comment.pageId}`);
}

export async function deleteComment(commentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { page: true },
  });

  if (!comment) throw new Error('Comment not found');

  if (
    comment.userId !== session.user.id &&
    comment.page.userId !== session.user.id
  ) {
    throw new Error('Unauthorized');
  }

  await db.comment.delete({ where: { id: commentId } });

  const io = (
    globalThis as {
      io?: {
        to: (room: string) => { emit: (event: string, data: any) => void };
      };
    }
  ).io;
  if (io) {
    io.to(`page-${comment.pageId}`).emit('comment-deleted', {
      commentId,
    });
  }

  revalidatePath(`/documents/${comment.pageId}`);
}

export async function resolveComment(commentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new Error('Comment not found');

  await db.comment.update({
    where: { id: commentId },
    data: {
      resolved: true,
      resolvedBy: session.user.id,
      resolvedAt: new Date(),
    },
  });

  revalidatePath(`/documents/${comment.pageId}`);
}
