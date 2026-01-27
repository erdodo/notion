'use server';

import { ViewType, DatabaseView, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createDatabaseView(
  databaseId: string,
  type: ViewType,
  name: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const lastView = await db.databaseView.findFirst({
    where: { databaseId },
    orderBy: { order: 'desc' },
  });

  const order = lastView ? lastView.order + 1 : 0;

  const propertyWidths = {};

  let group;
  if (type === ViewType.board) {
    const statusProperty = await db.property.findFirst({
      where: {
        databaseId,
        type: { in: ['STATUS', 'SELECT'] },
      },
    });

    if (statusProperty) {
      group = { propertyId: statusProperty.id };
    }
  }

  const view = await db.databaseView.create({
    data: {
      databaseId,
      type,
      name,
      order,
      propertyWidths,
      group,

      filter: [],
      sort: [],
      hiddenProperties: [],
    },
  });

  const database = await db.database.findUnique({
    where: { id: databaseId },
    select: { pageId: true },
  });

  if (database) {
    revalidatePath(`/documents/${database.pageId}`);
  }

  return view;
}

export async function updateDatabaseView(
  viewId: string,
  data: Partial<DatabaseView>
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const view = await db.databaseView.update({
    where: { id: viewId },
    data: data as Prisma.DatabaseViewUpdateInput,
  });

  const database = await db.database.findUnique({
    where: { id: view.databaseId },
    select: { pageId: true },
  });

  if (database) {
    revalidatePath(`/documents/${database.pageId}`);
  }

  return view;
}

export async function deleteDatabaseView(viewId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const view = await db.databaseView.findUnique({
    where: { id: viewId },
    include: { database: true },
  });

  if (!view) {
    throw new Error('View not found');
  }

  await db.databaseView.delete({
    where: { id: viewId },
  });

  revalidatePath(`/documents/${view.database.pageId}`);

  return view;
}

export async function getDatabaseViews(databaseId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await db.databaseView.findMany({
    where: { databaseId },
    orderBy: { order: 'asc' },
  });
}

export async function reorderDatabaseViews(
  databaseId: string,
  viewIds: string[]
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.$transaction(
    viewIds.map((id, index) =>
      db.databaseView.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  const database = await db.database.findUnique({
    where: { id: databaseId },
    select: { pageId: true },
  });

  if (database) {
    revalidatePath(`/documents/${database.pageId}`);
  }
}

export async function setDatabaseDefaultView(
  databaseId: string,
  viewId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.$transaction([
    db.databaseView.updateMany({
      where: { databaseId },
      data: { isDefault: false },
    }),
    db.databaseView.update({
      where: { id: viewId },
      data: { isDefault: true },
    }),
  ]);

  const database = await db.database.findUnique({
    where: { id: databaseId },
    select: { pageId: true },
  });

  if (database) {
    revalidatePath(`/documents/${database.pageId}`);
  }
}
