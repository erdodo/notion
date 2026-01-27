'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  try {
    const user = await db.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name,
        image: session.user.image,
      },
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });
    return user;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

const emit = (event: string, data: Record<string, unknown> | string) => {
  const io = (globalThis as Record<string, unknown>).io;
  if (io && typeof io === 'object' && 'emit' in io) {
    (io as { emit: (event: string, data: unknown) => void }).emit(event, data);
  }
};

export async function createPage(parentId?: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const page = await db.page.create({
    data: {
      title: 'Untitled',
      userId: user.id,
      parentId: parentId || null,
    },
  });

  emit('doc:create', page);
  revalidatePath('/');
  return page;
}

export async function getPages(parentId?: string | null) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const pages = await db.page.findMany({
    where: {
      userId: user.id,
      parentId: parentId === undefined ? null : parentId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      children: true,
    },
  });

  return pages;
}

export async function getPageById(pageId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const page = await db.page.findFirst({
    where: {
      id: pageId,
      userId: user.id,
    },
    include: {
      children: true,
    },
  });

  return page;
}

export async function updatePage(
  pageId: string,
  data: {
    title?: string;
    content?: string;
    icon?: string;
    coverImage?: string;
    isPublished?: boolean;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const page = await db.page.update({
    where: {
      id: pageId,
      userId: user.id,
    },
    data: {
      ...data,
      updatedAt: new Date(),
      publishedAt: data.isPublished ? new Date() : undefined,
    },
  });

  emit('doc:update', page);
  revalidatePath('/');
  return page;
}

export async function archivePage(pageId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const archiveRecursive = async (id: string) => {
    const children = await db.page.findMany({
      where: {
        parentId: id,
        userId: user.id,
      },
    });

    for (const child of children) {
      await archiveRecursive(child.id);

      await db.page.update({
        where: { id: child.id },
        data: { isArchived: true },
      });
      emit('doc:update', { id: child.id, isArchived: true });
    }

    await db.page.update({
      where: { id },
      data: { isArchived: true },
    });
    emit('doc:update', { id, isArchived: true });
  };

  await archiveRecursive(pageId);
  revalidatePath('/');
}

export async function restorePage(pageId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const page = await db.page.findFirst({
    where: {
      id: pageId,
      userId: user.id,
    },
  });

  if (!page) {
    throw new Error('Page not found');
  }

  const restoreParent = async (parentId: string) => {
    const parent = await db.page.findFirst({
      where: {
        id: parentId,
        userId: user.id,
      },
    });

    if (parent && parent.isArchived) {
      await db.page.update({
        where: { id: parentId },
        data: { isArchived: false },
      });
      emit('doc:update', { id: parentId, isArchived: false });

      if (parent.parentId) {
        await restoreParent(parent.parentId);
      }
    }
  };

  if (page.parentId) {
    await restoreParent(page.parentId);
  }

  const restoredPage = await db.page.update({
    where: { id: pageId },
    data: { isArchived: false },
  });

  emit('doc:update', restoredPage);
  revalidatePath('/');
}

export async function deletePage(pageId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  await db.page.delete({
    where: {
      id: pageId,
    },
  });

  emit('doc:delete', pageId);
  revalidatePath('/');
}

export async function getArchivedPages() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const pages = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return pages;
}

export async function searchPages(query: string) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchQuery = query.trim();

  const pages = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      parent: {
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
    take: 50,
  });

  return pages;
}
