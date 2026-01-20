
import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { WS_EVENTS, validateEvent, type WebSocketEvent } from "./lib/websocket-events";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Track connected users per room for presence
const roomUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
    let io: Server;

    const httpServer = createServer((req, res) => {
        // Log every request to confirm server usage
        console.error(`[CustomServer] ${req.method} ${req.url}`);

        if (req.url?.startsWith("/socket.io")) {
            console.error("[CustomServer] Handling Socket.io request");
            if (io) {
                // Explicitly delegate to socket.io engine
                // @ts-ignore
                io.engine.handleRequest(req, res);
            } else {
                res.statusCode = 503;
                res.end("Socket.io not ready");
            }
            return;
        }
        handler(req, res);
    });

    io = new Server(httpServer, {
        path: "/socket.io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        // Add connection timeout and ping settings
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Helper function to broadcast events to a room
    const broadcastToRoom = (roomId: string, event: WebSocketEvent, excludeSocketId?: string) => {
        if (excludeSocketId) {
            io.to(roomId).except(excludeSocketId).emit(event.type, event.payload);
        } else {
            io.to(roomId).emit(event.type, event.payload);
        }
        console.log(`[WS] Broadcast ${event.type} to room ${roomId}`);
    };

    // Helper function to emit to specific user
    const emitToUser = (userId: string, event: WebSocketEvent) => {
        const userRoom = `user:${userId}`;
        io.to(userRoom).emit(event.type, event.payload);
        console.log(`[WS] Emit ${event.type} to user ${userId}`);
    };

    io.on("connection", (socket: Socket) => {
        console.log("[WS] Client connected:", socket.id);

        // Store user info on socket
        let currentUserId: string | null = null;
        let currentRooms: Set<string> = new Set();

        // Join room handler
        socket.on("join-room", (data: { roomId: string; userId?: string }) => {
            const { roomId, userId } = data;
            socket.join(roomId);
            currentRooms.add(roomId);

            if (userId) {
                currentUserId = userId;
                // Also join user-specific room for notifications
                const userRoom = `user:${userId}`;
                socket.join(userRoom);
                currentRooms.add(userRoom);
            }

            // Track users in room
            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Set());
            }
            if (userId) {
                roomUsers.get(roomId)?.add(userId);
            }

            console.log(`[WS] Socket ${socket.id} joined room ${roomId}`, userId ? `as user ${userId}` : '');

            // Send current room users to the new joiner
            if (userId && roomId.startsWith('document:')) {
                const users = Array.from(roomUsers.get(roomId) || []);
                socket.emit('room:users', { roomId, users });
            }
        });

        // Leave room handler
        socket.on("leave-room", (data: { roomId: string; userId?: string }) => {
            const { roomId, userId } = data;
            socket.leave(roomId);
            currentRooms.delete(roomId);

            // Remove user from room tracking
            if (userId) {
                roomUsers.get(roomId)?.delete(userId);
                if (roomUsers.get(roomId)?.size === 0) {
                    roomUsers.delete(roomId);
                }
            }

            console.log(`[WS] Socket ${socket.id} left room ${roomId}`);
        });

        // Handle awareness updates (cursor positions, presence) from clients
        socket.on("awareness-update", (data) => {
            // Broadcast to everyone in the room EXCEPT the sender
            socket.to(data.roomId).emit("awareness-update", data);
        });

        // ============ Document Events ============

        socket.on(WS_EVENTS.DOC_CREATE, (payload) => {
            // Broadcast to all users (they might have this in their sidebar)
            if (payload.userId) {
                io.emit(WS_EVENTS.DOC_CREATE, payload);
            }
        });

        socket.on(WS_EVENTS.DOC_UPDATE, (payload) => {
            const roomId = `document:${payload.id}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DOC_UPDATE, payload }, socket.id);
            // Also broadcast to user rooms for sidebar updates
            if (payload.userId) {
                io.emit(WS_EVENTS.DOC_UPDATE, payload);
            }
        });

        socket.on(WS_EVENTS.DOC_DELETE, (payload) => {
            const roomId = `document:${payload.id}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DOC_DELETE, payload });
            // Broadcast to all for sidebar updates
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

        // ============ Database Events ============

        socket.on(WS_EVENTS.DB_CELL_UPDATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_CELL_UPDATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_CELL_BATCH_UPDATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_CELL_BATCH_UPDATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_ROW_CREATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_ROW_CREATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_ROW_UPDATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_ROW_UPDATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_ROW_DELETE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_ROW_DELETE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_PROPERTY_CREATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_PROPERTY_CREATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_PROPERTY_UPDATE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_PROPERTY_UPDATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.DB_PROPERTY_DELETE, (payload) => {
            const roomId = `database:${payload.databaseId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.DB_PROPERTY_DELETE, payload }, socket.id);
        });

        // ============ Comment Events ============

        socket.on(WS_EVENTS.COMMENT_CREATE, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.COMMENT_CREATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.COMMENT_UPDATE, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.COMMENT_UPDATE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.COMMENT_DELETE, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.COMMENT_DELETE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.COMMENT_RESOLVE, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.COMMENT_RESOLVE, payload }, socket.id);
        });

        // ============ Notification Events ============

        socket.on(WS_EVENTS.NOTIFICATION_NEW, (payload) => {
            emitToUser(payload.userId, { type: WS_EVENTS.NOTIFICATION_NEW, payload });
        });

        socket.on(WS_EVENTS.NOTIFICATION_READ, (payload) => {
            emitToUser(payload.userId, { type: WS_EVENTS.NOTIFICATION_READ, payload });
        });

        // ============ Presence Events ============

        socket.on(WS_EVENTS.PRESENCE_JOIN, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.PRESENCE_JOIN, payload }, socket.id);
        });

        socket.on(WS_EVENTS.PRESENCE_LEAVE, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.PRESENCE_LEAVE, payload }, socket.id);
        });

        socket.on(WS_EVENTS.PRESENCE_CURSOR, (payload) => {
            const roomId = `document:${payload.pageId}`;
            broadcastToRoom(roomId, { type: WS_EVENTS.PRESENCE_CURSOR, payload }, socket.id);
        });

        // ============ Favorite Events ============

        socket.on(WS_EVENTS.FAVORITE_ADD, (payload) => {
            emitToUser(payload.userId, { type: WS_EVENTS.FAVORITE_ADD, payload });
        });

        socket.on(WS_EVENTS.FAVORITE_REMOVE, (payload) => {
            emitToUser(payload.userId, { type: WS_EVENTS.FAVORITE_REMOVE, payload });
        });

        // ============ Error Handling ============

        socket.on("error", (error) => {
            console.error("[WS] Socket error:", error);
            socket.emit(WS_EVENTS.ERROR, {
                message: "WebSocket error occurred",
                details: error.message
            });
        });

        // Handle disconnecting
        socket.on("disconnect", (reason) => {
            console.log("[WS] Client disconnected:", socket.id, "Reason:", reason);

            // Clean up room tracking
            currentRooms.forEach(roomId => {
                if (currentUserId) {
                    roomUsers.get(roomId)?.delete(currentUserId);
                    if (roomUsers.get(roomId)?.size === 0) {
                        roomUsers.delete(roomId);
                    }
                }
            });

            // Broadcast presence leave to all rooms user was in
            if (currentUserId) {
                currentRooms.forEach(roomId => {
                    if (roomId.startsWith('document:')) {
                        const pageId = roomId.replace('document:', '');
                        broadcastToRoom(roomId, {
                            type: WS_EVENTS.PRESENCE_LEAVE,
                            payload: { userId: currentUserId!, pageId }
                        });
                    }
                });
            }
        });
    });

    httpServer.on("upgrade", (req, socket, head) => {
        console.log(`[CustomServer] Upgrade request: ${req.url}`);
    });

    // Make io accessible globally for Server Actions to emit events
    // In production with multiple instances, Redis Adapter is needed.
    if (process.env.NODE_ENV !== "production") {
        (global as any).io = io;
    } else {
        // In production, we might need a different strategy or ensure single instance
        (global as any).io = io;
    }

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> WebSocket server ready for real-time events`);
        });
});
