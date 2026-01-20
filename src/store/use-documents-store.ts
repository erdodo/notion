
import { create } from "zustand"


export type Document = {
    id: string
    title: string
    icon?: string | null
    isArchived: boolean
    isPublished: boolean
    parentId?: string | null
    children?: Document[]
    // count of children for nested loading if needed
    _count?: {
        children: number
    }
}

type DocumentsStore = {
    documents: Document[]
    recentPages: Document[]
    favoritePages: Document[]
    publishedPages: Document[]
    sharedPages: Document[]
    trashPages: Document[]

    setDocuments: (documents: Document[]) => void
    setRecentPages: (documents: Document[]) => void
    setFavoritePages: (documents: Document[]) => void
    setPublishedPages: (documents: Document[]) => void
    setSharedPages: (documents: Document[]) => void
    setTrashPages: (documents: Document[]) => void

    addDocument: (document: Document) => void
    updateDocument: (id: string, updates: Partial<Document>) => void
    archiveDocument: (id: string) => void
    removeDocument: (id: string) => void
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

export const useDocumentsStore = create<DocumentsStore>((set) => ({
    documents: [],
    recentPages: [],
    favoritePages: [],
    publishedPages: [],
    sharedPages: [],
    trashPages: [],

    setDocuments: (documents) => set({ documents }),
    setRecentPages: (recentPages) => set({ recentPages }),
    setFavoritePages: (favoritePages) => set({ favoritePages }),
    setPublishedPages: (publishedPages) => set({ publishedPages }),
    setSharedPages: (sharedPages) => set({ sharedPages }),
    setTrashPages: (trashPages) => set({ trashPages }),

    addDocument: (document) => set((state) => ({
        documents: [document, ...state.documents].sort((a, b) => 0)
    })),

    updateDocument: (id, updates) => set((state) => ({
        documents: updateRecursive(state.documents, id, updates),
        recentPages: updateList(state.recentPages, id, updates),
        favoritePages: updateList(state.favoritePages, id, updates),
        publishedPages: updateList(state.publishedPages, id, updates),
        sharedPages: updateList(state.sharedPages, id, updates),
        trashPages: updateList(state.trashPages, id, updates),
    })),

    archiveDocument: (id) => set((state) => {
        // Find document to move to trash
        let docToArchive: Document | undefined;

        // Helper to find doc in tree
        const findDoc = (docs: Document[]): Document | undefined => {
            for (const doc of docs) {
                if (doc.id === id) return doc;
                if (doc.children) {
                    const found = findDoc(doc.children);
                    if (found) return found;
                }
            }
            return undefined;
        }

        docToArchive = findDoc(state.documents);

        return {
            documents: removeRecursive(state.documents, id),
            recentPages: state.recentPages.filter(doc => doc.id !== id),
            favoritePages: state.favoritePages.filter(doc => doc.id !== id),
            publishedPages: state.publishedPages.filter(doc => doc.id !== id),
            // Add to trash if found, otherwise we might need to fetch it? 
            // For now, if we found it locally, add it.
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
}))
