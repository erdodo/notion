'use client';

import { PropertyType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

import {
  WS_EVENTS,
  DocumentCreateEvent,
  DocumentUpdateEvent,
  DocumentDeleteEvent,
  DocumentArchiveEvent,
  DocumentRestoreEvent,
  DatabaseCellUpdateEvent,
  DatabaseRowCreateEvent,
  DatabaseRowUpdateEvent,
  DatabaseRowDeleteEvent,
  DatabasePropertyCreateEvent,
  DatabasePropertyUpdateEvent,
  DatabasePropertyDeleteEvent,
  CommentCreateEvent,
  CommentUpdateEvent,
  CommentDeleteEvent,
  CommentResolveEvent,
  NotificationNewEvent,
  NotificationReadEvent,
  PresenceJoinEvent,
  PresenceLeaveEvent,
  PresenceCursorEvent,
  FavoriteAddEvent,
  FavoriteRemoveEvent,
} from '@/lib/websocket-events';
import { useCommentsStore } from '@/store/use-comments-store';
import { useDatabaseStore } from '@/store/use-database-store';
import { useDocumentsStore } from '@/store/use-documents-store';
import { useNotificationsStore } from '@/store/use-notifications-store';
import { usePresenceStore } from '@/store/use-presence-store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  const documentsStore = useDocumentsStore();
  const databaseStore = useDatabaseStore();
  const commentsStore = useCommentsStore();
  const notificationsStore = useNotificationsStore();
  const presenceStore = usePresenceStore();

  useEffect(() => {
    const socketInstance = ClientIO(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        path: '/socket.io',
        addTrailingSlash: false,
      }
    );

    // Socket state'ini connect event'i içinde set ediyoruz
    // Bu, external system'den gelen bir event olduğu için ESLint kuralına uygun
    socketInstance.on('connect', () => {
      setSocket(socketInstance);
      setIsConnected(true);
      console.log('[Socket] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    });

    socketInstance.on(WS_EVENTS.DOC_CREATE, (payload: DocumentCreateEvent) => {
      console.log('[Socket] DOC_CREATE:', payload);

      if (payload.userId !== session?.user?.id) {
        documentsStore.addDocument(payload.document);
      }
    });

    socketInstance.on(WS_EVENTS.DOC_UPDATE, (payload: DocumentUpdateEvent) => {
      console.log('[Socket] DOC_UPDATE:', payload);
      if (payload.userId !== session?.user?.id) {
        documentsStore.updateDocument(payload.id as string, payload.updates);
      }
    });

    socketInstance.on(WS_EVENTS.DOC_DELETE, (payload: DocumentDeleteEvent) => {
      console.log('[Socket] DOC_DELETE:', payload);
      if (payload.userId !== session?.user?.id) {
        documentsStore.removeDocument(payload.id as string);
      }
    });

    socketInstance.on(
      WS_EVENTS.DOC_ARCHIVE,
      (payload: DocumentArchiveEvent) => {
        console.log('[Socket] DOC_ARCHIVE:', payload);
        if (payload.userId !== session?.user?.id) {
          documentsStore.archiveDocument(payload.id as string);
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DOC_RESTORE,
      (payload: DocumentRestoreEvent) => {
        console.log('[Socket] DOC_RESTORE:', payload);
        if (payload.userId !== session?.user?.id) {
          documentsStore.restoreDocument(payload.id as string);
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_CELL_UPDATE,
      (payload: DatabaseCellUpdateEvent) => {
        console.log('[Socket] DB_CELL_UPDATE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.updateCell(
            payload.databaseId as string,
            payload.rowId as string,
            payload.propertyId as string,
            payload.value
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_ROW_CREATE,
      (payload: DatabaseRowCreateEvent) => {
        console.log('[Socket] DB_ROW_CREATE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.createRow(payload.databaseId as string, {
            id: payload.rowId as string,
            databaseId: payload.databaseId as string,
            pageId: payload.pageId as string,
            order: payload.order as number,
            parentRowId: payload.parentRowId as string,
            cells: [],
          });
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_ROW_UPDATE,
      (payload: DatabaseRowUpdateEvent) => {
        console.log('[Socket] DB_ROW_UPDATE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.updateRow(
            payload.databaseId as string,
            payload.rowId as string,
            payload.updates
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_ROW_DELETE,
      (payload: DatabaseRowDeleteEvent) => {
        console.log('[Socket] DB_ROW_DELETE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.deleteRow(
            payload.databaseId as string,
            payload.rowId as string
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_PROPERTY_CREATE,
      (payload: DatabasePropertyCreateEvent) => {
        console.log('[Socket] DB_PROPERTY_CREATE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.createProperty(payload.databaseId as string, {
            id: payload.propertyId as string,
            name: payload.name as string,
            type: payload.type as PropertyType,
            databaseId: payload.databaseId as string,
            order: payload.order as number,
            width: 200,
            isVisible: true,
          });
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_PROPERTY_UPDATE,
      (payload: DatabasePropertyUpdateEvent) => {
        console.log('[Socket] DB_PROPERTY_UPDATE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.updateProperty(
            payload.databaseId as string,
            payload.propertyId as string,
            payload.updates
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.DB_PROPERTY_DELETE,
      (payload: DatabasePropertyDeleteEvent) => {
        console.log('[Socket] DB_PROPERTY_DELETE:', payload);
        if (payload.userId !== session?.user?.id) {
          databaseStore.deleteProperty(
            payload.databaseId as string,
            payload.propertyId as string
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.COMMENT_CREATE,
      (payload: CommentCreateEvent) => {
        console.log('[Socket] COMMENT_CREATE:', payload);
        if (payload.userId !== session?.user?.id) {
          commentsStore.addComment({
            id: payload.commentId as string,
            content: payload.content as string,
            pageId: payload.pageId as string,
            userId: payload.userId as string,
            userName: payload.userName as string,
            userImage: payload.userImage as string,
            parentId: payload.parentId as string,
            blockId: payload.blockId as string,
            resolved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.COMMENT_UPDATE,
      (payload: CommentUpdateEvent) => {
        console.log('[Socket] COMMENT_UPDATE:', payload);
        if (payload.userId !== session?.user?.id) {
          commentsStore.updateComment(payload.commentId as string, {
            content: payload.content as string,
          });
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.COMMENT_DELETE,
      (payload: CommentDeleteEvent) => {
        console.log('[Socket] COMMENT_DELETE:', payload);
        if (payload.userId !== session?.user?.id) {
          commentsStore.deleteComment(
            payload.commentId as string,
            payload.pageId as string
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.COMMENT_RESOLVE,
      (payload: CommentResolveEvent) => {
        console.log('[Socket] COMMENT_RESOLVE:', payload);
        if (payload.userId !== session?.user?.id) {
          commentsStore.resolveComment(
            payload.commentId as string,
            payload.pageId as string,
            payload.resolved as boolean,
            payload.resolvedBy as string
          );
        }
      }
    );

    socketInstance.on(
      WS_EVENTS.NOTIFICATION_NEW,
      (payload: NotificationNewEvent) => {
        console.log('[Socket] NOTIFICATION_NEW:', payload);
        notificationsStore.handleNewNotification({
          id: payload.notificationId as string,
          userId: payload.userId as string,
          type: payload.type,
          title: payload.title as string,
          message: payload.message as string,
          pageId: payload.pageId as string,
          actorId: payload.actorId as string,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    );

    socketInstance.on(
      WS_EVENTS.NOTIFICATION_READ,
      (payload: NotificationReadEvent) => {
        console.log('[Socket] NOTIFICATION_READ:', payload);
        notificationsStore.handleNotificationRead(
          payload.notificationId as string
        );
      }
    );

    socketInstance.on(WS_EVENTS.PRESENCE_JOIN, (payload: PresenceJoinEvent) => {
      console.log('[Socket] PRESENCE_JOIN:', payload);
      presenceStore.joinPage(payload.pageId as string, {
        userId: payload.userId as string,
        userName: payload.userName as string,
        userImage: payload.userImage as string,
        pageId: payload.pageId as string,
        color: payload.color as string,
        status: 'online',
        lastSeen: new Date().toISOString(),
      });
    });

    socketInstance.on(
      WS_EVENTS.PRESENCE_LEAVE,
      (payload: PresenceLeaveEvent) => {
        console.log('[Socket] PRESENCE_LEAVE:', payload);
        presenceStore.leavePage(
          payload.pageId as string,
          payload.userId as string
        );
      }
    );

    socketInstance.on(
      WS_EVENTS.PRESENCE_CURSOR,
      (payload: PresenceCursorEvent) => {
        console.log('[Socket] PRESENCE_CURSOR:', payload);
        presenceStore.updateCursor(
          payload.pageId as string,
          payload.userId as string,
          payload.cursorPosition
        );
      }
    );

    socketInstance.on(WS_EVENTS.FAVORITE_ADD, (payload: FavoriteAddEvent) => {
      console.log('[Socket] FAVORITE_ADD:', payload);

      if (payload.userId === session?.user?.id) {
        document.dispatchEvent(new CustomEvent('favorite-changed'));
      }
    });

    socketInstance.on(
      WS_EVENTS.FAVORITE_REMOVE,
      (payload: FavoriteRemoveEvent) => {
        console.log('[Socket] FAVORITE_REMOVE:', payload);
        if (payload.userId === session?.user?.id) {
          document.dispatchEvent(new CustomEvent('favorite-changed'));
        }
      }
    );

    return () => {
      socketInstance.disconnect();
    };
  }, [
    session?.user?.id,
    documentsStore,
    databaseStore,
    commentsStore,
    notificationsStore,
    presenceStore,
  ]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
