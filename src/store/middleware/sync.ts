/**
 * Store Sync Middleware
 * 
 * Automatically syncs Zustand store state with WebSocket events
 */

import { StateCreator } from 'zustand';
import { Socket } from 'socket.io-client';

export interface SyncOptions {
    socket: Socket | null;
    events: {
        [eventName: string]: (state: any, payload: any) => any;
    };
}

/**
 * Create a sync middleware that listens to WebSocket events
 * and updates store state accordingly
 */
export function createSyncMiddleware<T>(
    config: StateCreator<T>,
    getSocket: () => Socket | null,
    eventHandlers: { [eventName: string]: (set: any, get: any, payload: any) => void }
) {
    return (set: any, get: any, api: any) => {
        // Set up WebSocket event listeners
        const setupListeners = () => {
            const socket = getSocket();
            if (!socket) return;

            Object.entries(eventHandlers).forEach(([eventName, handler]) => {
                socket.on(eventName, (payload: any) => {
                    handler(set, get, payload);
                });
            });
        };

        // Clean up listeners
        const cleanupListeners = () => {
            const socket = getSocket();
            if (!socket) return;

            Object.keys(eventHandlers).forEach((eventName) => {
                socket.off(eventName);
            });
        };

        // Set up listeners on initialization
        if (typeof window !== 'undefined') {
            setupListeners();
        }

        return config(set, get, api);
    };
}

/**
 * Optimistic update queue item
 */
export interface OptimisticUpdate<T = any> {
    id: string;
    timestamp: number;
    optimisticState: T;
    rollback: () => void;
    serverAction: () => Promise<any>;
    status: 'pending' | 'success' | 'error';
    retryCount: number;
}

/**
 * Optimistic update manager
 */
export class OptimisticUpdateManager<T> {
    private queue: Map<string, OptimisticUpdate<T>> = new Map();
    private maxRetries = 3;

    /**
     * Add an optimistic update to the queue
     */
    add(
        id: string,
        optimisticState: T,
        rollback: () => void,
        serverAction: () => Promise<any>
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

    /**
     * Process an optimistic update
     */
    private async processUpdate(id: string): Promise<void> {
        const update = this.queue.get(id);
        if (!update) return;

        try {
            await update.serverAction();
            update.status = 'success';
            this.queue.delete(id);
        } catch (error) {
            console.error(`[Optimistic] Update ${id} failed:`, error);

            if (update.retryCount < this.maxRetries) {
                update.retryCount++;
                // Exponential backoff
                const delay = Math.pow(2, update.retryCount) * 1000;
                setTimeout(() => this.processUpdate(id), delay);
            } else {
                // Max retries reached, rollback
                update.status = 'error';
                update.rollback();
                this.queue.delete(id);
            }
        }
    }

    /**
     * Get pending updates
     */
    getPending(): OptimisticUpdate<T>[] {
        return Array.from(this.queue.values()).filter(u => u.status === 'pending');
    }

    /**
     * Clear all updates
     */
    clear(): void {
        this.queue.clear();
    }

    /**
     * Rollback a specific update
     */
    rollback(id: string): void {
        const update = this.queue.get(id);
        if (update) {
            update.rollback();
            this.queue.delete(id);
        }
    }

    /**
     * Rollback all pending updates
     */
    rollbackAll(): void {
        this.queue.forEach(update => update.rollback());
        this.queue.clear();
    }
}
