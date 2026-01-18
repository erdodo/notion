"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { pusherClient } from "@/lib/pusher-client"
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

    // Create Yjs Doc and Awareness
    // We use a singleton-like pattern via useMemo to ensure they persist across renders
    // Create Yjs Doc and Awareness
    // Recreate when documentId changes to ensure fresh state for each page
    const { yDoc, awareness, provider } = useMemo(() => {
        const doc = new Y.Doc()
        const aware = new Awareness(doc)
        const prov = new PusherAwarenessProvider(aware)
        return { yDoc: doc, awareness: aware, provider: prov }
    }, [documentId])

    // User Color - consistent for the session
    const userColor = useMemo(() => {
        return randomColor({
            luminosity: 'dark',
            format: 'hex'
        })
    }, [])

    // Debounce sending updates to Pusher
    const sendAwarenessUpdate = useDebouncedCallback((update: Uint8Array) => {
        const updateStr = toBase64(update)
        const channel = pusherClient.subscribe(`presence-doc-${documentId}`)
        // Trigger client event
        channel.trigger('client-awareness-update', { update: updateStr })
    }, 200)

    useEffect(() => {
        if (!session?.user?.email) return

        const channelName = `presence-doc-${documentId}`
        const channel = pusherClient.subscribe(channelName)

        const updateMembers = () => {
            // Use Pusher members for the "Active Users" list (Avatars)
            // @ts-ignore
            const membersFn = channel.members
            if (!membersFn) return

            const currentMembers: UserInfo[] = []
            // @ts-ignore
            membersFn.each((member: any) => {
                // Avoid adding self to the list if desired, but usually we want to show all OR exclude self.
                // Usually show others.
                if (member.id !== session.user?.email) {
                    currentMembers.push({
                        name: member.info.name || "Anonymous",
                        email: member.info.email,
                        image: member.info.image,
                        color: randomColor({ seed: member.id, luminosity: 'dark' }) // Deterministic color from ID if possible
                    })
                }
            })
            setActiveUsers(currentMembers)
        }

        // Bind events
        channel.bind("pusher:subscription_succeeded", () => {
            updateMembers()
            // Broadcast local awareness immediately so others see my cursor
            const update = encodeAwarenessUpdate(awareness, [awareness.clientID])
            sendAwarenessUpdate(update)
        })
        channel.bind("pusher:member_added", updateMembers)
        channel.bind("pusher:member_removed", updateMembers)

        // Generic Document Update (Optimistic UI)
        channel.bind("document-update", () => {
            router.refresh()
        })

        // Cloud Awareness Broadcast
        channel.bind("client-awareness-update", ({ update }: { update: string }) => {
            try {
                const updateBuffer = fromBase64(update)
                applyAwarenessUpdate(awareness, updateBuffer, "remote")
            } catch (e) {
                console.error("Error applying awareness update", e)
            }
        })

        // Local Awareness -> Broadcast
        const handleAwarenessUpdate = ({ added, updated, removed }: any, origin: any) => {
            if (origin === 'local') {
                const update = encodeAwarenessUpdate(awareness, [awareness.clientID])
                sendAwarenessUpdate(update)
            }
        }

        awareness.on('update', handleAwarenessUpdate)

        // Set Local State
        awareness.setLocalStateField("user", {
            name: session.user.name,
            color: userColor,
        })

        return () => {
            pusherClient.unsubscribe(channelName)
            channel.unbind_all()
            awareness.off('update', handleAwarenessUpdate)
            // We do NOT destroy yDoc here because this component might unmount/remount
            // Actually we SHOULD destroy to clean up listeners.
            // But provider is separate.
        }
    }, [documentId, session, awareness, sendAwarenessUpdate, userColor])

    return (
        <CollaborationContext.Provider value={{ provider, yDoc, user: { name: session?.user?.name || "Me", color: userColor }, activeUsers }}>
            {children}
        </CollaborationContext.Provider>
    )
}
