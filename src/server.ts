
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("leave-room", (roomId) => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });

        // Handle awareness updates (cursor positions, presence) from clients
        socket.on("awareness-update", (data) => {
            // Broadcast to everyone in the room EXCEPT the sender
            socket.to(data.roomId).emit("awareness-update", data);
        });

        // Handle disconnecting
        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    httpServer.on("upgrade", (req, socket, head) => {
        console.log(`[CustomServer] Upgrade request: ${req.url}`);
    });

    // Make io accessible globally if needed, or we might need a separate mechanism 
    // for Server Actions to emit.
    // For now, let's attach it to global for simple access in dev (simpler than Redis adapter for now)
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
        });
});
