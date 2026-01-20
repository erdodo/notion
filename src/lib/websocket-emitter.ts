/**
 * WebSocket Emitter Utility
 * 
 * Helper functions for server actions to emit WebSocket events
 */

import { Server } from 'socket.io';
import type {
    DocCreateEvent,
    DocUpdateEvent,
    DocDeleteEvent,
    DocArchiveEvent,
    DocRestoreEvent,
    DbCellUpdateEvent,
    DbRowCreateEvent,
    DbRowUpdateEvent,
    DbRowDeleteEvent,
    DbPropertyCreateEvent,
    DbPropertyUpdateEvent,
    DbPropertyDeleteEvent,
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

/**
 * Get the global Socket.IO instance
 */
function getIO(): Server | null {
    if (typeof global !== 'undefined' && (global as any).io) {
        return (global as any).io as Server;
    }
    return null;
}

/**
 * Emit event to all clients
 */
function emitGlobal(eventType: string, payload: any) {
    const io = getIO();
    if (io) {
        io.emit(eventType, payload);
        console.log(`[WS Emit] ${eventType} to all clients`);
    } else {
        console.warn(`[WS Emit] Socket.IO not available for ${eventType}`);
    }
}

/**
 * Emit event to a specific room
 */
function emitToRoom(roomId: string, eventType: string, payload: any) {
    const io = getIO();
    if (io) {
        io.to(roomId).emit(eventType, payload);
        console.log(`[WS Emit] ${eventType} to room ${roomId}`);
    } else {
        console.warn(`[WS Emit] Socket.IO not available for ${eventType}`);
    }
}

/**
 * Emit event to a specific user
 */
function emitToUser(userId: string, eventType: string, payload: any) {
    const userRoom = `user:${userId}`;
    emitToRoom(userRoom, eventType, payload);
}

// ============ Document Events ============

export function emitDocCreate(payload: DocCreateEvent) {
    emitGlobal(WS_EVENTS.DOC_CREATE, payload);
}

export function emitDocUpdate(payload: DocUpdateEvent) {
    // Emit to document room
    emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_UPDATE, payload);
    // Also emit globally for sidebar updates
    emitGlobal(WS_EVENTS.DOC_UPDATE, payload);
}

export function emitDocDelete(payload: DocDeleteEvent) {
    emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_DELETE, payload);
    emitGlobal(WS_EVENTS.DOC_DELETE, payload);
}

export function emitDocArchive(payload: DocArchiveEvent) {
    emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_ARCHIVE, payload);
    emitGlobal(WS_EVENTS.DOC_ARCHIVE, payload);
}

export function emitDocRestore(payload: DocRestoreEvent) {
    emitToRoom(`document:${payload.id}`, WS_EVENTS.DOC_RESTORE, payload);
    emitGlobal(WS_EVENTS.DOC_RESTORE, payload);
}

// ============ Database Events ============

export function emitDbCellUpdate(payload: DbCellUpdateEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_CELL_UPDATE, payload);
}

export function emitDbRowCreate(payload: DbRowCreateEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_ROW_CREATE, payload);
}

export function emitDbRowUpdate(payload: DbRowUpdateEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_ROW_UPDATE, payload);
}

export function emitDbRowDelete(payload: DbRowDeleteEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_ROW_DELETE, payload);
}

export function emitDbPropertyCreate(payload: DbPropertyCreateEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_PROPERTY_CREATE, payload);
}

export function emitDbPropertyUpdate(payload: DbPropertyUpdateEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_PROPERTY_UPDATE, payload);
}

export function emitDbPropertyDelete(payload: DbPropertyDeleteEvent) {
    emitToRoom(`database:${payload.databaseId}`, WS_EVENTS.DB_PROPERTY_DELETE, payload);
}

// ============ Comment Events ============

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

// ============ Notification Events ============

export function emitNotificationNew(payload: NotificationNewEvent) {
    emitToUser(payload.userId, WS_EVENTS.NOTIFICATION_NEW, payload);
}

export function emitNotificationRead(payload: NotificationReadEvent) {
    emitToUser(payload.userId, WS_EVENTS.NOTIFICATION_READ, payload);
}

// ============ Favorite Events ============

export function emitFavoriteAdd(payload: FavoriteAddEvent) {
    emitToUser(payload.userId, WS_EVENTS.FAVORITE_ADD, payload);
}

export function emitFavoriteRemove(payload: FavoriteRemoveEvent) {
    emitToUser(payload.userId, WS_EVENTS.FAVORITE_REMOVE, payload);
}
