"use server"

import { auth } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPage(parentId?: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const page = await db.page.create({
    data: {
      title: "Untitled",
      userId: user.id,
      parentId: parentId || null,
    }
  })

  revalidatePath("/")
  return page
}

export async function getPages(userId: string, parentId?: string | null) {
  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return []
  }

  const pages = await db.page.findMany({
    where: {
      userId: user.id,
      parentId: parentId === undefined ? null : parentId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      children: true,
    }
  })

  return pages
}

export async function getPageById(pageId: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const page = await db.page.findFirst({
    where: {
      id: pageId,
      userId: user.id,
    },
    include: {
      children: true,
    }
  })

  return page
}

export async function updatePage(pageId: string, data: {
  title?: string
  content?: string
  icon?: string
  coverImage?: string
  isPublished?: boolean
}) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const page = await db.page.updateMany({
    where: {
      id: pageId,
      userId: user.id,
    },
    data: {
      ...data,
      updatedAt: new Date(),
      publishedAt: data.isPublished ? new Date() : undefined,
    }
  })

  revalidatePath("/")
  return page
}

export async function archivePage(pageId: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Archive the page and all its children
  const archiveRecursive = async (id: string) => {
    const children = await db.page.findMany({
      where: {
        parentId: id,
        userId: user.id,
      }
    })

    for (const child of children) {
      await archiveRecursive(child.id)
    }

    await db.page.update({
      where: { id },
      data: { isArchived: true }
    })
  }

  await archiveRecursive(pageId)
  revalidatePath("/")
}

export async function restorePage(pageId: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const page = await db.page.findFirst({
    where: {
      id: pageId,
      userId: user.id,
    }
  })

  if (!page) {
    throw new Error("Page not found")
  }

  // Restore parent pages if they exist and are archived
  const restoreParent = async (parentId: string) => {
    const parent = await db.page.findFirst({
      where: {
        id: parentId,
        userId: user.id,
      }
    })

    if (parent && parent.isArchived) {
      await db.page.update({
        where: { id: parentId },
        data: { isArchived: false }
      })
      
      if (parent.parentId) {
        await restoreParent(parent.parentId)
      }
    }
  }

  if (page.parentId) {
    await restoreParent(page.parentId)
  }

  await db.page.update({
    where: { id: pageId },
    data: { isArchived: false }
  })

  revalidatePath("/")
}

export async function deletePage(pageId: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  await db.page.delete({
    where: {
      id: pageId,
    }
  })

  revalidatePath("/")
}

export async function getArchivedPages() {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return []
  }

  const pages = await db.page.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return pages
}
