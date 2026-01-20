/**
 * WebSocket Event System
 * 
 * Type-safe WebSocket event definitions for real-time synchronization
 */

// ============ Event Names ============

export const WS_EVENTS = {
    // Document Events
    DOC_CREATE: 'doc:create',
    DOC_UPDATE: 'doc:update',
    DOC_DELETE: 'doc:delete',
    DOC_ARCHIVE: 'doc:archive',
    DOC_RESTORE: 'doc:restore',
    DOC_MOVE: 'doc:move',
    DOC_REORDER: 'doc:reorder',

    // Database Events
    DB_CREATE: 'db:create',
    DB_UPDATE: 'db:update',
    DB_DELETE: 'db:delete',

    // Database Row Events
    DB_ROW_CREATE: 'db:row:create',
    DB_ROW_UPDATE: 'db:row:update',
    DB_ROW_DELETE: 'db:row:delete',
    DB_ROW_REORDER: 'db:row:reorder',

    // Database Cell Events
    DB_CELL_UPDATE: 'db:cell:update',
    DB_CELL_BATCH_UPDATE: 'db:cell:batch:update',

    // Database Property Events
    DB_PROPERTY_CREATE: 'db:property:create',
    DB_PROPERTY_UPDATE: 'db:property:update',
    DB_PROPERTY_DELETE: 'db:property:delete',
    DB_PROPERTY_REORDER: 'db:property:reorder',

    // Comment Events
    COMMENT_CREATE: 'comment:create',
    COMMENT_UPDATE: 'comment:update',
    COMMENT_DELETE: 'comment:delete',
    COMMENT_RESOLVE: 'comment:resolve',

    // Notification Events
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',
    NOTIFICATION_DELETE: 'notification:delete',

    // Presence Events
    PRESENCE_JOIN: 'presence:join',
    PRESENCE_LEAVE: 'presence:leave',
    PRESENCE_UPDATE: 'presence:update',
    PRESENCE_CURSOR: 'presence:cursor',

    // Favorite Events
    FAVORITE_ADD: 'favorite:add',
    FAVORITE_REMOVE: 'favorite:remove',

    // Share Events
    SHARE_ADD: 'share:add',
    SHARE_UPDATE: 'share:update',
    SHARE_REMOVE: 'share:remove',

    // System Events
    SYNC_REQUEST: 'sync:request',
    SYNC_RESPONSE: 'sync:response',
    ERROR: 'error',
    ACK: 'ack',
} as const

// ============ Event Payload Types ============

export interface Document {
    id: string
    title: string
    icon?: string | null
    coverImage?: string | null
    coverImagePosition?: number
    isArchived: boolean
    isPublished: boolean
    parentId?: string | null
    userId: string
    createdAt: Date | string
    updatedAt: Date | string
}

export interface DocumentUpdate {
    id: string
    title?: string
    icon?: string | null
    coverImage?: string | null
    coverImagePosition?: number
    isArchived?: boolean
    isPublished?: boolean
    parentId?: string | null
    content?: string
}

// Document Events
export interface DocCreateEvent {
    document: Document
    userId: string
}

export interface DocUpdateEvent {
    id: string
    updates: Partial<Document>
    userId: string
}

export interface DocDeleteEvent {
    id: string
    userId: string
}

export interface DocArchiveEvent {
    id: string
    userId: string
}

export interface DocRestoreEvent {
    id: string
    userId: string
}

export interface DocMoveEvent {
    id: string
    parentId: string | null
    userId: string
}

export interface DocReorderEvent {
    id: string
    order: number
    parentId: string | null
    userId: string
}

// Database Events
export interface DbCreateEvent {
    databaseId: string
    pageId: string
    userId: string
}

export interface DbUpdateEvent {
    databaseId: string
    updates: {
        defaultView?: string
    }
    userId: string
}

export interface DbDeleteEvent {
    databaseId: string
    userId: string
}

// Database Row Events
export interface DbRowCreateEvent {
    rowId: string
    databaseId: string
    pageId?: string
    order: number
    parentRowId?: string | null
    userId: string
}

export interface DbRowUpdateEvent {
    rowId: string
    databaseId: string
    updates: {
        order?: number
        parentRowId?: string | null
    }
    userId: string
}

export interface DbRowDeleteEvent {
    rowId: string
    databaseId: string
    userId: string
}

export interface DbRowReorderEvent {
    rowId: string
    databaseId: string
    order: number
    userId: string
}

// Database Cell Events
export interface DbCellUpdateEvent {
    cellId: string
    rowId: string
    propertyId: string
    databaseId: string
    value: any
    userId: string
}

export interface DbCellBatchUpdateEvent {
    databaseId: string
    updates: Array<{
        cellId: string
        rowId: string
        propertyId: string
        value: any
    }>
    userId: string
}

// Database Property Events
export interface DbPropertyCreateEvent {
    propertyId: string
    databaseId: string
    name: string
    type: string
    order: number
    userId: string
}

export interface DbPropertyUpdateEvent {
    propertyId: string
    databaseId: string
    updates: {
        name?: string
        type?: string
        order?: number
        width?: number
        isVisible?: boolean
        options?: any
    }
    userId: string
}

export interface DbPropertyDeleteEvent {
    propertyId: string
    databaseId: string
    userId: string
}

export interface DbPropertyReorderEvent {
    propertyId: string
    databaseId: string
    order: number
    userId: string
}

// Comment Events
export interface CommentCreateEvent {
    commentId: string
    pageId: string
    content: string
    parentId?: string | null
    blockId?: string | null
    userId: string
    userName?: string
    userImage?: string
}

export interface CommentUpdateEvent {
    commentId: string
    pageId: string
    content: string
    userId: string
}

export interface CommentDeleteEvent {
    commentId: string
    pageId: string
    userId: string
}

export interface CommentResolveEvent {
    commentId: string
    pageId: string
    resolved: boolean
    resolvedBy: string
    userId: string
}

// Notification Events
export interface NotificationNewEvent {
    notificationId: string
    userId: string
    type: string
    title: string
    message?: string
    pageId?: string
    actorId?: string
}

export interface NotificationReadEvent {
    notificationId: string
    userId: string
}

export interface NotificationDeleteEvent {
    notificationId: string
    userId: string
}

// Presence Events
export interface PresenceJoinEvent {
    userId: string
    userName: string
    userImage?: string
    pageId: string
    color: string
}

export interface PresenceLeaveEvent {
    userId: string
    pageId: string
}

export interface PresenceUpdateEvent {
    userId: string
    pageId: string
    status: 'online' | 'away' | 'offline'
}

export interface PresenceCursorEvent {
    userId: string
    pageId: string
    cursorPosition?: {
        blockId: string
        offset: number
    }
}

// Favorite Events
export interface FavoriteAddEvent {
    pageId: string
    userId: string
}

export interface FavoriteRemoveEvent {
    pageId: string
    userId: string
}

// Share Events
export interface ShareAddEvent {
    shareId: string
    pageId: string
    userId?: string
    email?: string
    role: string
    invitedBy: string
}

export interface ShareUpdateEvent {
    shareId: string
    pageId: string
    role: string
    userId: string
}

export interface ShareRemoveEvent {
    shareId: string
    pageId: string
    userId: string
}

// System Events
export interface SyncRequestEvent {
    userId: string
    entityType: 'documents' | 'database' | 'comments' | 'notifications'
    lastSyncTime?: string
}

export interface SyncResponseEvent {
    entityType: 'documents' | 'database' | 'comments' | 'notifications'
    data: any
    timestamp: string
}

export interface ErrorEvent {
    message: string
    code?: string
    details?: any
}

export interface AckEvent {
    eventType: string
    eventId?: string
    success: boolean
    error?: string
}

// ============ Event Union Types ============

export type WebSocketEvent =
    | { type: typeof WS_EVENTS.DOC_CREATE; payload: DocCreateEvent }
    | { type: typeof WS_EVENTS.DOC_UPDATE; payload: DocUpdateEvent }
    | { type: typeof WS_EVENTS.DOC_DELETE; payload: DocDeleteEvent }
    | { type: typeof WS_EVENTS.DOC_ARCHIVE; payload: DocArchiveEvent }
    | { type: typeof WS_EVENTS.DOC_RESTORE; payload: DocRestoreEvent }
    | { type: typeof WS_EVENTS.DOC_MOVE; payload: DocMoveEvent }
    | { type: typeof WS_EVENTS.DOC_REORDER; payload: DocReorderEvent }
    | { type: typeof WS_EVENTS.DB_CREATE; payload: DbCreateEvent }
    | { type: typeof WS_EVENTS.DB_UPDATE; payload: DbUpdateEvent }
    | { type: typeof WS_EVENTS.DB_DELETE; payload: DbDeleteEvent }
    | { type: typeof WS_EVENTS.DB_ROW_CREATE; payload: DbRowCreateEvent }
    | { type: typeof WS_EVENTS.DB_ROW_UPDATE; payload: DbRowUpdateEvent }
    | { type: typeof WS_EVENTS.DB_ROW_DELETE; payload: DbRowDeleteEvent }
    | { type: typeof WS_EVENTS.DB_ROW_REORDER; payload: DbRowReorderEvent }
    | { type: typeof WS_EVENTS.DB_CELL_UPDATE; payload: DbCellUpdateEvent }
    | { type: typeof WS_EVENTS.DB_CELL_BATCH_UPDATE; payload: DbCellBatchUpdateEvent }
    | { type: typeof WS_EVENTS.DB_PROPERTY_CREATE; payload: DbPropertyCreateEvent }
    | { type: typeof WS_EVENTS.DB_PROPERTY_UPDATE; payload: DbPropertyUpdateEvent }
    | { type: typeof WS_EVENTS.DB_PROPERTY_DELETE; payload: DbPropertyDeleteEvent }
    | { type: typeof WS_EVENTS.DB_PROPERTY_REORDER; payload: DbPropertyReorderEvent }
    | { type: typeof WS_EVENTS.COMMENT_CREATE; payload: CommentCreateEvent }
    | { type: typeof WS_EVENTS.COMMENT_UPDATE; payload: CommentUpdateEvent }
    | { type: typeof WS_EVENTS.COMMENT_DELETE; payload: CommentDeleteEvent }
    | { type: typeof WS_EVENTS.COMMENT_RESOLVE; payload: CommentResolveEvent }
    | { type: typeof WS_EVENTS.NOTIFICATION_NEW; payload: NotificationNewEvent }
    | { type: typeof WS_EVENTS.NOTIFICATION_READ; payload: NotificationReadEvent }
    | { type: typeof WS_EVENTS.NOTIFICATION_DELETE; payload: NotificationDeleteEvent }
    | { type: typeof WS_EVENTS.PRESENCE_JOIN; payload: PresenceJoinEvent }
    | { type: typeof WS_EVENTS.PRESENCE_LEAVE; payload: PresenceLeaveEvent }
    | { type: typeof WS_EVENTS.PRESENCE_UPDATE; payload: PresenceUpdateEvent }
    | { type: typeof WS_EVENTS.PRESENCE_CURSOR; payload: PresenceCursorEvent }
    | { type: typeof WS_EVENTS.FAVORITE_ADD; payload: FavoriteAddEvent }
    | { type: typeof WS_EVENTS.FAVORITE_REMOVE; payload: FavoriteRemoveEvent }
    | { type: typeof WS_EVENTS.SHARE_ADD; payload: ShareAddEvent }
    | { type: typeof WS_EVENTS.SHARE_UPDATE; payload: ShareUpdateEvent }
    | { type: typeof WS_EVENTS.SHARE_REMOVE; payload: ShareRemoveEvent }
    | { type: typeof WS_EVENTS.SYNC_REQUEST; payload: SyncRequestEvent }
    | { type: typeof WS_EVENTS.SYNC_RESPONSE; payload: SyncResponseEvent }
    | { type: typeof WS_EVENTS.ERROR; payload: ErrorEvent }
    | { type: typeof WS_EVENTS.ACK; payload: AckEvent }

// ============ Helper Functions ============

/**
 * Create a typed WebSocket event
 */
export function createEvent<T extends WebSocketEvent['type']>(
    type: T,
    payload: Extract<WebSocketEvent, { type: T }>['payload']
): Extract<WebSocketEvent, { type: T }> {
    return { type, payload } as Extract<WebSocketEvent, { type: T }>
}

/**
 * Validate event payload (basic validation)
 */
export function validateEvent(event: any): event is WebSocketEvent {
    return (
        event &&
        typeof event === 'object' &&
        'type' in event &&
        'payload' in event &&
        typeof event.type === 'string' &&
        Object.values(WS_EVENTS).includes(event.type)
    )
}

/**
 * Get room name for a page/document
 */
export function getDocumentRoom(documentId: string): string {
    return `document:${documentId}`
}

/**
 * Get room name for a database
 */
export function getDatabaseRoom(databaseId: string): string {
    return `database:${databaseId}`
}

/**
 * Get room name for a user (for notifications)
 */
export function getUserRoom(userId: string): string {
    return `user:${userId}`
}

/**
 * Get all rooms a user should join for a document
 */
export function getDocumentRooms(documentId: string, userId: string): string[] {
    return [
        getDocumentRoom(documentId),
        getUserRoom(userId),
    ]
}
