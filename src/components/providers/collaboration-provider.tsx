"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { useSocket } from "@/components/providers/socket-provider" // Replaced pusherClient
import * as Y from "yjs"
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness"
import { useSession } from "next-auth/react"
import randomColor from "randomcolor"
import { useDebouncedCallback } from "use-debounce"
import { Observable } from "lib0/observable"
import { useRouter } from "next/navigation"

interface UserInfo {
    name: string
    color: string
    image?: string
    email?: string
}

interface CollaborationContextType {
    provider: any
    yDoc: Y.Doc
    user: UserInfo | null
    activeUsers: UserInfo[]
}

const CollaborationContext = createContext<CollaborationContextType | null>(null)

export const useCollaboration = () => {
    const context = useContext(CollaborationContext)
    if (!context) {
        throw new Error("useCollaboration must be used within a CollaborationProvider")
    }
    return context
}

export const useOptionalCollaboration = () => {
    return useContext(CollaborationContext)
}

interface CollaborationProviderProps {
    documentId: string
    children: ReactNode
}

// Helpers for base64
function toBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

function fromBase64(base64: string) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

// Mock Provider for Tiptap Collaboration Cursor
// Tiptap expects a provider with an 'awareness' property
class PusherAwarenessProvider extends Observable<any> {
    awareness: Awareness

    constructor(awareness: Awareness) {
        super()
        this.awareness = awareness
    }

    connect() { }
    disconnect() { }
}

export const CollaborationProvider = ({ documentId, children }: CollaborationProviderProps) => {
    const { data: session } = useSession()
    const router = useRouter()
    const [activeUsers, setActiveUsers] = useState<UserInfo[]>([])

    const { socket } = useSocket()

    // Create Yjs Doc and Awareness
    const { yDoc, awareness, provider } = useMemo(() => {
        const doc = new Y.Doc()
        const aware = new Awareness(doc)
        const prov = new PusherAwarenessProvider(aware)
        return { yDoc: doc, awareness: aware, provider: prov }
    }, [documentId])

    // User Color
    const userColor = useMemo(() => {
        return randomColor({
            luminosity: 'dark',
            format: 'hex'
        })
    }, [])

    // Debounce sending updates
    const sendAwarenessUpdate = useDebouncedCallback((update: Uint8Array) => {
        if (!socket) return
        const updateStr = toBase64(update)
        socket.emit("awareness-update", {
            roomId: `presence-doc-${documentId}`,
            update: updateStr
        })
    }, 200)

    useEffect(() => {
        if (!socket || !session?.user?.email) return

        const roomId = `presence-doc-${documentId}`
        socket.emit("join-room", roomId)

        // Handle remote awareness updates
        const handleRemoteAwareness = ({ update }: { update: string }) => {
            try {
                const updateBuffer = fromBase64(update)
                applyAwarenessUpdate(awareness, updateBuffer, "remote")
            } catch (e) {
                console.error("Error applying awareness update", e)
            }
        }

        socket.on("awareness-update", handleRemoteAwareness)

        // Local Awareness -> Broadcast
        const handleLocalAwareness = ({ added, updated, removed }: any, origin: any) => {
            if (origin === 'local') {
                const update = encodeAwarenessUpdate(awareness, [awareness.clientID])
                sendAwarenessUpdate(update)
            }
        }

        awareness.on('update', handleLocalAwareness)

        // Set Local State
        awareness.setLocalStateField("user", {
            name: session.user.name,
            color: userColor,
            image: session.user.image,
            email: session.user.email,
        })

        // Broadcast local awareness immediately
        const update = encodeAwarenessUpdate(awareness, [awareness.clientID])
        sendAwarenessUpdate(update)

        // Active Users Management - Simplified:
        // We can get active users from awareness states
        const updateActiveUsers = () => {
            const states = awareness.getStates()
            const users: UserInfo[] = []
            states.forEach((state: any) => {
                if (state.user) {
                    users.push(state.user)
                }
            })
            // Filter duplicates based on email if needed, or strictly use clientID
            // For UI, we usually unique by user email
            const uniqueUsers = Array.from(new Map(users.map(u => [u.email, u])).values())
                .filter(u => u.email !== session.user?.email) // Exclude self from "Active Users" list? Pusher logic did.

            // Defer state update to avoid "Cannot update a component while rendering a different component"
            // This happens because BlockNote might trigger awareness changes during its render phase.
            setTimeout(() => {
                setActiveUsers(uniqueUsers)
            }, 0)
        }

        awareness.on('change', updateActiveUsers)
        updateActiveUsers() // Initial

        return () => {
            socket.emit("leave-room", roomId)
            socket.off("awareness-update", handleRemoteAwareness)
            awareness.off('update', handleLocalAwareness)
            awareness.off('change', updateActiveUsers)
        }
    }, [documentId, session, awareness, sendAwarenessUpdate, userColor, socket])

    return (
        <CollaborationContext.Provider value={{ provider, yDoc, user: { name: session?.user?.name || "Me", color: userColor }, activeUsers }}>
            {children}
        </CollaborationContext.Provider>
    )
}
