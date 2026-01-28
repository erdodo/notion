import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { persist } from './middleware/persistence';
import { OptimisticUpdateManager } from './middleware/sync';

export interface Document {
  id: string;
  title: string;
  icon?: string | null;
  isArchived?: boolean;
  isPublished?: boolean;
  parentId?: string | null;
  children?: Document[];

  _count?: {
    children: number;
  };

  _optimistic?: boolean;
  _pendingUpdate?: boolean;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'archive' | 'restore';
  documentId: string;
  timestamp: number;
}

interface DocumentsStore {
  documents: Document[];
  recentPages: Document[];
  favoritePages: Document[];
  publishedPages: Document[];
  sharedPages: Document[];
  trashPages: Document[];

  pendingOperations: PendingOperation[];
  optimisticManager: OptimisticUpdateManager<Document>;

  setDocuments: (documents: Document[]) => void;
  setRecentPages: (documents: Document[]) => void;
  setFavoritePages: (documents: Document[]) => void;
  setPublishedPages: (documents: Document[]) => void;
  setSharedPages: (documents: Document[]) => void;
  setTrashPages: (documents: Document[]) => void;

  addDocumentOptimistic: (
    document: Partial<Document>,
    serverAction: () => Promise<Document>
  ) => void;
  updateDocumentOptimistic: (
    id: string,
    updates: Partial<Document>,
    serverAction: () => Promise<void>
  ) => void;
  archiveDocumentOptimistic: (
    id: string,
    serverAction: () => Promise<void>
  ) => void;
  removeDocumentOptimistic: (
    id: string,
    serverAction: () => Promise<void>
  ) => void;

  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  archiveDocument: (id: string) => void;
  removeDocument: (id: string) => void;
  restoreDocument: (id: string) => void;

  addPendingOperation: (operation: PendingOperation) => void;
  removePendingOperation: (operationId: string) => void;
  isPending: (documentId: string) => boolean;
}

const updateRecursive = (
  documents: Document[],
  id: string,
  updates: Partial<Document>
): Document[] => {
  return documents.map((document_) => {
    if (document_.id === id) {
      return { ...document_, ...updates };
    }
    if (document_.children && document_.children.length > 0) {
      return {
        ...document_,
        children: updateRecursive(document_.children, id, updates),
      };
    }
    return document_;
  });
};

const updateList = (
  documents: Document[],
  id: string,
  updates: Partial<Document>
): Document[] => {
  return documents.map((document_) =>
    document_.id === id ? { ...document_, ...updates } : document_
  );
};

const removeRecursive = (documents: Document[], id: string): Document[] => {
  return documents
    .filter((document_) => document_.id !== id)
    .map((document_) => {
      if (document_.children && document_.children.length > 0) {
        return {
          ...document_,
          children: removeRecursive(document_.children, id),
        };
      }
      return document_;
    });
};

const findDocument = (docs: Document[], id: string): Document | null => {
  for (const document of docs) {
    if (document.id === id) return document;
    if (document.children) {
      const found = findDocument(document.children, id);
      if (found) return found;
    }
  }
  return null;
};

const addToParent = (
  docs: Document[],
  parentId: string,
  newChild: Document
): Document[] => {
  return docs.map((document_) => {
    if (document_.id === parentId) {
      if (document_.children?.some((c) => c.id === newChild.id))
        return document_;

      return {
        ...document_,
        children: document_.children
          ? [newChild, ...document_.children]
          : [newChild],
        _count: {
          ...document_._count,
          children: (document_._count?.children || 0) + 1,
        },
      };
    }
    if (document_.children && document_.children.length > 0) {
      return {
        ...document_,
        children: addToParent(document_.children, parentId, newChild),
      };
    }
    return document_;
  });
};

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

      setDocuments: (documents) => {
        set({ documents });
      },
      setRecentPages: (recentPages) => {
        set({ recentPages });
      },
      setFavoritePages: (favoritePages) => {
        set({ favoritePages });
      },
      setPublishedPages: (publishedPages) => {
        set({ publishedPages });
      },
      setSharedPages: (sharedPages) => {
        set({ sharedPages });
      },
      setTrashPages: (trashPages) => {
        set({ trashPages });
      },

      addDocumentOptimistic: (document, serverAction) => {
        const temporaryId = document.id || `temp-${uuidv4()}`;
        const optimisticDocument: Document = {
          id: temporaryId,
          title: document.title || 'Untitled',
          icon: document.icon,
          isArchived: false,
          isPublished: false,
          parentId: document.parentId,
          _optimistic: true,
        };

        const operationId = uuidv4();

        if (document.parentId) {
          set((state) => ({
            documents: addToParent(
              state.documents,
              document.parentId!,
              optimisticDocument
            ),
          }));
        } else {
          set((state) => ({
            documents: [optimisticDocument, ...state.documents],
          }));
        }

        get().addPendingOperation({
          id: operationId,
          type: 'create',
          documentId: temporaryId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          optimisticDocument,

          () => {
            set((state) => ({
              documents: state.documents.filter((d) => d.id !== temporaryId),
            }));
            get().removePendingOperation(operationId);
          },

          async () => {
            const result = await serverAction();

            const exists = findDocument(get().documents, result.id);

            if (exists) {
              set((state) => ({
                documents: state.documents.filter((d) => d.id !== temporaryId),
              }));
            } else {
              set((state) => ({
                documents: state.documents.map((d) =>
                  d.id === temporaryId ? { ...result, _optimistic: false } : d
                ),
              }));
            }
            get().removePendingOperation(operationId);
          }
        );
      },

      updateDocumentOptimistic: (id, updates, serverAction) => {
        const operationId = uuidv4();
        const previousState = get().documents;

        set((state) => ({
          documents: updateRecursive(state.documents, id, {
            ...updates,
            _pendingUpdate: true,
          }),
          recentPages: updateList(state.recentPages, id, updates),
          favoritePages: updateList(state.favoritePages, id, updates),
          publishedPages: updateList(state.publishedPages, id, updates),
          sharedPages: updateList(state.sharedPages, id, updates),
        }));

        get().addPendingOperation({
          id: operationId,
          type: 'update',
          documentId: id,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          updates as Document,

          () => {
            set({ documents: previousState });
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();

            set((state) => ({
              documents: updateRecursive(state.documents, id, {
                _pendingUpdate: false,
              }),
            }));
            get().removePendingOperation(operationId);
          }
        );
      },

      archiveDocumentOptimistic: (id, serverAction) => {
        const operationId = uuidv4();
        const documentToArchive = findDocument(get().documents, id);
        const previousState = {
          documents: get().documents,
          recentPages: get().recentPages,
          favoritePages: get().favoritePages,
          publishedPages: get().publishedPages,
        };

        set((state) => ({
          documents: removeRecursive(state.documents, id),
          recentPages: state.recentPages.filter(
            (document_) => document_.id !== id
          ),
          favoritePages: state.favoritePages.filter(
            (document_) => document_.id !== id
          ),
          publishedPages: state.publishedPages.filter(
            (document_) => document_.id !== id
          ),
          trashPages: documentToArchive
            ? [{ ...documentToArchive, isArchived: true }, ...state.trashPages]
            : state.trashPages,
        }));

        get().addPendingOperation({
          id: operationId,
          type: 'archive',
          documentId: id,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          documentToArchive!,

          () => {
            set(previousState);
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      removeDocumentOptimistic: (id, serverAction) => {
        const operationId = uuidv4();
        const previousState = {
          documents: get().documents,
          recentPages: get().recentPages,
          favoritePages: get().favoritePages,
          publishedPages: get().publishedPages,
          sharedPages: get().sharedPages,
          trashPages: get().trashPages,
        };

        set((state) => ({
          documents: removeRecursive(state.documents, id),
          recentPages: state.recentPages.filter(
            (document_) => document_.id !== id
          ),
          favoritePages: state.favoritePages.filter(
            (document_) => document_.id !== id
          ),
          publishedPages: state.publishedPages.filter(
            (document_) => document_.id !== id
          ),
          sharedPages: state.sharedPages.filter(
            (document_) => document_.id !== id
          ),
          trashPages: state.trashPages.filter(
            (document_) => document_.id !== id
          ),
        }));

        get().addPendingOperation({
          id: operationId,
          type: 'delete',
          documentId: id,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          {} as Document,

          () => {
            set(previousState);
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      addDocument: (document) =>
        set((state) => {
          const exists = findDocument(state.documents, document.id);
          if (exists) {
            return {
              documents: updateRecursive(
                state.documents,
                document.id,
                document
              ),
            };
          }

          if (document.parentId) {
            return {
              documents: addToParent(
                state.documents,
                document.parentId,
                document
              ),
            };
          }

          return {
            documents: [document, ...state.documents].sort((_a, _b) => 0),
          };
        }),

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: updateRecursive(state.documents, id, updates),
          recentPages: updateList(state.recentPages, id, updates),
          favoritePages: updateList(state.favoritePages, id, updates),
          publishedPages: updateList(state.publishedPages, id, updates),
          sharedPages: updateList(state.sharedPages, id, updates),
          trashPages: updateList(state.trashPages, id, updates),
        }));
      },

      archiveDocument: (id) => {
        set((state) => {
          const documentToArchive = findDocument(state.documents, id);

          return {
            documents: removeRecursive(state.documents, id),
            recentPages: state.recentPages.filter(
              (document_) => document_.id !== id
            ),
            favoritePages: state.favoritePages.filter(
              (document_) => document_.id !== id
            ),
            publishedPages: state.publishedPages.filter(
              (document_) => document_.id !== id
            ),
            sharedPages: state.sharedPages.filter(
              (document_) => document_.id !== id
            ),
            trashPages: documentToArchive
              ? [
                  { ...documentToArchive, isArchived: true },
                  ...state.trashPages,
                ]
              : state.trashPages,
          };
        });
      },

      removeDocument: (id) => {
        set((state) => ({
          documents: removeRecursive(state.documents, id),
          recentPages: state.recentPages.filter(
            (document_) => document_.id !== id
          ),
          favoritePages: state.favoritePages.filter(
            (document_) => document_.id !== id
          ),
          publishedPages: state.publishedPages.filter(
            (document_) => document_.id !== id
          ),
          sharedPages: state.sharedPages.filter(
            (document_) => document_.id !== id
          ),
          trashPages: state.trashPages.filter(
            (document_) => document_.id !== id
          ),
        }));
      },

      restoreDocument: (id) => {
        set((state) => {
          const documentToRestore = state.trashPages.find(
            (document_) => document_.id === id
          );
          if (!documentToRestore) return state;

          return {
            documents: [
              { ...documentToRestore, isArchived: false },
              ...state.documents,
            ],
            trashPages: state.trashPages.filter(
              (document_) => document_.id !== id
            ),
          };
        });
      },

      addPendingOperation: (operation) => {
        set((state) => ({
          pendingOperations: [...state.pendingOperations, operation],
        }));
      },

      removePendingOperation: (operationId) => {
        set((state) => ({
          pendingOperations: state.pendingOperations.filter(
            (op) => op.id !== operationId
          ),
        }));
      },

      isPending: (documentId) => {
        return get().pendingOperations.some(
          (op) => op.documentId === documentId
        );
      },
    }),
    {
      name: 'documents-store',
      partialize: (state) => ({
        documents: state.documents.filter((d) => !d._optimistic),
        recentPages: state.recentPages,
        favoritePages: state.favoritePages,
        publishedPages: state.publishedPages,
        sharedPages: state.sharedPages,
        trashPages: state.trashPages,
      }),
      version: 1,
    }
  )
);
