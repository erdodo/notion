"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io as ClientIO, Socket } from "socket.io-client"
import { useDocumentsStore } from "@/store/use-documents-store"
import { useDatabaseStore } from "@/store/use-database-store"
import { useCommentsStore } from "@/store/use-comments-store"
import { useNotificationsStore } from "@/store/use-notifications-store"
import { usePresenceStore } from "@/store/use-presence-store"
import { WS_EVENTS } from "@/lib/websocket-events"
import { useSession } from "next-auth/react"

type SocketContextType = {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const { data: session } = useSession()

    // Get store actions
    const documentsStore = useDocumentsStore()
    const databaseStore = useDatabaseStore()
    const commentsStore = useCommentsStore()
    const notificationsStore = useNotificationsStore()
    const presenceStore = usePresenceStore()

    useEffect(() => {
        const socketInstance = ClientIO(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
            path: "/socket.io",
            addTrailingSlash: false,
        })

        socketInstance.on("connect", () => {
            setIsConnected(true)
            console.log("[Socket] Connected:", socketInstance.id)
        })

        socketInstance.on("disconnect", () => {
            setIsConnected(false)
            console.log("[Socket] Disconnected")
        })

        // ============ Document Events ============

        socketInstance.on(WS_EVENTS.DOC_CREATE, (payload: any) => {
            console.log("[Socket] DOC_CREATE:", payload)
            // Only add if not from current user (to avoid duplicate with optimistic)
            if (payload.userId !== session?.user?.id) {
                documentsStore.addDocument(payload.document)
            }
        })

        socketInstance.on(WS_EVENTS.DOC_UPDATE, (payload: any) => {
            console.log("[Socket] DOC_UPDATE:", payload)
            if (payload.userId !== session?.user?.id) {
                documentsStore.updateDocument(payload.id, payload.updates)
            }
        })

        socketInstance.on(WS_EVENTS.DOC_DELETE, (payload: any) => {
            console.log("[Socket] DOC_DELETE:", payload)
            if (payload.userId !== session?.user?.id) {
                documentsStore.removeDocument(payload.id)
            }
        })

        socketInstance.on(WS_EVENTS.DOC_ARCHIVE, (payload: any) => {
            console.log("[Socket] DOC_ARCHIVE:", payload)
            if (payload.userId !== session?.user?.id) {
                documentsStore.archiveDocument(payload.id)
            }
        })

        socketInstance.on(WS_EVENTS.DOC_RESTORE, (payload: any) => {
            console.log("[Socket] DOC_RESTORE:", payload)
            if (payload.userId !== session?.user?.id) {
                documentsStore.restoreDocument(payload.id)
            }
        })

        // ============ Database Events ============

        socketInstance.on(WS_EVENTS.DB_CELL_UPDATE, (payload: any) => {
            console.log("[Socket] DB_CELL_UPDATE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.updateCell(payload.databaseId, payload.rowId, payload.propertyId, payload.value)
            }
        })

        socketInstance.on(WS_EVENTS.DB_ROW_CREATE, (payload: any) => {
            console.log("[Socket] DB_ROW_CREATE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.createRow(payload.databaseId, {
                    id: payload.rowId,
                    databaseId: payload.databaseId,
                    pageId: payload.pageId,
                    order: payload.order,
                    parentRowId: payload.parentRowId,
                    cells: []
                })
            }
        })

        socketInstance.on(WS_EVENTS.DB_ROW_UPDATE, (payload: any) => {
            console.log("[Socket] DB_ROW_UPDATE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.updateRow(payload.databaseId, payload.rowId, payload.updates)
            }
        })

        socketInstance.on(WS_EVENTS.DB_ROW_DELETE, (payload: any) => {
            console.log("[Socket] DB_ROW_DELETE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.deleteRow(payload.databaseId, payload.rowId)
            }
        })

        socketInstance.on(WS_EVENTS.DB_PROPERTY_CREATE, (payload: any) => {
            console.log("[Socket] DB_PROPERTY_CREATE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.createProperty(payload.databaseId, {
                    id: payload.propertyId,
                    name: payload.name,
                    type: payload.type,
                    databaseId: payload.databaseId,
                    order: payload.order,
                    width: 200,
                    isVisible: true
                })
            }
        })

        socketInstance.on(WS_EVENTS.DB_PROPERTY_UPDATE, (payload: any) => {
            console.log("[Socket] DB_PROPERTY_UPDATE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.updateProperty(payload.databaseId, payload.propertyId, payload.updates)
            }
        })

        socketInstance.on(WS_EVENTS.DB_PROPERTY_DELETE, (payload: any) => {
            console.log("[Socket] DB_PROPERTY_DELETE:", payload)
            if (payload.userId !== session?.user?.id) {
                databaseStore.deleteProperty(payload.databaseId, payload.propertyId)
            }
        })

        // ============ Comment Events ============

        socketInstance.on(WS_EVENTS.COMMENT_CREATE, (payload: any) => {
            console.log("[Socket] COMMENT_CREATE:", payload)
            if (payload.userId !== session?.user?.id) {
                commentsStore.addComment({
                    id: payload.commentId,
                    content: payload.content,
                    pageId: payload.pageId,
                    userId: payload.userId,
                    userName: payload.userName,
                    userImage: payload.userImage,
                    parentId: payload.parentId,
                    blockId: payload.blockId,
                    resolved: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
        })

        socketInstance.on(WS_EVENTS.COMMENT_UPDATE, (payload: any) => {
            console.log("[Socket] COMMENT_UPDATE:", payload)
            if (payload.userId !== session?.user?.id) {
                commentsStore.updateComment(payload.commentId, { content: payload.content })
            }
        })

        socketInstance.on(WS_EVENTS.COMMENT_DELETE, (payload: any) => {
            console.log("[Socket] COMMENT_DELETE:", payload)
            if (payload.userId !== session?.user?.id) {
                commentsStore.deleteComment(payload.commentId, payload.pageId)
            }
        })

        socketInstance.on(WS_EVENTS.COMMENT_RESOLVE, (payload: any) => {
            console.log("[Socket] COMMENT_RESOLVE:", payload)
            if (payload.userId !== session?.user?.id) {
                commentsStore.resolveComment(payload.commentId, payload.pageId, payload.resolved, payload.resolvedBy)
            }
        })

        // ============ Notification Events ============

        socketInstance.on(WS_EVENTS.NOTIFICATION_NEW, (payload: any) => {
            console.log("[Socket] NOTIFICATION_NEW:", payload)
            notificationsStore.handleNewNotification({
                id: payload.notificationId,
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                pageId: payload.pageId,
                actorId: payload.actorId,
                read: false,
                createdAt: new Date().toISOString()
            })
        })

        socketInstance.on(WS_EVENTS.NOTIFICATION_READ, (payload: any) => {
            console.log("[Socket] NOTIFICATION_READ:", payload)
            notificationsStore.handleNotificationRead(payload.notificationId)
        })

        // ============ Presence Events ============

        socketInstance.on(WS_EVENTS.PRESENCE_JOIN, (payload: any) => {
            console.log("[Socket] PRESENCE_JOIN:", payload)
            presenceStore.joinPage(payload.pageId, {
                userId: payload.userId,
                userName: payload.userName,
                userImage: payload.userImage,
                pageId: payload.pageId,
                color: payload.color,
                status: 'online',
                lastSeen: new Date().toISOString()
            })
        })

        socketInstance.on(WS_EVENTS.PRESENCE_LEAVE, (payload: any) => {
            console.log("[Socket] PRESENCE_LEAVE:", payload)
            presenceStore.leavePage(payload.pageId, payload.userId)
        })

        socketInstance.on(WS_EVENTS.PRESENCE_CURSOR, (payload: any) => {
            console.log("[Socket] PRESENCE_CURSOR:", payload)
            presenceStore.updateCursor(payload.pageId, payload.userId, payload.cursorPosition)
        })

        // ============ Favorite Events ============

        socketInstance.on(WS_EVENTS.FAVORITE_ADD, (payload: any) => {
            console.log("[Socket] FAVORITE_ADD:", payload)
            // Trigger favorite list refresh
            if (payload.userId === session?.user?.id) {
                document.dispatchEvent(new CustomEvent('favorite-changed'))
            }
        })

        socketInstance.on(WS_EVENTS.FAVORITE_REMOVE, (payload: any) => {
            console.log("[Socket] FAVORITE_REMOVE:", payload)
            if (payload.userId === session?.user?.id) {
                document.dispatchEvent(new CustomEvent('favorite-changed'))
            }
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [session?.user?.id])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
