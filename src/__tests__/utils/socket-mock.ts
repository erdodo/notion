import { vi } from 'vitest'
import type { Socket } from 'socket.io-client'

/**
 * Mock Socket.IO client for testing
 */
export function createMockSocket(): Socket {
    const eventHandlers = new Map<string, Function[]>()

    const mockSocket = {
        id: 'mock-socket-id',
        connected: true,
        disconnected: false,

        on: vi.fn((event: string, handler: Function) => {
            if (!eventHandlers.has(event)) {
                eventHandlers.set(event, [])
            }
            eventHandlers.get(event)!.push(handler)
            return mockSocket
        }),

        off: vi.fn((event: string, handler?: Function) => {
            if (handler) {
                const handlers = eventHandlers.get(event) || []
                const index = handlers.indexOf(handler)
                if (index > -1) {
                    handlers.splice(index, 1)
                }
            } else {
                eventHandlers.delete(event)
            }
            return mockSocket
        }),

        emit: vi.fn((event: string, ...args: any[]) => {
            return mockSocket
        }),

        once: vi.fn((event: string, handler: Function) => {
            const wrappedHandler = (...args: any[]) => {
                handler(...args)
                mockSocket.off(event, wrappedHandler)
            }
            return mockSocket.on(event, wrappedHandler)
        }),

        connect: vi.fn(() => {
            mockSocket.connected = true
            mockSocket.disconnected = false
            return mockSocket
        }),

        disconnect: vi.fn(() => {
            mockSocket.connected = false
            mockSocket.disconnected = true
            return mockSocket
        }),

        // Helper method to trigger events in tests
        _trigger: (event: string, ...args: any[]) => {
            const handlers = eventHandlers.get(event) || []
            handlers.forEach(handler => handler(...args))
        },

        // Helper to clear all handlers
        _clearHandlers: () => {
            eventHandlers.clear()
        },

        // Helper to get registered handlers
        _getHandlers: (event: string) => {
            return eventHandlers.get(event) || []
        }
    } as any

    return mockSocket
}

/**
 * Mock SocketProvider context value
 */
export function createMockSocketContext() {
    const mockSocket = createMockSocket()

    return {
        socket: mockSocket,
        isConnected: true,
        _mockSocket: mockSocket // Expose for test manipulation
    }
}

/**
 * Helper to wait for async updates in tests
 */
export async function waitForSocketUpdate() {
    return new Promise(resolve => setTimeout(resolve, 0))
}
