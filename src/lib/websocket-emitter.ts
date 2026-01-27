import { Server } from 'socket.io';

import type {
  DocCreateEvent as DocumentCreateEvent,
  DocUpdateEvent as DocumentUpdateEvent,
  DocDeleteEvent as DocumentDeleteEvent,
  DocArchiveEvent as DocumentArchiveEvent,
  DocRestoreEvent as DocumentRestoreEvent,
  DbCellUpdateEvent as DatabaseCellUpdateEvent,
  DbRowCreateEvent as DatabaseRowCreateEvent,
  DbRowUpdateEvent as DatabaseRowUpdateEvent,
  DbRowDeleteEvent as DatabaseRowDeleteEvent,
  DbPropertyCreateEvent as DatabasePropertyCreateEvent,
  DbPropertyUpdateEvent as DatabasePropertyUpdateEvent,
  DbPropertyDeleteEvent as DatabasePropertyDeleteEvent,
  CommentCreateEvent,
  CommentUpdateEvent,
  CommentDeleteEvent,
  CommentResolveEvent,
  NotificationNewEvent,
  NotificationReadEvent,
  FavoriteAddEvent,
  FavoriteRemoveEvent,
} from './websocket-events';
import { WS_EVENTS } from './websocket-events';

function getIO(): Server | null {
  const globalWithIO = globalThis as unknown as { io?: Server };
  if (globalThis.global !== undefined && globalWithIO.io) {
    return globalWithIO.io;
  }
  return null;
}

function emitGlobal(eventType: string, payload: unknown) {
  const io = getIO();
  if (io) {
    io.emit(eventType, payload);
    console.log(`[WS Emit] ${eventType} to all clients`);
  } else {
    console.warn(`[WS Emit] Socket.IO not available for ${eventType}`);
  }
}

function emitToRoom(roomId: string, eventType: string, payload: unknown) {
  const io = getIO();
  if (io) {
    io.to(roomId).emit(eventType, payload);
    console.log(`[WS Emit] ${eventType} to room ${roomId}`);
  } else {
    console.warn(`[WS Emit] Socket.IO not available for ${eventType}`);
  }
}

function emitToUser(userId: string, eventType: string, payload: unknown) {
  const userRoom = `user:${userId}`;
  emitToRoom(userRoom, eventType, payload);
}

export function emitDocCreate(payload: DocumentCreateEvent) {
  emitGlobal(WS_EVENTS.DOC_CREATE, payload);
}

export function emitDocUpdate(payload: DocumentUpdateEvent) {
  emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_UPDATE, payload);

  emitGlobal(WS_EVENTS.DOC_UPDATE, payload);
}

export function emitDocDelete(payload: DocumentDeleteEvent) {
  emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_DELETE, payload);
  emitGlobal(WS_EVENTS.DOC_DELETE, payload);
}

export function emitDocArchive(payload: DocumentArchiveEvent) {
  emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_ARCHIVE, payload);
  emitGlobal(WS_EVENTS.DOC_ARCHIVE, payload);
}

export function emitDocRestore(payload: DocumentRestoreEvent) {
  emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_RESTORE, payload);
  emitGlobal(WS_EVENTS.DOC_RESTORE, payload);
}

export function emitDbCellUpdate(payload: DatabaseCellUpdateEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_CELL_UPDATE,
    payload
  );
}

export function emitDbRowCreate(payload: DatabaseRowCreateEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_ROW_CREATE,
    payload
  );
}

export function emitDbRowUpdate(payload: DatabaseRowUpdateEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_ROW_UPDATE,
    payload
  );
}

export function emitDbRowDelete(payload: DatabaseRowDeleteEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_ROW_DELETE,
    payload
  );
}

export function emitDbPropertyCreate(payload: DatabasePropertyCreateEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_PROPERTY_CREATE,
    payload
  );
}

export function emitDbPropertyUpdate(payload: DatabasePropertyUpdateEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_PROPERTY_UPDATE,
    payload
  );
}

export function emitDbPropertyDelete(payload: DatabasePropertyDeleteEvent) {
  emitToRoom(
    `database:${payload.databaseId}`,
    WS_EVENTS.DB_PROPERTY_DELETE,
    payload
  );
}

export function emitCommentCreate(payload: CommentCreateEvent) {
  emitToRoom(`document:${payload.pageId}`, WS_EVENTS.COMMENT_CREATE, payload);
}

export function emitCommentUpdate(payload: CommentUpdateEvent) {
  emitToRoom(`document:${payload.pageId}`, WS_EVENTS.COMMENT_UPDATE, payload);
}

export function emitCommentDelete(payload: CommentDeleteEvent) {
  emitToRoom(`document:${payload.pageId}`, WS_EVENTS.COMMENT_DELETE, payload);
}

export function emitCommentResolve(payload: CommentResolveEvent) {
  emitToRoom(`document:${payload.pageId}`, WS_EVENTS.COMMENT_RESOLVE, payload);
}

export function emitNotificationNew(payload: NotificationNewEvent) {
  emitToUser(payload.userId, WS_EVENTS.NOTIFICATION_NEW, payload);
}

export function emitNotificationRead(payload: NotificationReadEvent) {
  emitToUser(payload.userId, WS_EVENTS.NOTIFICATION_READ, payload);
}

export function emitFavoriteAdd(payload: FavoriteAddEvent) {
  emitToUser(payload.userId, WS_EVENTS.FAVORITE_ADD, payload);
}

export function emitFavoriteRemove(payload: FavoriteRemoveEvent) {
  emitToUser(payload.userId, WS_EVENTS.FAVORITE_REMOVE, payload);
}
