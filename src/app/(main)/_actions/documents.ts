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
  const document = await db.page.updateMany({
    where: {
      id: documentId,
      userId: user.id,
    },
    data: {
      isArchived: true,
    }
  })

  revalidatePath("/documents")
  revalidatePath(`/documents/${documentId}`)
  return document
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

  const document = await db.page.updateMany({
    where: {
      id: documentId,
      userId: user.id,
    },
    data: {
      isArchived: false,
    }
  })

  revalidatePath("/documents")
  revalidatePath(`/documents/${documentId}`)
  return document
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

  // Delete will cascade to children due to onDelete: Cascade in schema
  const document = await db.page.deleteMany({
    where: {
      id: documentId,
      userId: user.id,
    }
  })

  revalidatePath("/documents")
  return document
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
