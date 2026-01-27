import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { persist } from './middleware/persistence';
import { OptimisticUpdateManager } from './middleware/sync';

export interface Comment {
  id: string;
  content: string;
  pageId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  parentId?: string | null;
  blockId?: string | null;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  editedAt?: Date | string | null;
  replies?: Comment[];
  _optimistic?: boolean;
  _pendingUpdate?: boolean;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'resolve';
  commentId: string;
  timestamp: number;
}

interface CommentsStore {
  commentsByPage: Map<string, Comment[]>;
  pendingOperations: PendingOperation[];
  optimisticManager: OptimisticUpdateManager<Comment>;

  getPageComments: (pageId: string) => Comment[];
  getComment: (commentId: string) => Comment | undefined;
  getThreadComments: (parentId: string) => Comment[];

  setPageComments: (pageId: string, comments: Comment[]) => void;

  createCommentOptimistic: (
    comment: Partial<Comment>,
    serverAction: () => Promise<Comment>
  ) => void;

  updateCommentOptimistic: (
    commentId: string,
    updates: Partial<Comment>,
    serverAction: () => Promise<void>
  ) => void;

  deleteCommentOptimistic: (
    commentId: string,
    pageId: string,
    serverAction: () => Promise<void>
  ) => void;

  resolveCommentOptimistic: (
    commentId: string,
    pageId: string,
    resolved: boolean,
    resolvedBy: string,
    serverAction: () => Promise<void>
  ) => void;

  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string, pageId: string) => void;
  resolveComment: (
    commentId: string,
    pageId: string,
    resolved: boolean,
    resolvedBy: string
  ) => void;

  addPendingOperation: (operation: PendingOperation) => void;
  removePendingOperation: (operationId: string) => void;
  isPending: (commentId: string) => boolean;
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      commentsByPage: new Map(),
      pendingOperations: [],
      optimisticManager: new OptimisticUpdateManager<Comment>(),

      getPageComments: (pageId) => {
        return get().commentsByPage.get(pageId) || [];
      },

      getComment: (commentId) => {
        const allComments = [...get().commentsByPage.values()].flat();
        return allComments.find((c) => c.id === commentId);
      },

      getThreadComments: (parentId) => {
        const allComments = [...get().commentsByPage.values()].flat();
        return allComments.filter((c) => c.parentId === parentId);
      },

      setPageComments: (pageId, comments) => {
        set((state) => {
          const newMap = new Map(state.commentsByPage);
          newMap.set(pageId, comments);
          return { commentsByPage: newMap };
        });
      },

      createCommentOptimistic: (comment, serverAction) => {
        const temporaryId = comment.id || `temp-${uuidv4()}`;
        const operationId = uuidv4();

        const optimisticComment: Comment = {
          id: temporaryId,
          content: comment.content || '',
          pageId: comment.pageId!,
          userId: comment.userId!,
          userName: comment.userName,
          userImage: comment.userImage,
          parentId: comment.parentId,
          blockId: comment.blockId,
          resolved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _optimistic: true,
        };

        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(comment.pageId!) || [];
          newMap.set(comment.pageId!, [...pageComments, optimisticComment]);
          return { commentsByPage: newMap };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'create',
          commentId: temporaryId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          optimisticComment,

          () => {
            set((state) => {
              const newMap = new Map(state.commentsByPage);
              const pageComments = newMap.get(comment.pageId!) || [];
              newMap.set(
                comment.pageId!,
                pageComments.filter((c) => c.id !== temporaryId)
              );
              return { commentsByPage: newMap };
            });
            get().removePendingOperation(operationId);
          },

          async () => {
            const result = await serverAction();
            set((state) => {
              const newMap = new Map(state.commentsByPage);
              const pageComments = newMap.get(comment.pageId!) || [];
              newMap.set(
                comment.pageId!,
                pageComments.map((c) =>
                  c.id === temporaryId ? { ...result, _optimistic: false } : c
                )
              );
              return { commentsByPage: newMap };
            });
            get().removePendingOperation(operationId);
          }
        );
      },

      updateCommentOptimistic: (commentId, updates, serverAction) => {
        const operationId = uuidv4();
        const comment = get().getComment(commentId);
        if (!comment) return;

        const previousState = new Map(get().commentsByPage);

        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(comment.pageId) || [];
          newMap.set(
            comment.pageId,
            pageComments.map((c) =>
              c.id === commentId
                ? { ...c, ...updates, _pendingUpdate: true }
                : c
            )
          );
          return { commentsByPage: newMap };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'update',
          commentId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          updates as Comment,

          () => {
            set({ commentsByPage: previousState });
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();
            set((state) => {
              const newMap = new Map(state.commentsByPage);
              const pageComments = newMap.get(comment.pageId) || [];
              newMap.set(
                comment.pageId,
                pageComments.map((c) =>
                  c.id === commentId ? { ...c, _pendingUpdate: false } : c
                )
              );
              return { commentsByPage: newMap };
            });
            get().removePendingOperation(operationId);
          }
        );
      },

      deleteCommentOptimistic: (commentId, pageId, serverAction) => {
        const operationId = uuidv4();
        const previousState = new Map(get().commentsByPage);

        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(pageId) || [];
          newMap.set(
            pageId,
            pageComments.filter((c) => c.id !== commentId)
          );
          return { commentsByPage: newMap };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'delete',
          commentId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          {} as Comment,

          () => {
            set({ commentsByPage: previousState });
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();
            get().removePendingOperation(operationId);
          }
        );
      },

      resolveCommentOptimistic: (
        commentId,
        pageId,
        resolved,
        resolvedBy,
        serverAction
      ) => {
        const operationId = uuidv4();
        const previousState = new Map(get().commentsByPage);

        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(pageId) || [];
          newMap.set(
            pageId,
            pageComments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    resolved,
                    resolvedBy,
                    resolvedAt: resolved ? new Date().toISOString() : null,
                    _pendingUpdate: true,
                  }
                : c
            )
          );
          return { commentsByPage: newMap };
        });

        get().addPendingOperation({
          id: operationId,
          type: 'resolve',
          commentId,
          timestamp: Date.now(),
        });

        get().optimisticManager.add(
          operationId,
          { resolved, resolvedBy } as Comment,

          () => {
            set({ commentsByPage: previousState });
            get().removePendingOperation(operationId);
          },

          async () => {
            await serverAction();
            set((state) => {
              const newMap = new Map(state.commentsByPage);
              const pageComments = newMap.get(pageId) || [];
              newMap.set(
                pageId,
                pageComments.map((c) =>
                  c.id === commentId ? { ...c, _pendingUpdate: false } : c
                )
              );
              return { commentsByPage: newMap };
            });
            get().removePendingOperation(operationId);
          }
        );
      },

      addComment: (comment) => {
        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(comment.pageId) || [];

          if (pageComments.find((c) => c.id === comment.id)) {
            return state;
          }
          newMap.set(comment.pageId, [...pageComments, comment]);
          return { commentsByPage: newMap };
        });
      },

      updateComment: (commentId, updates) => {
        const comment = get().getComment(commentId);
        if (!comment) return;

        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(comment.pageId) || [];
          newMap.set(
            comment.pageId,
            pageComments.map((c) =>
              c.id === commentId ? { ...c, ...updates } : c
            )
          );
          return { commentsByPage: newMap };
        });
      },

      deleteComment: (commentId, pageId) => {
        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(pageId) || [];
          newMap.set(
            pageId,
            pageComments.filter((c) => c.id !== commentId)
          );
          return { commentsByPage: newMap };
        });
      },

      resolveComment: (commentId, pageId, resolved, resolvedBy) => {
        set((state) => {
          const newMap = new Map(state.commentsByPage);
          const pageComments = newMap.get(pageId) || [];
          newMap.set(
            pageId,
            pageComments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    resolved,
                    resolvedBy,
                    resolvedAt: resolved ? new Date().toISOString() : null,
                  }
                : c
            )
          );
          return { commentsByPage: newMap };
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

      isPending: (commentId) => {
        return get().pendingOperations.some((op) => op.commentId === commentId);
      },
    }),
    {
      name: 'comments-store',
      partialize: (state) =>
        ({
          commentsByPage: Object.fromEntries(
            [...state.commentsByPage.entries()].map(([key, comments]) => [
              key,
              comments.filter((c) => !c._optimistic && !c._pendingUpdate),
            ])
          ),
        }) as never,
      version: 1,
    }
  )
);
