
import { create } from "zustand"
import { persist } from "./middleware/persistence"
import { OptimisticUpdateManager } from "./middleware/sync"
import { v4 as uuidv4 } from "uuid"

export type Document = {
    id: string
    title: string
    icon?: string | null
    isArchived?: boolean
    isPublished?: boolean
    parentId?: string | null
    children?: Document[]
    // count of children for nested loading if needed
    _count?: {
        children: number
    }
    // Optimistic update tracking
    _optimistic?: boolean
    _pendingUpdate?: boolean
}

type PendingOperation = {
    id: string
    type: 'create' | 'update' | 'delete' | 'archive' | 'restore'
    documentId: string
    timestamp: number
}

type DocumentsStore = {
    documents: Document[]
    recentPages: Document[]
    favoritePages: Document[]
    publishedPages: Document[]
    sharedPages: Document[]
    trashPages: Document[]

    // Optimistic update tracking
    pendingOperations: PendingOperation[]
    optimisticManager: OptimisticUpdateManager<Document>

    setDocuments: (documents: Document[]) => void
    setRecentPages: (documents: Document[]) => void
    setFavoritePages: (documents: Document[]) => void
    setPublishedPages: (documents: Document[]) => void
    setSharedPages: (documents: Document[]) => void
    setTrashPages: (documents: Document[]) => void

    // Optimistic operations
    addDocumentOptimistic: (document: Partial<Document>, serverAction: () => Promise<Document>) => void
    updateDocumentOptimistic: (id: string, updates: Partial<Document>, serverAction: () => Promise<void>) => void
    archiveDocumentOptimistic: (id: string, serverAction: () => Promise<void>) => void
    removeDocumentOptimistic: (id: string, serverAction: () => Promise<void>) => void

    // Direct operations (from WebSocket events)
    addDocument: (document: Document) => void
    updateDocument: (id: string, updates: Partial<Document>) => void
    archiveDocument: (id: string) => void
    removeDocument: (id: string) => void
    restoreDocument: (id: string) => void

    // Pending operations management
    addPendingOperation: (operation: PendingOperation) => void
    removePendingOperation: (operationId: string) => void
    isPending: (documentId: string) => boolean
}

const updateRecursive = (documents: Document[], id: string, updates: Partial<Document>): Document[] => {
    return documents.map((doc) => {
        if (doc.id === id) {
            return { ...doc, ...updates }
        }
        if (doc.children && doc.children.length > 0) {
            return { ...doc, children: updateRecursive(doc.children, id, updates) }
        }
        return doc
    })
}

// Flat update for simple lists
const updateList = (documents: Document[], id: string, updates: Partial<Document>): Document[] => {
    return documents.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
}

// Remove recursive
const removeRecursive = (documents: Document[], id: string): Document[] => {
    return documents.filter(doc => doc.id !== id).map(doc => {
        if (doc.children && doc.children.length > 0) {
            return { ...doc, children: removeRecursive(doc.children, id) }
        }
        return doc
    })
}

// Find document in tree
const findDocument = (documents: Document[], id: string): Document | undefined => {
    for (const doc of documents) {
        if (doc.id === id) return doc
        if (doc.children) {
            const found = findDocument(doc.children, id)
            if (found) return found
        }
    }
    return undefined
}

export const useDocumentsStore = create<DocumentsStore>()(
    persist(
        (set, get) => ({
            documents: [],
            recentPages: [],
            favoritePages: [],
            publishedPages: [],
            sharedPages: [],
            trashPages: [],
            pendingOperations: [],
            optimisticManager: new OptimisticUpdateManager<Document>(),

            setDocuments: (documents) => set({ documents }),
            setRecentPages: (recentPages) => set({ recentPages }),
            setFavoritePages: (favoritePages) => set({ favoritePages }),
            setPublishedPages: (publishedPages) => set({ publishedPages }),
            setSharedPages: (sharedPages) => set({ sharedPages }),
            setTrashPages: (trashPages) => set({ trashPages }),

            // ============ Optimistic Operations ============

            addDocumentOptimistic: (document, serverAction) => {
                const tempId = document.id || `temp-${uuidv4()}`
                const optimisticDoc: Document = {
                    id: tempId,
                    title: document.title || 'Untitled',
                    icon: document.icon,
                    isArchived: false,
                    isPublished: false,
                    parentId: document.parentId,
                    _optimistic: true,
                }

                const operationId = uuidv4()

                // Add to store immediately
                set((state) => ({
                    documents: [optimisticDoc, ...state.documents],
                }))

                get().addPendingOperation({
                    id: operationId,
                    type: 'create',
                    documentId: tempId,
                    timestamp: Date.now(),
                })

                // Add to optimistic queue
                get().optimisticManager.add(
                    operationId,
                    optimisticDoc,
                    // Rollback function
                    () => {
                        set((state) => ({
                            documents: state.documents.filter(d => d.id !== tempId),
                        }))
                        get().removePendingOperation(operationId)
                    },
                    // Server action
                    async () => {
                        const result = await serverAction()
                        // Replace temp doc with real doc
                        set((state) => ({
                            documents: state.documents.map(d =>
                                d.id === tempId ? { ...result, _optimistic: false } : d
                            ),
                        }))
                        get().removePendingOperation(operationId)
                    }
                )
            },

            updateDocumentOptimistic: (id, updates, serverAction) => {
                const operationId = uuidv4()
                const previousState = get().documents

                // Update immediately
                set((state) => ({
                    documents: updateRecursive(state.documents, id, { ...updates, _pendingUpdate: true }),
                    recentPages: updateList(state.recentPages, id, updates),
                    favoritePages: updateList(state.favoritePages, id, updates),
                    publishedPages: updateList(state.publishedPages, id, updates),
                    sharedPages: updateList(state.sharedPages, id, updates),
                }))

                get().addPendingOperation({
                    id: operationId,
                    type: 'update',
                    documentId: id,
                    timestamp: Date.now(),
                })

                // Add to optimistic queue
                get().optimisticManager.add(
                    operationId,
                    updates as Document,
                    // Rollback function
                    () => {
                        set({ documents: previousState })
                        get().removePendingOperation(operationId)
                    },
                    // Server action
                    async () => {
                        await serverAction()
                        // Remove pending flag
                        set((state) => ({
                            documents: updateRecursive(state.documents, id, { _pendingUpdate: false }),
                        }))
                        get().removePendingOperation(operationId)
                    }
                )
            },

            archiveDocumentOptimistic: (id, serverAction) => {
                const operationId = uuidv4()
                const docToArchive = findDocument(get().documents, id)
                const previousState = {
                    documents: get().documents,
                    recentPages: get().recentPages,
                    favoritePages: get().favoritePages,
                    publishedPages: get().publishedPages,
                }

                // Archive immediately
                set((state) => ({
                    documents: removeRecursive(state.documents, id),
                    recentPages: state.recentPages.filter(doc => doc.id !== id),
                    favoritePages: state.favoritePages.filter(doc => doc.id !== id),
                    publishedPages: state.publishedPages.filter(doc => doc.id !== id),
                    trashPages: docToArchive ? [{ ...docToArchive, isArchived: true }, ...state.trashPages] : state.trashPages,
                }))

                get().addPendingOperation({
                    id: operationId,
                    type: 'archive',
                    documentId: id,
                    timestamp: Date.now(),
                })

                // Add to optimistic queue
                get().optimisticManager.add(
                    operationId,
                    docToArchive!,
                    // Rollback function
                    () => {
                        set(previousState)
                        get().removePendingOperation(operationId)
                    },
                    // Server action
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            removeDocumentOptimistic: (id, serverAction) => {
                const operationId = uuidv4()
                const previousState = {
                    documents: get().documents,
                    recentPages: get().recentPages,
                    favoritePages: get().favoritePages,
                    publishedPages: get().publishedPages,
                    sharedPages: get().sharedPages,
                    trashPages: get().trashPages,
                }

                // Remove immediately
                set((state) => ({
                    documents: removeRecursive(state.documents, id),
                    recentPages: state.recentPages.filter(doc => doc.id !== id),
                    favoritePages: state.favoritePages.filter(doc => doc.id !== id),
                    publishedPages: state.publishedPages.filter(doc => doc.id !== id),
                    sharedPages: state.sharedPages.filter(doc => doc.id !== id),
                    trashPages: state.trashPages.filter(doc => doc.id !== id),
                }))

                get().addPendingOperation({
                    id: operationId,
                    type: 'delete',
                    documentId: id,
                    timestamp: Date.now(),
                })

                // Add to optimistic queue
                get().optimisticManager.add(
                    operationId,
                    {} as Document,
                    // Rollback function
                    () => {
                        set(previousState)
                        get().removePendingOperation(operationId)
                    },
                    // Server action
                    async () => {
                        await serverAction()
                        get().removePendingOperation(operationId)
                    }
                )
            },

            // ============ Direct Operations (from WebSocket) ============

            addDocument: (document) => set((state) => {
                // Check if document already exists (avoid duplicates from optimistic + websocket)
                const exists = findDocument(state.documents, document.id)
                if (exists) {
                    // Update existing instead
                    return {
                        documents: updateRecursive(state.documents, document.id, document)
                    }
                }
                return {
                    documents: [document, ...state.documents].sort((a, b) => 0)
                }
            }),

            updateDocument: (id, updates) => set((state) => ({
                documents: updateRecursive(state.documents, id, updates),
                recentPages: updateList(state.recentPages, id, updates),
                favoritePages: updateList(state.favoritePages, id, updates),
                publishedPages: updateList(state.publishedPages, id, updates),
                sharedPages: updateList(state.sharedPages, id, updates),
                trashPages: updateList(state.trashPages, id, updates),
            })),

            archiveDocument: (id) => set((state) => {
                const docToArchive = findDocument(state.documents, id)

                return {
                    documents: removeRecursive(state.documents, id),
                    recentPages: state.recentPages.filter(doc => doc.id !== id),
                    favoritePages: state.favoritePages.filter(doc => doc.id !== id),
                    publishedPages: state.publishedPages.filter(doc => doc.id !== id),
                    trashPages: docToArchive ? [{ ...docToArchive, isArchived: true }, ...state.trashPages] : state.trashPages,
                }
            }),

            removeDocument: (id) => set((state) => ({
                documents: removeRecursive(state.documents, id),
                recentPages: state.recentPages.filter(doc => doc.id !== id),
                favoritePages: state.favoritePages.filter(doc => doc.id !== id),
                publishedPages: state.publishedPages.filter(doc => doc.id !== id),
                sharedPages: state.sharedPages.filter(doc => doc.id !== id),
                trashPages: state.trashPages.filter(doc => doc.id !== id),
            })),

            restoreDocument: (id) => set((state) => {
                const docToRestore = state.trashPages.find(doc => doc.id === id)
                if (!docToRestore) return state

                return {
                    documents: [{ ...docToRestore, isArchived: false }, ...state.documents],
                    trashPages: state.trashPages.filter(doc => doc.id !== id),
                }
            }),

            // ============ Pending Operations Management ============

            addPendingOperation: (operation) => set((state) => ({
                pendingOperations: [...state.pendingOperations, operation],
            })),

            removePendingOperation: (operationId) => set((state) => ({
                pendingOperations: state.pendingOperations.filter(op => op.id !== operationId),
            })),

            isPending: (documentId) => {
                return get().pendingOperations.some(op => op.documentId === documentId)
            },
        }),
        {
            name: 'documents-store',
            partialize: (state) => ({
                // Only persist actual data, not pending operations
                documents: state.documents.filter(d => !d._optimistic),
                recentPages: state.recentPages,
                favoritePages: state.favoritePages,
                publishedPages: state.publishedPages,
                sharedPages: state.sharedPages,
                trashPages: state.trashPages,
            }),
            version: 1,
        }
    )
)
