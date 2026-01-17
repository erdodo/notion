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
