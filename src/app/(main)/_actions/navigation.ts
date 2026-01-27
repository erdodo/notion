'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function addToFavorites(pageId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.favorite.create({
    data: {
      userId: session.user.id,
      pageId,
    },
  });

  revalidatePath('/documents');
}

export async function removeFromFavorites(pageId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.favorite.delete({
    where: {
      userId_pageId: {
        userId: session.user.id,
        pageId,
      },
    },
  });

  revalidatePath('/documents');
}

export async function getFavorites() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      page: {
        select: {
          id: true,
          title: true,
          icon: true,
          isArchived: true,
          parentId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.filter((f) => !f.page.isArchived).map((f) => f.page);
}

export async function isFavorite(pageId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const favorite = await db.favorite.findUnique({
    where: {
      userId_pageId: {
        userId: session.user.id,
        pageId,
      },
    },
  });

  return !!favorite;
}

export async function getPublishedPages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const publishedPages = await db.page.findMany({
    where: {
      userId: session.user.id,
      isPublished: true,
      isArchived: false,
    },
    select: {
      id: true,
      title: true,
      icon: true,
      parentId: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return publishedPages;
}

export async function recordPageView(pageId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.pageView.upsert({
    where: {
      userId_pageId: {
        userId: session.user.id,
        pageId,
      },
    },
    update: {
      viewedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      pageId,
    },
  });
}

export async function getRecentPages(limit = 10) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const recentViews = await db.pageView.findMany({
    where: {
      userId: session.user.id,
      page: {
        isArchived: false,
      },
    },
    include: {
      page: {
        select: {
          id: true,
          title: true,
          icon: true,
          parentId: true,
          _count: { select: { children: true } },
        },
      },
    },
    orderBy: { viewedAt: 'desc' },
    take: limit,
  });

  return recentViews.map((v) => v.page);
}

interface BreadcrumbItem {
  id: string;
  title: string;
  icon: string | null;
}

export async function getPageBreadcrumbs(
  pageId: string
): Promise<BreadcrumbItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentId: string | null = pageId;

  let depth = 0;
  while (currentId && depth < 10) {
    const page: {
      id: string;
      title: string;
      icon: string | null;
      parentId: string | null;
    } | null = await db.page.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
      },
    });

    if (!page) break;

    breadcrumbs.unshift({
      id: page.id,
      title: page.title,
      icon: page.icon,
    });

    currentId = page.parentId;
    depth++;
  }

  return breadcrumbs;
}

export async function createPageLink(
  sourcePageId: string,
  targetPageId: string
): Promise<void> {
  await db.pageLink.upsert({
    where: {
      sourcePageId_targetPageId: {
        sourcePageId,
        targetPageId,
      },
    },
    update: {},
    create: {
      sourcePageId,
      targetPageId,
    },
  });
}

export async function removePageLink(
  sourcePageId: string,
  targetPageId: string
): Promise<void> {
  await db.pageLink
    .delete({
      where: {
        sourcePageId_targetPageId: {
          sourcePageId,
          targetPageId,
        },
      },
    })
    .catch(() => {});
}

interface BacklinkItem {
  pageId: string;
  title: string;
  icon: string | null;
  context?: string;
}

export async function getBacklinks(pageId: string): Promise<BacklinkItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const links = await db.pageLink.findMany({
    where: {
      targetPageId: pageId,
      sourcePage: {
        userId: session.user.id,
        isArchived: false,
      },
    },
    include: {
      sourcePage: {
        select: {
          id: true,
          title: true,
          icon: true,
          content: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return links.map((link) => ({
    pageId: link.sourcePage.id,
    title: link.sourcePage.title,
    icon: link.sourcePage.icon,

    context: undefined,
  }));
}

export async function updatePageOrder(
  pageId: string,
  newOrder: number,
  newParentId: string | null
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const page = await db.page.findUnique({
    where: { id: pageId, userId: session.user.id },
  });

  if (!page) throw new Error('Page not found');

  const parentChanged = page.parentId !== newParentId;

  await db.$transaction(async (tx) => {
    if (parentChanged) {
      await tx.page.updateMany({
        where: {
          parentId: page.parentId,
          order: { gt: page.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    await tx.page.updateMany({
      where: {
        parentId: newParentId,
        order: { gte: newOrder },
      },
      data: {
        order: { increment: 1 },
      },
    });

    await tx.page.update({
      where: { id: pageId },
      data: {
        parentId: newParentId,
        order: newOrder,
      },
    });
  });

  revalidatePath('/documents');
}

export async function reorderPages(
  parentId: string | null,
  orderedPageIds: string[]
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.$transaction(
    orderedPageIds.map((pageId, index) =>
      db.page.update({
        where: { id: pageId, userId: session.user.id },
        data: { order: index },
      })
    )
  );

  revalidatePath('/documents');
}

export async function movePage(
  pageId: string,
  newParentId: string | null
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  if (pageId === newParentId) {
    throw new Error('Cannot move page to itself');
  }

  if (newParentId) {
    let currentId: string | null = newParentId;
    while (currentId) {
      if (currentId === pageId) {
        throw new Error('Cannot create circular reference');
      }
      const parent: { parentId: string | null } | null =
        await db.page.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });
      currentId = parent?.parentId || null;
    }
  }

  const maxOrder = await db.page.aggregate({
    where: { parentId: newParentId, userId: session.user.id },
    _max: { order: true },
  });

  await db.page.update({
    where: { id: pageId, userId: session.user.id },
    data: {
      parentId: newParentId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath('/documents');
}
