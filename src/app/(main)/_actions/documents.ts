'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  emitDocCreate,
  emitDocUpdate,
  emitDocArchive,
  emitDocRestore,
  emitDocDelete,
} from '@/lib/websocket-emitter';

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await db.user.upsert({
      where: { email: session.user.email! },
      update: {
        name: session.user.name,
        image: session.user.image,
      },
      create: {
        id: session.user.id,
        email: session.user.email!,
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

export async function createDocument(
  title = 'Untitled',
  parentDocumentId?: string
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await db.page.create({
    data: {
      title,
      userId: user.id,
      parentId: parentDocumentId || null,
    },
  });

  emitDocCreate({
    document: {
      id: document.id,
      title: document.title,
      icon: document.icon,
      isArchived: document.isArchived,
      isPublished: document.isPublished,
      parentId: document.parentId,
      userId: document.userId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
    userId: user.id,
  });

  revalidatePath('/documents');
  return document;
}

export async function getSidebarDocuments(parentDocumentId?: string | null) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      parentId: parentDocumentId === undefined ? null : parentDocumentId,
      isArchived: false,
      shares: {
        none: {},
      },
    },
    include: {
      _count: {
        select: { children: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return documents;
}

export async function getSharedDocuments() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const documents = await db.page.findMany({
    where: {
      isArchived: false,
      OR: [
        {
          userId: user.id,
          shares: {
            some: {},
          },
        },

        {
          shares: {
            some: {
              OR: [{ userId: user.id }, { email: user.email }],
            },
          },
        },
      ],
    },
    include: {
      _count: {
        select: { children: true },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return documents;
}

export async function updateDocument(
  documentId: string,
  data: {
    title?: string;
    content?: string;
    icon?: string;
    coverImage?: string;
    coverImagePosition?: number;
    isSmallText?: boolean;
    isFullWidth?: boolean;
    fontStyle?: string;
    isLocked?: boolean;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    try {
      if (data.content) {
        const existingDocument = await db.page.findUnique({
          where: { id: documentId },
          select: { content: true },
        });

        if (
          existingDocument &&
          existingDocument.content &&
          existingDocument.content !== data.content
        ) {
          const lastSnapshot = await db.pageHistory.findFirst({
            where: { pageId: documentId },
            orderBy: { savedAt: 'desc' },
          });

          const shouldSnapshot =
            !lastSnapshot ||
            Date.now() - lastSnapshot.savedAt.getTime() > 10 * 60 * 1000;

          if (shouldSnapshot) {
            console.log('Creating snapshot for page:', documentId);
            await db.pageHistory.create({
              data: {
                pageId: documentId,
                content: existingDocument.content,
                userId: user.id,
              },
            });
            console.log('Snapshot created');
          }
        }
      }
    } catch (snapshotError) {
      console.error('Failed to create snapshot:', snapshotError);
    }

    const document = await db.page.updateMany({
      where: {
        id: documentId,
        userId: user.id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    emitDocUpdate({
      id: documentId,
      updates: data,
      userId: user.id,
    });

    revalidatePath(`/documents/${documentId}`);
    return document;
  } catch (error) {
    console.error('Error updating document:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      console.error('Message:', error.message);
    }
    throw new Error('Failed to update document');
  }
}

export async function getDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        {
          shares: {
            some: {
              OR: [{ userId: user.id }, { email: user.email }],
            },
          },
        },
      ],
    },
    include: {
      databaseRow: true,
    },
  });

  return document;
}

async function archiveChildrenRecursively(pageId: string, userId: string) {
  const children = await db.page.findMany({
    where: {
      parentId: pageId,
      userId: userId,
    },
  });

  for (const child of children) {
    await archiveChildrenRecursively(child.id, userId);
    await db.page.update({
      where: { id: child.id },
      data: { isArchived: true },
    });
  }
}

export async function archiveDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await archiveChildrenRecursively(documentId, user.id);

  await db.page.update({
    where: {
      id: documentId,
    },
    data: {
      isArchived: true,
    },
  });

  emitDocArchive({
    id: documentId,
    userId: user.id,
  });

  revalidatePath('/documents');
  revalidatePath(`/documents/${documentId}`);
  revalidatePath('/documents/[documentId]', 'page');

  return { success: true };
}

export async function restoreDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  let parentId = document.parentId;

  if (parentId) {
    const parent = await db.page.findFirst({
      where: {
        id: parentId,
        userId: user.id,
      },
    });

    if (parent?.isArchived) {
      parentId = null;
    }
  }

  await db.page.update({
    where: { id: documentId },
    data: {
      isArchived: false,
      parentId: parentId,
    },
  });

  emitDocRestore({
    id: documentId,
    userId: user.id,
  });

  revalidatePath('/documents');
  revalidatePath(`/documents/${documentId}`);

  return { success: true };
}

export async function removeDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!document) {
    return { success: true };
  }

  await db.page.delete({
    where: {
      id: documentId,
    },
  });

  emitDocDelete({
    id: documentId,
    userId: user.id,
  });

  revalidatePath('/documents');
  revalidatePath('/documents/[documentId]', 'page');

  return { success: true, coverImage: document.coverImage };
}

export async function getArchivedDocuments() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      _count: {
        select: { children: true },
      },
    },
  });

  return documents;
}

export async function togglePublish(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const existingDocument = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!existingDocument) {
    throw new Error('Document not found');
  }

  const document = await db.page.update({
    where: { id: documentId },
    data: {
      isPublished: !existingDocument.isPublished,
    },
  });

  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/preview/${documentId}`);

  return document;
}

export async function getPublicDocument(documentId: string) {
  const document = await db.page.findFirst({
    where: {
      id: documentId,
      isPublished: true,
    },
  });

  return document;
}

export async function searchPages(
  query: string,
  filters?: {
    includeArchived?: boolean;
    includeDatabases?: boolean;
    limit?: number;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const limit = filters?.limit || 20;
  const includeArchived = filters?.includeArchived || false;
  const includeDatabases = filters?.includeDatabases !== false;

  const documents = await db.page.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId: user.id },
            {
              shares: {
                some: {
                  OR: [{ userId: user.id }, { email: user.email }],
                },
              },
            },
          ],
        },

        {
          isArchived: includeArchived ? undefined : false,
        },

        {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    },
    include: {
      database: includeDatabases
        ? {
            select: {
              id: true,
              defaultView: true,
            },
          }
        : false,
      parent: {
        select: {
          id: true,
          title: true,
          icon: true,
        },
      },
      _count: {
        select: { children: true },
      },
    },
    take: limit,
    orderBy: [{ updatedAt: 'desc' }],
  });

  return documents;
}

async function recursiveCopy(
  originalId: string,
  parentId: string | null | undefined,
  userId: string,
  isRoot: boolean
) {
  const original = await db.page.findUnique({
    where: { id: originalId },
    include: {
      database: { include: { properties: true } },
      databaseRow: true,
    },
  });

  if (!original) return;

  const newTitle = isRoot ? `${original.title} (Copy)` : original.title;

  const newPage = await db.page.create({
    data: {
      title: newTitle,
      content: original.content,
      icon: original.icon,
      coverImage: original.coverImage,
      userId: userId,
      parentId: parentId || null,
      isDatabase: original.isDatabase,
      isPublished: false,
      isArchived: false,
    },
  });

  let newDatabaseId: string | undefined;
  const propertyMap = new Map<string, string>();

  if (original.database) {
    const newDatabase = await db.database.create({
      data: {
        pageId: newPage.id,
        defaultView: original.database.defaultView,
      },
    });
    newDatabaseId = newDatabase.id;

    for (const property of original.database.properties) {
      const newProperty = await db.property.create({
        data: {
          name: property.name,
          type: property.type,
          databaseId: newDatabase.id,
          order: property.order,
          width: property.width,
          isVisible: property.isVisible,
          options: property.options || undefined,

          relationConfig: property.relationConfig || undefined,
          rollupConfig: property.rollupConfig || undefined,
          formulaConfig: property.formulaConfig || undefined,
        },
      });
      propertyMap.set(property.id, newProperty.id);
    }
  }

  const children = await db.page.findMany({
    where: { parentId: originalId, isArchived: false },
  });

  for (const child of children) {
    const newChildId = await recursiveCopy(child.id, newPage.id, userId, false);

    const childRow = await db.databaseRow.findFirst({
      where: { pageId: child.id, databaseId: original.database?.id },
    });

    if (newDatabaseId && childRow && newChildId) {
      const newRow = await db.databaseRow.create({
        data: {
          databaseId: newDatabaseId,
          pageId: newChildId,
          order: childRow.order,
        },
      });

      const cells = await db.cell.findMany({
        where: { rowId: childRow.id },
      });

      for (const cell of cells) {
        const newPropertyId = propertyMap.get(cell.propertyId);
        if (newPropertyId) {
          await db.cell.create({
            data: {
              rowId: newRow.id,
              propertyId: newPropertyId,
              value: cell.value || undefined,
            },
          });
        }
      }
    }
  }

  return newPage.id;
}

export async function duplicateDocument(documentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const document = await db.page.findUnique({
    where: { id: documentId, userId: user.id },
  });
  if (!document) throw new Error('Not found');

  await recursiveCopy(documentId, document.parentId, user.id, true);

  revalidatePath('/documents');
}

export async function getPageHistory(documentId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  const document_ = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        {
          shares: {
            some: { OR: [{ userId: user.id }, { email: user.email }] },
          },
        },
      ],
    },
  });
  if (!document_) throw new Error('Unauthorized');

  return await db.pageHistory.findMany({
    where: { pageId: documentId },
    orderBy: { savedAt: 'desc' },
    include: {
      user: {
        select: { name: true, image: true, email: true },
      },
    },
  });
}

export async function restorePage(documentId: string, historyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const document_ = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        {
          shares: {
            some: { OR: [{ userId: user.id }, { email: user.email }] },
          },
        },
      ],
    },
  });
  if (!document_) throw new Error('Unauthorized');

  const history = await db.pageHistory.findUnique({
    where: { id: historyId },
  });
  if (!history?.content) throw new Error('History not found');

  if (document_.content) {
    await db.pageHistory.create({
      data: {
        pageId: documentId,
        content: document_.content,
        userId: user.id,
        savedAt: new Date(),
      },
    });
  }

  await db.page.update({
    where: { id: documentId },
    data: {
      content: history.content,
      updatedAt: new Date(),
    },
  });

  const io = (globalThis as any).io;
  if (io) {
    io.to(`document-${documentId}`).emit('doc:update', {
      content: history.content,
    });
  }

  revalidatePath(`/documents/${documentId}`);
  return { success: true };
}
