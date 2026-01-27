export const WS_EVENTS = {
  DOC_CREATE: 'doc:create',
  DOC_UPDATE: 'doc:update',
  DOC_DELETE: 'doc:delete',
  DOC_ARCHIVE: 'doc:archive',
  DOC_RESTORE: 'doc:restore',
  DOC_MOVE: 'doc:move',
  DOC_REORDER: 'doc:reorder',

  DB_CREATE: 'db:create',
  DB_UPDATE: 'db:update',
  DB_DELETE: 'db:delete',

  DB_ROW_CREATE: 'db:row:create',
  DB_ROW_UPDATE: 'db:row:update',
  DB_ROW_DELETE: 'db:row:delete',
  DB_ROW_REORDER: 'db:row:reorder',

  DB_CELL_UPDATE: 'db:cell:update',
  DB_CELL_BATCH_UPDATE: 'db:cell:batch:update',

  DB_PROPERTY_CREATE: 'db:property:create',
  DB_PROPERTY_UPDATE: 'db:property:update',
  DB_PROPERTY_DELETE: 'db:property:delete',
  DB_PROPERTY_REORDER: 'db:property:reorder',

  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  COMMENT_RESOLVE: 'comment:resolve',

  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETE: 'notification:delete',

  PRESENCE_JOIN: 'presence:join',
  PRESENCE_LEAVE: 'presence:leave',
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_CURSOR: 'presence:cursor',

  FAVORITE_ADD: 'favorite:add',
  FAVORITE_REMOVE: 'favorite:remove',

  SHARE_ADD: 'share:add',
  SHARE_UPDATE: 'share:update',
  SHARE_REMOVE: 'share:remove',

  SYNC_REQUEST: 'sync:request',
  SYNC_RESPONSE: 'sync:response',
  ERROR: 'error',
  ACK: 'ack',
} as const;

export interface Document {
  id: string;
  title: string;
  icon?: string | null;
  coverImage?: string | null;
  coverImagePosition?: number;
  isArchived: boolean;
  isPublished: boolean;
  parentId?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DocumentUpdate {
  id: string;
  title?: string;
  icon?: string | null;
  coverImage?: string | null;
  coverImagePosition?: number;
  isArchived?: boolean;
  isPublished?: boolean;
  parentId?: string | null;
  content?: string;
}

export interface DocumentCreateEvent {
  document: Document;
  userId: string;
}

export interface DocumentUpdateEvent {
  id: string;
  updates: Partial<Document>;
  userId: string;
}

export interface DocumentDeleteEvent {
  id: string;
  userId: string;
}

export interface DocumentArchiveEvent {
  id: string;
  userId: string;
}

export interface DocumentRestoreEvent {
  id: string;
  userId: string;
}

export interface DocumentMoveEvent {
  id: string;
  parentId: string | null;
  userId: string;
}

export interface DocumentReorderEvent {
  id: string;
  order: number;
  parentId: string | null;
  userId: string;
}

export interface DatabaseCreateEvent {
  databaseId: string;
  pageId: string;
  userId: string;
}

export interface DatabaseUpdateEvent {
  databaseId: string;
  updates: {
    defaultView?: string;
  };
  userId: string;
}

export interface DatabaseDeleteEvent {
  databaseId: string;
  userId: string;
}

export interface DatabaseRowCreateEvent {
  rowId: string;
  databaseId: string;
  pageId?: string;
  order: number;
  parentRowId?: string | null;
  userId: string;
}

export interface DatabaseRowUpdateEvent {
  rowId: string;
  databaseId: string;
  updates: {
    order?: number;
    parentRowId?: string | null;
  };
  userId: string;
}

export interface DatabaseRowDeleteEvent {
  rowId: string;
  databaseId: string;
  userId: string;
}

export interface DatabaseRowReorderEvent {
  rowId: string;
  databaseId: string;
  order: number;
  userId: string;
}

export interface DatabaseCellUpdateEvent {
  cellId: string;
  rowId: string;
  propertyId: string;
  databaseId: string;
  value: unknown;
  userId: string;
}

export interface DatabaseCellBatchUpdateEvent {
  databaseId: string;
  updates: {
    cellId: string;
    rowId: string;
    propertyId: string;
    value: unknown;
  }[];
  userId: string;
}

export interface DatabasePropertyCreateEvent {
  propertyId: string;
  databaseId: string;
  name: string;
  type: string;
  order: number;
  userId: string;
}

export interface DatabasePropertyUpdateEvent {
  propertyId: string;
  databaseId: string;
  updates: {
    name?: string;
    type?: string;
    order?: number;
    width?: number;
    isVisible?: boolean;
    options?: unknown;
  };
  userId: string;
}

export interface DatabasePropertyDeleteEvent {
  propertyId: string;
  databaseId: string;
  userId: string;
}

export interface DatabasePropertyReorderEvent {
  propertyId: string;
  databaseId: string;
  order: number;
  userId: string;
}

export interface CommentCreateEvent {
  commentId: string;
  pageId: string;
  content: string;
  parentId?: string | null;
  blockId?: string | null;
  userId: string;
  userName?: string;
  userImage?: string;
}

export interface CommentUpdateEvent {
  commentId: string;
  pageId: string;
  content: string;
  userId: string;
}

export interface CommentDeleteEvent {
  commentId: string;
  pageId: string;
  userId: string;
}

export interface CommentResolveEvent {
  commentId: string;
  pageId: string;
  resolved: boolean;
  resolvedBy: string;
  userId: string;
}

export interface NotificationNewEvent {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  pageId?: string;
  actorId?: string;
}

export interface NotificationReadEvent {
  notificationId: string;
  userId: string;
}

export interface NotificationDeleteEvent {
  notificationId: string;
  userId: string;
}

export interface PresenceJoinEvent {
  userId: string;
  userName: string;
  userImage?: string;
  pageId: string;
  color: string;
}

export interface PresenceLeaveEvent {
  userId: string;
  pageId: string;
}

export interface PresenceUpdateEvent {
  userId: string;
  pageId: string;
  status: 'online' | 'away' | 'offline';
}

export interface PresenceCursorEvent {
  userId: string;
  pageId: string;
  cursorPosition?: {
    blockId: string;
    offset: number;
  };
}

export interface FavoriteAddEvent {
  pageId: string;
  userId: string;
}

export interface FavoriteRemoveEvent {
  pageId: string;
  userId: string;
}

export interface ShareAddEvent {
  shareId: string;
  pageId: string;
  userId?: string;
  email?: string;
  role: string;
  invitedBy: string;
}

export interface ShareUpdateEvent {
  shareId: string;
  pageId: string;
  role: string;
  userId: string;
}

export interface ShareRemoveEvent {
  shareId: string;
  pageId: string;
  userId: string;
}

export interface SyncRequestEvent {
  userId: string;
  entityType: 'documents' | 'database' | 'comments' | 'notifications';
  lastSyncTime?: string;
}

export interface SyncResponseEvent {
  entityType: 'documents' | 'database' | 'comments' | 'notifications';
  data: unknown;
  timestamp: string;
}

export interface ErrorEvent {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AckEvent {
  eventType: string;
  eventId?: string;
  success: boolean;
  error?: string;
}

export type WebSocketEvent =
  | { type: typeof WS_EVENTS.DOC_CREATE; payload: DocumentCreateEvent }
  | { type: typeof WS_EVENTS.DOC_UPDATE; payload: DocumentUpdateEvent }
  | { type: typeof WS_EVENTS.DOC_DELETE; payload: DocumentDeleteEvent }
  | { type: typeof WS_EVENTS.DOC_ARCHIVE; payload: DocumentArchiveEvent }
  | { type: typeof WS_EVENTS.DOC_RESTORE; payload: DocumentRestoreEvent }
  | { type: typeof WS_EVENTS.DOC_MOVE; payload: DocumentMoveEvent }
  | { type: typeof WS_EVENTS.DOC_REORDER; payload: DocumentReorderEvent }
  | { type: typeof WS_EVENTS.DB_CREATE; payload: DatabaseCreateEvent }
  | { type: typeof WS_EVENTS.DB_UPDATE; payload: DatabaseUpdateEvent }
  | { type: typeof WS_EVENTS.DB_DELETE; payload: DatabaseDeleteEvent }
  | { type: typeof WS_EVENTS.DB_ROW_CREATE; payload: DatabaseRowCreateEvent }
  | { type: typeof WS_EVENTS.DB_ROW_UPDATE; payload: DatabaseRowUpdateEvent }
  | { type: typeof WS_EVENTS.DB_ROW_DELETE; payload: DatabaseRowDeleteEvent }
  | { type: typeof WS_EVENTS.DB_ROW_REORDER; payload: DatabaseRowReorderEvent }
  | { type: typeof WS_EVENTS.DB_CELL_UPDATE; payload: DatabaseCellUpdateEvent }
  | {
      type: typeof WS_EVENTS.DB_CELL_BATCH_UPDATE;
      payload: DatabaseCellBatchUpdateEvent;
    }
  | {
      type: typeof WS_EVENTS.DB_PROPERTY_CREATE;
      payload: DatabasePropertyCreateEvent;
    }
  | {
      type: typeof WS_EVENTS.DB_PROPERTY_UPDATE;
      payload: DatabasePropertyUpdateEvent;
    }
  | {
      type: typeof WS_EVENTS.DB_PROPERTY_DELETE;
      payload: DatabasePropertyDeleteEvent;
    }
  | {
      type: typeof WS_EVENTS.DB_PROPERTY_REORDER;
      payload: DatabasePropertyReorderEvent;
    }
  | { type: typeof WS_EVENTS.COMMENT_CREATE; payload: CommentCreateEvent }
  | { type: typeof WS_EVENTS.COMMENT_UPDATE; payload: CommentUpdateEvent }
  | { type: typeof WS_EVENTS.COMMENT_DELETE; payload: CommentDeleteEvent }
  | { type: typeof WS_EVENTS.COMMENT_RESOLVE; payload: CommentResolveEvent }
  | { type: typeof WS_EVENTS.NOTIFICATION_NEW; payload: NotificationNewEvent }
  | { type: typeof WS_EVENTS.NOTIFICATION_READ; payload: NotificationReadEvent }
  | {
      type: typeof WS_EVENTS.NOTIFICATION_DELETE;
      payload: NotificationDeleteEvent;
    }
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
  | { type: typeof WS_EVENTS.ACK; payload: AckEvent };

export function createEvent<T extends WebSocketEvent['type']>(
  type: T,
  payload: Extract<WebSocketEvent, { type: T }>['payload']
): Extract<WebSocketEvent, { type: T }> {
  return { type, payload } as Extract<WebSocketEvent, { type: T }>;
}

export function validateEvent(event: unknown): event is WebSocketEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as Record<string, unknown>;
  return (
    typeof e.type === 'string' &&
    'payload' in e &&
    (Object.values(WS_EVENTS) as string[]).includes(e.type)
  );
}

export function getDocumentRoom(documentId: string): string {
  return `document:${documentId}`;
}

export function getDatabaseRoom(databaseId: string): string {
  return `database:${databaseId}`;
}

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getDocumentRooms(documentId: string, userId: string): string[] {
  return [getDocumentRoom(documentId), getUserRoom(userId)];
}
