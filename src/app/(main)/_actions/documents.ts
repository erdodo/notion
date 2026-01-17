"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createDocument(title: string = "Untitled", parentDocumentId?: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
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
  const { userId } = await auth()
  
  if (!userId) {
    return []
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return []
  }

  const documents = await db.page.findMany({
    where: {
      userId: user.id,
      parentId: parentDocumentId === undefined ? null : parentDocumentId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc'
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
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
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

    revalidatePath(`/documents/${documentId}`)
    return document
  } catch (error) {
    console.error("Error updating document:", error)
    throw new Error("Failed to update document")
  }
}

export async function getDocument(documentId: string) {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return null
  }

  const document = await db.page.findFirst({
    where: {
      id: documentId,
      userId: user.id,
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
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Archive all children recursively first
  await archiveChildrenRecursively(documentId, user.id)

  // Then archive the parent
  await db.page.update({
    where: { id: documentId },
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
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
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
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
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

  // Cleanup cover image from EdgeStore if it exists
  if (document.coverImage) {
    try {
      // EdgeStore cleanup will be handled by the client-side
      // The URL contains the file info needed for deletion
      // We'll return the coverImage URL so the client can delete it
    } catch (error) {
      console.error("Error deleting cover image:", error)
      // Don't throw - document is already deleted
    }
  }

  revalidatePath("/documents")
  revalidatePath("/documents/[documentId]", "page")
  
  return { success: true, coverImage: document.coverImage }
}

export async function getArchivedDocuments() {
  const { userId } = await auth()
  
  if (!userId) {
    return []
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

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
    }
  })

  return documents
}

export async function togglePublish(documentId: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
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
