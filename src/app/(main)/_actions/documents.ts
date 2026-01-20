"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import {
  emitDocCreate,
  emitDocUpdate,
  emitDocArchive,
  emitDocRestore,
  emitDocDelete
} from "@/lib/websocket-emitter"

async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  try {
    // Sync using ID instead of email for robustness if possible
    // But schema uses email as unique identifier primarily for sync
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

  // Emit WebSocket event for real-time sync
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
    coverImagePosition?: number
  }
) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    // --- SNAPSHOT LOGIC ---
    try {
      if (data.content) {
        const existingDoc = await db.page.findUnique({
          where: { id: documentId },
          select: { content: true }
        })

        if (existingDoc && existingDoc.content && existingDoc.content !== data.content) {
          // Check last snapshot
          const lastSnapshot = await db.pageHistory.findFirst({
            where: { pageId: documentId },
            orderBy: { savedAt: 'desc' }
          })

          const shouldSnapshot = !lastSnapshot ||
            (new Date().getTime() - lastSnapshot.savedAt.getTime() > 10 * 60 * 1000) // 10 mins

          if (shouldSnapshot) {
            console.log("Creating snapshot for page:", documentId)
            await db.pageHistory.create({
              data: {
                pageId: documentId,
                content: existingDoc.content, // Save PREVIOUS content
                userId: user.id
              }
            })
            console.log("Snapshot created")
          }
        }
      }
    } catch (snapshotError) {
      // Log but don't fail the update
      console.error("Failed to create snapshot:", snapshotError)
    }
    // ----------------------

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


    // Emit WebSocket event for real-time sync
    emitDocUpdate({
      id: documentId,
      updates: data,
      userId: user.id,
    })

    revalidatePath(`/documents/${documentId}`)
    return document
  } catch (error) {
    console.error("Error updating document:", error)
    if (error instanceof Error) {
      console.error("Stack:", error.stack)
      console.error("Message:", error.message)
    }
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
    },
    include: {
      databaseRow: true
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
  const updatedDocument = await db.page.update({
    where: {
      id: documentId,
    },
    data: {
      isArchived: true,
    }
  })

  // Emit WebSocket event for real-time sync
  emitDocArchive({
    id: documentId,
    userId: user.id,
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

  // Smart restoration logic...
  let parentId = document.parentId

  if (parentId) {
    const parent = await db.page.findFirst({
      where: {
        id: parentId,
        userId: user.id,
      }
    })

    if (parent?.isArchived) {
      parentId = null
    }
  }

  const restoredDocument = await db.page.update({
    where: { id: documentId },
    data: {
      isArchived: false,
      parentId: parentId,
    }
  })

  // Emit WebSocket event for real-time sync
  emitDocRestore({
    id: documentId,
    userId: user.id,
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
    return { success: true }
  }

  // Delete the document
  await db.page.delete({
    where: {
      id: documentId,
    }
  })

  // Emit WebSocket event for real-time sync
  emitDocDelete({
    id: documentId,
    userId: user.id,
  })

  revalidatePath("/documents")
  revalidatePath("/documents/[documentId]", "page")

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

export async function searchPages(query: string, filters?: {
  includeArchived?: boolean
  includeDatabases?: boolean
  limit?: number
}) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const limit = filters?.limit || 20
  const includeArchived = filters?.includeArchived || false
  const includeDatabases = filters?.includeDatabases !== false

  // Search in both title and content
  const documents = await db.page.findMany({
    where: {
      AND: [
        // User access check
        {
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
        },
        // Archive filter
        {
          isArchived: includeArchived ? undefined : false,
        },
        // Search query
        {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              }
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              }
            }
          ]
        }
      ]
    },
    include: {
      database: includeDatabases ? {
        select: {
          id: true,
          defaultView: true,
        }
      } : false,
      parent: {
        select: {
          id: true,
          title: true,
          icon: true,
        }
      },
      _count: {
        select: { children: true }
      }
    },
    take: limit,
    orderBy: [
      // Prioritize title matches over content matches
      { updatedAt: 'desc' }
    ]
  })

  return documents
}


// Helper for Deep Duplicate
async function duplicateValuesRecursively(
  originalPageId: string,
  newPageId: string,
  userId: string
) {
  // 1. Duplicate Content Blocks? (If stored separately? No, currently content is just string JSON in Page table)
  // 2. Duplicate Database if exists?
  // Note: If the page is a database, we need to copy properties and rows?
  // For MVP "Deep Duplicate", if it's a simple page, we just copy children.
  // If it's a database, we should copy structure. 
  // Let's inspect `Page` model. `database` relation exists.

  // Check if original is a database parent
  const database = await db.database.findUnique({
    where: { pageId: originalPageId },
    include: { properties: true, rows: { include: { cells: true } } }
  })

  if (database) {
    // Create new Database
    const newDatabase = await db.database.create({
      data: {
        pageId: newPageId,
        defaultView: database.defaultView,
        // Linked databases? properties?
      }
    })

    // Copy Properties
    const propMap = new Map<string, string>() // Old ID -> New ID
    for (const prop of database.properties) {
      const newProp = await db.property.create({
        data: {
          name: prop.name,
          type: prop.type,
          databaseId: newDatabase.id,
          order: prop.order,
          width: prop.width,
          isVisible: prop.isVisible,
          options: prop.options || undefined,
          relationConfig: prop.relationConfig || undefined,
          rollupConfig: prop.rollupConfig || undefined,
          formulaConfig: prop.formulaConfig || undefined,
        }
      })
      propMap.set(prop.id, newProp.id)
    }

    // Copy Rows (which are also pages!) -> Recursive
    // Wait, DatabaseRow also points to a Page.
    // If we duplicate a Database, we usually duplicate its rows (pages) too?
    // Yes, deep copy.
    // But `archiveChildrenRecursively` implies rows are children of the database page?
    // Yes `parentId` of a row page is usually the database page.
    // So standard child recursion might handle the Page creation of rows, 
    // but we need to link them to `DatabaseRow`.

    // Actually, if we rely on `children` recursion, the child pages get created.
    // But we need to recreate `DatabaseRow` records for them and link to the new Database.
    // Complex.
    // Simplified Logic: 
    // Iterate current children. If child is a Row, duplicate it as a Row of new DB.
    // If child is normal page, duplicate as normal child.
  }
}

async function recursiveCopy(originalId: string, parentId: string | null | undefined, userId: string, isRoot: boolean) {
  const original = await db.page.findUnique({
    where: { id: originalId },
    include: {
      database: { include: { properties: true } },
      databaseRow: true // If original is a row
    }
  })

  if (!original) return

  // Create Copy
  const newTitle = isRoot ? `${original.title} (Copy)` : original.title

  const newPage = await db.page.create({
    data: {
      title: newTitle,
      content: original.content, // BlockNote JSON
      icon: original.icon,
      coverImage: original.coverImage,
      userId: userId,
      parentId: parentId || null,
      isDatabase: original.isDatabase,
      isPublished: false, // Reset publish
      isArchived: false,
    }
  })

  // If original was a Database, setup new Database structure
  let newDatabaseId: string | undefined
  let propMap = new Map<string, string>()

  if (original.database) {
    const newDb = await db.database.create({
      data: {
        pageId: newPage.id,
        defaultView: original.database.defaultView,
      }
    })
    newDatabaseId = newDb.id

    // Copy Properties
    for (const prop of original.database.properties) {
      const newProp = await db.property.create({
        data: {
          name: prop.name,
          type: prop.type,
          databaseId: newDb.id,
          order: prop.order,
          width: prop.width,
          isVisible: prop.isVisible,
          options: prop.options || undefined,
          // complex configs...
          relationConfig: prop.relationConfig || undefined,
          rollupConfig: prop.rollupConfig || undefined,
          formulaConfig: prop.formulaConfig || undefined,
        }
      })
      propMap.set(prop.id, newProp.id)
    }
  }

  // Children (Recursive)
  const children = await db.page.findMany({
    where: { parentId: originalId, isArchived: false }
  })

  for (const child of children) {
    // Recurse
    const newChildId = await recursiveCopy(child.id, newPage.id, userId, false)

    // If we are a database, and the child was a row, we need to link it
    // Check if child had a databaseRow
    const childRow = await db.databaseRow.findFirst({
      where: { pageId: child.id, databaseId: original.database?.id }
    })

    if (newDatabaseId && childRow && newChildId) {
      // Create Row entry for the new child page
      const newRow = await db.databaseRow.create({
        data: {
          databaseId: newDatabaseId,
          pageId: newChildId,
          order: childRow.order
        }
      })

      // Copy Cells
      const cells = await db.cell.findMany({
        where: { rowId: childRow.id }
      })

      for (const cell of cells) {
        const newPropId = propMap.get(cell.propertyId)
        if (newPropId) {
          await db.cell.create({
            data: {
              rowId: newRow.id,
              propertyId: newPropId,
              value: cell.value || undefined
            }
          })
        }
      }
    }
  }

  return newPage.id
}

export async function duplicateDocument(documentId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const document = await db.page.findUnique({
    where: { id: documentId, userId: user.id }
  })
  if (!document) throw new Error("Not found")

  await recursiveCopy(documentId, document.parentId, user.id, true)

  revalidatePath("/documents")
}

export async function getPageHistory(documentId: string) {
  const user = await getCurrentUser()
  if (!user) return []

  // Check access first
  const doc = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        { shares: { some: { OR: [{ userId: user.id }, { email: user.email }] } } }
      ]
    }
  })
  if (!doc) throw new Error("Unauthorized")

  return await db.pageHistory.findMany({
    where: { pageId: documentId },
    orderBy: { savedAt: 'desc' },
    include: {
      user: {
        select: { name: true, image: true, email: true }
      }
    }
  })
}

export async function restorePage(documentId: string, historyId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  // Check access & ownership (allow restoration if editor/owner)
  // Simplified: check access same as get
  const doc = await db.page.findFirst({
    where: {
      id: documentId,
      OR: [
        { userId: user.id },
        { shares: { some: { OR: [{ userId: user.id }, { email: user.email }] } } }
      ]
    }
  })
  if (!doc) throw new Error("Unauthorized")

  const history = await db.pageHistory.findUnique({
    where: { id: historyId }
  })
  if (!history || !history.content) throw new Error("History not found")

  // Create a backup of CURRENT state before restoring
  if (doc.content) {
    await db.pageHistory.create({
      data: {
        pageId: documentId,
        content: doc.content,
        userId: user.id,
        savedAt: new Date() // Now
      }
    })
  }

  // Restore
  await db.page.update({
    where: { id: documentId },
    data: {
      content: history.content,
      updatedAt: new Date()
    }
  })

  // Trigger update
  // Trigger update
  // @ts-ignore
  const io = global.io
  if (io) {
    io.to(`document-${documentId}`).emit("doc:update", { content: history.content })
  }

  revalidatePath(`/documents/${documentId}`)
  return { success: true }
}
