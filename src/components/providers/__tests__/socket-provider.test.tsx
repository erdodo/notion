import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SocketProvider, useSocket } from '@/components/providers/socket-provider'
import { ReactNode } from 'react'

// Mock socket.io-client
const mockSocket = {
    id: 'test-socket-id',
    connected: false,
    disconnected: true,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    io: {
        opts: {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        }
    }
}

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket)
}))

describe('SocketProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSocket.connected = false
        mockSocket.disconnected = true
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <SocketProvider>{children}</SocketProvider>
    )

    describe('Initialization', () => {
        it('should create socket connection on mount', () => {
            const { io } = require('socket.io-client')

            renderHook(() => useSocket(), { wrapper })

            expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                transports: ['websocket', 'polling']
            }))
        })

        it('should provide socket instance through context', () => {
            const { result } = renderHook(() => useSocket(), { wrapper })

            expect(result.current.socket).toBeDefined()
            expect(result.current.socket).toBe(mockSocket)
        })

        it('should set initial connection state', () => {
            const { result } = renderHook(() => useSocket(), { wrapper })

            expect(result.current.isConnected).toBe(false)
        })
    })

    describe('Connection Events', () => {
        it('should update connection state on connect event', async () => {
            const { result } = renderHook(() => useSocket(), { wrapper })

            // Simulate connection
            mockSocket.connected = true
            mockSocket.disconnected = false

            const connectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'connect'
            )?.[1]

            connectHandler?.()

            await waitFor(() => {
                expect(result.current.isConnected).toBe(true)
            })
        })

        it('should update connection state on disconnect event', async () => {
            const { result } = renderHook(() => useSocket(), { wrapper })

            // First connect
            mockSocket.connected = true
            const connectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'connect'
            )?.[1]
            connectHandler?.()

            await waitFor(() => {
                expect(result.current.isConnected).toBe(true)
            })

            // Then disconnect
            mockSocket.connected = false
            mockSocket.disconnected = true

            const disconnectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'disconnect'
            )?.[1]
            disconnectHandler?.()

            await waitFor(() => {
                expect(result.current.isConnected).toBe(false)
            })
        })

        it('should handle connect_error event', () => {
            renderHook(() => useSocket(), { wrapper })

            const errorHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'connect_error'
            )?.[1]

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            errorHandler?.(new Error('Connection failed'))

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Socket connection error:',
                expect.any(Error)
            )

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Reconnection', () => {
        it('should attempt reconnection on disconnect', async () => {
            renderHook(() => useSocket(), { wrapper })

            const disconnectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'disconnect'
            )?.[1]

            disconnectHandler?.('transport close')

            // Should log reconnection attempt
            const reconnectAttemptHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'reconnect_attempt'
            )?.[1]

            expect(reconnectAttemptHandler).toBeDefined()
        })

        it('should handle successful reconnection', async () => {
            const { result } = renderHook(() => useSocket(), { wrapper })

            // Disconnect
            const disconnectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'disconnect'
            )?.[1]
            disconnectHandler?.()

            await waitFor(() => {
                expect(result.current.isConnected).toBe(false)
            })

            // Reconnect
            mockSocket.connected = true
            const reconnectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'reconnect'
            )?.[1]
            reconnectHandler?.(1)

            const connectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'connect'
            )?.[1]
            connectHandler?.()

            await waitFor(() => {
                expect(result.current.isConnected).toBe(true)
            })
        })

        it('should handle reconnection failure', () => {
            renderHook(() => useSocket(), { wrapper })

            const reconnectFailedHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'reconnect_failed'
            )?.[1]

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            reconnectFailedHandler?.()

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Socket reconnection failed after maximum attempts'
            )

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Cleanup', () => {
        it('should disconnect socket on unmount', () => {
            const { unmount } = renderHook(() => useSocket(), { wrapper })

            unmount()

            expect(mockSocket.disconnect).toHaveBeenCalled()
        })

        it('should remove all event listeners on unmount', () => {
            const { unmount } = renderHook(() => useSocket(), { wrapper })

            unmount()

            expect(mockSocket.off).toHaveBeenCalledWith('connect')
            expect(mockSocket.off).toHaveBeenCalledWith('disconnect')
            expect(mockSocket.off).toHaveBeenCalledWith('connect_error')
        })
    })

    describe('Multiple Consumers', () => {
        it('should provide same socket instance to multiple consumers', () => {
            const { result: result1 } = renderHook(() => useSocket(), { wrapper })
            const { result: result2 } = renderHook(() => useSocket(), { wrapper })

            expect(result1.current.socket).toBe(result2.current.socket)
        })

        it('should share connection state across consumers', async () => {
            const { result: result1 } = renderHook(() => useSocket(), { wrapper })
            const { result: result2 } = renderHook(() => useSocket(), { wrapper })

            mockSocket.connected = true
            const connectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'connect'
            )?.[1]
            connectHandler?.()

            await waitFor(() => {
                expect(result1.current.isConnected).toBe(true)
                expect(result2.current.isConnected).toBe(true)
            })
        })
    })

    describe('Error Handling', () => {
        it('should handle socket creation failure gracefully', () => {
            const { io } = require('socket.io-client')
            io.mockImplementationOnce(() => {
                throw new Error('Socket creation failed')
            })

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            expect(() => {
                renderHook(() => useSocket(), { wrapper })
            }).not.toThrow()

            consoleErrorSpy.mockRestore()
        })

        it('should provide null socket if connection fails', () => {
            const { io } = require('socket.io-client')
            io.mockImplementationOnce(() => null)

            const { result } = renderHook(() => useSocket(), { wrapper })

            expect(result.current.socket).toBeNull()
            expect(result.current.isConnected).toBe(false)
        })
    })

    describe('useSocket Hook', () => {
        it('should throw error when used outside SocketProvider', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            expect(() => {
                renderHook(() => useSocket())
            }).toThrow('useSocket must be used within a SocketProvider')

            consoleErrorSpy.mockRestore()
        })
    })
})
