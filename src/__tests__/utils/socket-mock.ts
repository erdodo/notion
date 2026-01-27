import type { Socket } from 'socket.io-client';
import { vi } from 'vitest';

type EventHandler = (...arguments_: any[]) => void;

export function createMockSocket(): Socket {
  const eventHandlers = new Map<string, EventHandler[]>();

  const mockSocket = {
    id: 'mock-socket-id',
    connected: true,
    disconnected: false,

    on: vi.fn((event: string, handler: EventHandler) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, []);
      }
      eventHandlers.get(event)!.push(handler);
      return mockSocket;
    }),

    off: vi.fn((event: string, handler?: EventHandler) => {
      if (handler) {
        const handlers = eventHandlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      } else {
        eventHandlers.delete(event);
      }
      return mockSocket;
    }),

    emit: vi.fn((_event: string, ..._arguments: any[]) => {
      return mockSocket;
    }),

    once: vi.fn((event: string, handler: EventHandler) => {
      const wrappedHandler = (...arguments_: any[]) => {
        handler(...arguments_);
        mockSocket.off(event, wrappedHandler);
      };
      return mockSocket.on(event, wrappedHandler);
    }),

    connect: vi.fn(() => {
      mockSocket.connected = true;
      mockSocket.disconnected = false;
      return mockSocket;
    }),

    disconnect: vi.fn(() => {
      mockSocket.connected = false;
      mockSocket.disconnected = true;
      return mockSocket;
    }),

    _trigger: (event: string, ...arguments_: any[]) => {
      const handlers = eventHandlers.get(event) || [];
      for (const handler of handlers) handler(...arguments_);
    },

    _clearHandlers: () => {
      eventHandlers.clear();
    },

    _getHandlers: (event: string) => {
      return eventHandlers.get(event) || [];
    },
  } as unknown as Socket;

  return mockSocket;
}

export function createMockSocketContext() {
  const mockSocket = createMockSocket();

  return {
    socket: mockSocket,
    isConnected: true,
    _mockSocket: mockSocket,
  };
}

export async function waitForSocketUpdate() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
