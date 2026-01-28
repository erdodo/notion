import { createServer } from 'node:http';

import next from 'next';
import { Server, Socket } from 'socket.io';

import { WS_EVENTS, type WebSocketEvent } from './lib/websocket-events';

const development = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);

const app = next({ dev: development, hostname, port });
const handler = app.getRequestHandler();

const roomUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer((request, res) => {
    console.error(`[CustomServer] ${request.method} ${request.url}`);

    if (request.url?.startsWith('/socket.io')) {
      console.error('[CustomServer] Handling Socket.io request');
      if (io) {
        io.engine.handleRequest(request as any, res);
      } else {
        res.statusCode = 503;
        res.end('Socket.io not ready');
      }
      return;
    }
    handler(request, res);
  });

  const io = new Server(httpServer, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },

    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  const broadcastToRoom = (
    roomId: string,
    event: WebSocketEvent,
    excludeSocketId?: string
  ) => {
    if (excludeSocketId) {
      io.to(roomId).except(excludeSocketId).emit(event.type, event.payload);
    } else {
      io.to(roomId).emit(event.type, event.payload);
    }
    console.log(`[WS] Broadcast ${event.type} to room ${roomId}`);
  };

  const emitToUser = (userId: string, event: WebSocketEvent) => {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit(event.type, event.payload);
    console.log(`[WS] Emit ${event.type} to user ${userId}`);
  };

  io.on('connection', (socket: Socket) => {
    console.log('[WS] Client connected:', socket.id);

    let currentUserId: string | null = null;
    const currentRooms = new Set<string>();

    socket.on('join-room', (data: { roomId: string; userId?: string }) => {
      const { roomId, userId } = data;
      socket.join(roomId);
      currentRooms.add(roomId);

      if (userId) {
        currentUserId = userId;

        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        currentRooms.add(userRoom);
      }

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      if (userId) {
        roomUsers.get(roomId)?.add(userId);
      }

      console.log(
        `[WS] Socket ${socket.id} joined room ${roomId}`,
        userId ? `as user ${userId}` : ''
      );

      if (userId && roomId.startsWith('document:')) {
        const users = [...(roomUsers.get(roomId) || [])];
        socket.emit('room:users', { roomId, users });
      }
    });

    socket.on('leave-room', (data: { roomId: string; userId?: string }) => {
      const { roomId, userId } = data;
      socket.leave(roomId);
      currentRooms.delete(roomId);

      if (userId) {
        roomUsers.get(roomId)?.delete(userId);
        if (roomUsers.get(roomId)?.size === 0) {
          roomUsers.delete(roomId);
        }
      }

      console.log(`[WS] Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('awareness-update', (data) => {
      socket.to(data.roomId).emit('awareness-update', data);
    });

    socket.on(WS_EVENTS.DOC_CREATE, (payload) => {
      if (payload.userId) {
        io.emit(WS_EVENTS.DOC_CREATE, payload);
      }
    });

    socket.on(WS_EVENTS.DOC_UPDATE, (payload) => {
      const roomId = `document:${payload.id}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DOC_UPDATE, payload },
        socket.id
      );

      if (payload.userId) {
        io.emit(WS_EVENTS.DOC_UPDATE, payload);
      }
    });

    socket.on(WS_EVENTS.DOC_DELETE, (payload) => {
      const roomId = `document:${payload.id}`;
      broadcastToRoom(roomId, { type: WS_EVENTS.DOC_DELETE, payload });

      io.emit(WS_EVENTS.DOC_DELETE, payload);
    });

    socket.on(WS_EVENTS.DOC_ARCHIVE, (payload) => {
      const roomId = `document:${payload.id}`;
      broadcastToRoom(roomId, { type: WS_EVENTS.DOC_ARCHIVE, payload });
      io.emit(WS_EVENTS.DOC_ARCHIVE, payload);
    });

    socket.on(WS_EVENTS.DOC_RESTORE, (payload) => {
      const roomId = `document:${payload.id}`;
      broadcastToRoom(roomId, { type: WS_EVENTS.DOC_RESTORE, payload });
      io.emit(WS_EVENTS.DOC_RESTORE, payload);
    });

    socket.on(WS_EVENTS.DB_CELL_UPDATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_CELL_UPDATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_CELL_BATCH_UPDATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_CELL_BATCH_UPDATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_ROW_CREATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_ROW_CREATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_ROW_UPDATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_ROW_UPDATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_ROW_DELETE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_ROW_DELETE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_PROPERTY_CREATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_PROPERTY_CREATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_PROPERTY_UPDATE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_PROPERTY_UPDATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.DB_PROPERTY_DELETE, (payload) => {
      const roomId = `database:${payload.databaseId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.DB_PROPERTY_DELETE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.COMMENT_CREATE, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.COMMENT_CREATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.COMMENT_UPDATE, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.COMMENT_UPDATE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.COMMENT_DELETE, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.COMMENT_DELETE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.COMMENT_RESOLVE, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.COMMENT_RESOLVE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.NOTIFICATION_NEW, (payload) => {
      emitToUser(payload.userId, { type: WS_EVENTS.NOTIFICATION_NEW, payload });
    });

    socket.on(WS_EVENTS.NOTIFICATION_READ, (payload) => {
      emitToUser(payload.userId, {
        type: WS_EVENTS.NOTIFICATION_READ,
        payload,
      });
    });

    socket.on(WS_EVENTS.PRESENCE_JOIN, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.PRESENCE_JOIN, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.PRESENCE_LEAVE, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.PRESENCE_LEAVE, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.PRESENCE_CURSOR, (payload) => {
      const roomId = `document:${payload.pageId}`;
      broadcastToRoom(
        roomId,
        { type: WS_EVENTS.PRESENCE_CURSOR, payload },
        socket.id
      );
    });

    socket.on(WS_EVENTS.FAVORITE_ADD, (payload) => {
      emitToUser(payload.userId, { type: WS_EVENTS.FAVORITE_ADD, payload });
    });

    socket.on(WS_EVENTS.FAVORITE_REMOVE, (payload) => {
      emitToUser(payload.userId, { type: WS_EVENTS.FAVORITE_REMOVE, payload });
    });

    socket.on('error', (error) => {
      console.error('[WS] Socket error:', error);
      socket.emit(WS_EVENTS.ERROR, {
        message: 'WebSocket error occurred',
        details: error.message,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Client disconnected:', socket.id, 'Reason:', reason);

      for (const roomId of currentRooms) {
        if (currentUserId) {
          roomUsers.get(roomId)?.delete(currentUserId);
          if (roomUsers.get(roomId)?.size === 0) {
            roomUsers.delete(roomId);
          }
        }
      }

      if (currentUserId) {
        for (const roomId of currentRooms) {
          if (roomId.startsWith('document:')) {
            const pageId = roomId.replace('document:', '');
            broadcastToRoom(roomId, {
              type: WS_EVENTS.PRESENCE_LEAVE,
              payload: { userId: currentUserId, pageId },
            });
          }
        }
      }
    });
  });

  httpServer.on('upgrade', (request, _socket, _head) => {
    console.log(`[CustomServer] Upgrade request: ${request.url}`);
  });

  if (process.env.NODE_ENV === 'production') {
    (globalThis as unknown as { io: Server }).io = io;
  } else {
    (globalThis as unknown as { io: Server }).io = io;
  }

  httpServer
    .once('error', (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server ready for real-time events`);
    });
});
