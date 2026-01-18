"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"

async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  try {
    // Try to find or create user in database
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
    })
    return user
  } catch (error) {
    console.error("Database error:", error)
    return null
  }
}

export async function createDocument(title: string = "Untitled", parentDocumentId?: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const document = await db.page.create({
    data: {
      title,
      userId: user.id,
      parentId: parentDocumentId || null,
    }
  })

  revalidatePath("/documents")
  return document
}

export async function getSidebarDocuments(parentDocumentId?: string | null) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      parentId: parentDocumentId === undefined ? null : parentDocumentId,
      isArchived: false,
      shares: {
        none: {}
      }
    },
    include: {
      _count: {
        select: { children: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
  })

  return documents
}

export async function getSharedDocuments() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const documents = await db.page.findMany({
    where: {
      isArchived: false,
      OR: [
        // Pages I own and have shared with others
        {
          userId: user.id,
          shares: {
            some: {}
          }
        },
        // Pages shared with me (I am not necessarily the owner)
        {
          shares: {
            some: {
              OR: [
                { userId: user.id },
                { email: user.email }
              ]
            }
          }
        }
      ]
    },
    include: {
      _count: {
        select: { children: true }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
  })

  return documents
}

export async function updateDocument(
  documentId: string,
  data: {
    title?: string
    content?: string
    icon?: string
    coverImage?: string
  }
) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const document = await db.page.updateMany({
      where: {
        id: documentId,
        userId: user.id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    })

    // Trigger update for real-time sync
    await pusherServer.trigger(
      `document-${documentId}`,
      "document-update",
      data
    )

    revalidatePath(`/documents/${documentId}`)
    return document
  } catch (error) {
    console.error("Error updating document:", error)
    throw new Error("Failed to update document")
  }
}

export async function getDocument(documentId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        {
          shares: {
            some: {
              OR: [
                { userId: user.id },
                { email: user.email }
              ]
            }
          }
        }
      ]
    }
  })

  return document
}

// Recursive helper function to archive all children
async function archiveChildrenRecursively(pageId: string, userId: string) {
  const children = await db.page.findMany({
    where: {
      parentId: pageId,
      userId: userId,
    }
  })

  for (const child of children) {
    await archiveChildrenRecursively(child.id, userId)
    await db.page.update({
      where: { id: child.id },
      data: { isArchived: true }
    })
  }
}

export async function archiveDocument(documentId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership before archiving
  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    }
  })

  if (!document) {
    throw new Error("Document not found")
  }

  // Archive all children recursively first
  await archiveChildrenRecursively(documentId, user.id)

  // Then archive the parent
  await db.page.update({
    where: {
      id: documentId,
    },
    data: {
      isArchived: true,
    }
  })

  revalidatePath("/documents")
  revalidatePath(`/documents/${documentId}`)
  revalidatePath("/documents/[documentId]", "page")

  return { success: true }
}

export async function restoreDocument(documentId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    }
  })

  if (!document) {
    throw new Error("Document not found")
  }

  // Smart restoration logic:
  // If parent is archived, move to root (parentId: null)
  // Otherwise keep the hierarchy
  let parentId = document.parentId

  if (parentId) {
    const parent = await db.page.findFirst({
      where: {
        id: parentId,
        userId: user.id,
      }
    })

    // If parent is archived, move to root
    if (parent?.isArchived) {
      parentId = null
    }
  }

  await db.page.update({
    where: { id: documentId },
    data: {
      isArchived: false,
      parentId: parentId,
    }
  })

  revalidatePath("/documents")
  revalidatePath(`/documents/${documentId}`)

  return { success: true }
}

export async function removeDocument(documentId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get the document to check for cover image
  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    }
  })

  if (!document) {
    throw new Error("Document not found")
  }

  // Delete the document (will cascade to children due to onDelete: Cascade in schema)
  await db.page.delete({
    where: {
      id: documentId,
    }
  })

  revalidatePath("/documents")
  revalidatePath("/documents/[documentId]", "page")

  // Return coverImage URL for client-side EdgeStore cleanup if needed
  return { success: true, coverImage: document.coverImage }
}

export async function getArchivedDocuments() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      _count: {
        select: { children: true }
      }
    }
  })

  return documents
}

export async function togglePublish(documentId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get current document
  const existingDocument = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    }
  })

  if (!existingDocument) {
    throw new Error("Document not found")
  }

  // Toggle the isPublished state
  const document = await db.page.update({
    where: { id: documentId },
    data: {
      isPublished: !existingDocument.isPublished,
    }
  })

  // Revalidate both private and public routes
  revalidatePath(`/documents/${documentId}`)
  revalidatePath(`/preview/${documentId}`)

  return document
}

// Public function to get published document (no auth required)
export async function getPublicDocument(documentId: string) {
  const document = await db.page.findFirst({
    where: {
      id: documentId,
      isPublished: true,
    }
  })

  return document
}

export async function searchPages(query: string) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      title: {
        contains: query,
        mode: "insensitive",
      }
    },
    take: 10,
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return documents
}
