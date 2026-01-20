/**
 * Store Persistence Middleware
 * 
 * Automatically persists Zustand store state to localStorage/IndexedDB
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

export interface PersistOptions<T> {
    name: string;
    storage?: Storage;
    partialize?: (state: T) => Partial<T>;
    onRehydrateStorage?: (state: T) => void;
    version?: number;
    migrate?: (persistedState: any, version: number) => T;
}

type Persist = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
    config: StateCreator<T, Mps, Mcs>,
    options: PersistOptions<T>
) => StateCreator<T, Mps, Mcs>;

/**
 * Create a persistence middleware for Zustand stores
 */
export const persist: Persist = (config, options) => (set, get, api) => {
    const {
        name,
        storage = typeof window !== 'undefined' ? window.localStorage : undefined,
        partialize = (state) => state,
        onRehydrateStorage,
        version = 0,
        migrate,
    } = options;

    let hasHydrated = false;

    // Hydrate state from storage
    const hydrate = () => {
        if (!storage || hasHydrated) return;

        try {
            const stored = storage.getItem(name);
            if (stored) {
                const parsed = JSON.parse(stored);

                // Handle version migration
                let state = parsed.state;
                if (migrate && parsed.version !== version) {
                    state = migrate(state, parsed.version);
                }

                // Merge with initial state
                set(state as any, true);

                if (onRehydrateStorage) {
                    onRehydrateStorage(get() as any);
                }
            }
            hasHydrated = true;
        } catch (error) {
            console.error(`[Persist] Failed to hydrate ${name}:`, error);
        }
    };

    // Persist state to storage
    const persist = () => {
        if (!storage) return;

        try {
            const state = partialize(get() as any);
            const serialized = JSON.stringify({
                state,
                version,
            });
            storage.setItem(name, serialized);
        } catch (error) {
            console.error(`[Persist] Failed to persist ${name}:`, error);
        }
    };

    // Hydrate on initialization
    if (typeof window !== 'undefined') {
        hydrate();
    }

    // Wrap set to persist on every state change
    // @ts-ignore - Zustand middleware typing complexity
    const persistedSet = (...args) => {
        // @ts-ignore
        set(...args);
        persist();
    };

    // @ts-ignore - Zustand middleware typing complexity
    return config(persistedSet, get, api);
};

/**
 * Clear persisted state for a store
 */
export function clearPersistedState(name: string, storage: Storage = localStorage) {
    try {
        storage.removeItem(name);
    } catch (error) {
        console.error(`[Persist] Failed to clear ${name}:`, error);
    }
}
