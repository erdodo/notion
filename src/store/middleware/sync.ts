import { Socket } from 'socket.io-client';
import { StateCreator } from 'zustand';

export interface SyncOptions {
  socket: Socket | null;
  events: Record<string, (state: unknown, payload: unknown) => unknown>;
}

export function createSyncMiddleware<T>(
  config: StateCreator<T>,
  getSocket: () => Socket | null,
  eventHandlers: Record<
    string,
    (set: unknown, get: unknown, payload: unknown) => void
  >
) {
  return (set: any, get: any, api: any) => {
    const setupListeners = () => {
      const socket = getSocket();
      if (!socket) return;

      for (const [eventName, handler] of Object.entries(eventHandlers)) {
        socket.on(eventName, (payload: unknown) => {
          handler(set, get, payload);
        });
      }
    };

    if (globalThis.window !== undefined) {
      setupListeners();
    }

    return config(set as any, get, api);
  };
}

export interface OptimisticUpdate<T = unknown> {
  id: string;
  timestamp: number;
  optimisticState: T;
  rollback: () => void;
  serverAction: () => Promise<unknown>;
  status: 'pending' | 'success' | 'error';
  retryCount: number;
}

export class OptimisticUpdateManager<T> {
  private queue = new Map<string, OptimisticUpdate<T>>();
  private maxRetries = 3;

  add(
    id: string,
    optimisticState: T,
    rollback: () => void,
    serverAction: () => Promise<unknown>
  ): void {
    const update: OptimisticUpdate<T> = {
      id,
      timestamp: Date.now(),
      optimisticState,
      rollback,
      serverAction,
      status: 'pending',
      retryCount: 0,
    };

    this.queue.set(id, update);
    this.processUpdate(id);
  }

  private async processUpdate(id: string): Promise<void> {
    const update = this.queue.get(id);
    if (!update) return;

    try {
      await update.serverAction();
      update.status = 'success';
      this.queue.delete(id);
    } catch (error) {
      console.error(
        `[Optimistic] Update ${id} failed:`,
        error instanceof Error ? error.message : error
      );

      if (update.retryCount < this.maxRetries) {
        update.retryCount++;

        const delay = Math.pow(2, update.retryCount) * 1000;
        setTimeout(() => this.processUpdate(id), delay);
      } else {
        update.status = 'error';
        update.rollback();
        this.queue.delete(id);
      }
    }
  }

  getPending(): OptimisticUpdate<T>[] {
    return [...this.queue.values()].filter((u) => u.status === 'pending');
  }

  clear(): void {
    this.queue.clear();
  }

  rollback(id: string): void {
    const update = this.queue.get(id);
    if (update) {
      update.rollback();
      this.queue.delete(id);
    }
  }

  rollbackAll(): void {
    for (const [, update] of this.queue) update.rollback();
    this.queue.clear();
  }
}
