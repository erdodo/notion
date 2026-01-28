import { StateCreator, StoreMutatorIdentifier } from 'zustand';

export interface PersistOptions<T> {
  name: string;
  storage?: Storage;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: (state: T) => void;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T;
}

type Persist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs>,
  options: PersistOptions<T>
) => StateCreator<T, Mps, Mcs>;

export const persist: Persist = (config, options) => (set, get, api) => {
  const {
    name,
    storage = globalThis.window === undefined
      ? undefined
      : globalThis.localStorage,
    partialize = (state) => state,
    onRehydrateStorage,
    version = 0,
    migrate,
  } = options;

  let hasHydrated = false;

  const hydrate = () => {
    if (!storage || hasHydrated) return;

    try {
      const stored = storage.getItem(name);
      if (stored) {
        const parsed = JSON.parse(stored);

        let state = parsed.state;
        if (migrate && parsed.version !== version) {
          state = migrate(state, parsed.version);
        }

        set(state, true);

        if (onRehydrateStorage) {
          onRehydrateStorage(get());
        }
      }
      hasHydrated = true;
    } catch (error) {
      console.error(`[Persist] Failed to hydrate ${name}:`, error);
    }
  };

  const persist = () => {
    if (!storage) return;

    try {
      const state = partialize(get());
      const serialized = JSON.stringify({
        state,
        version,
      });
      storage.setItem(name, serialized);
    } catch (error) {
      console.error(`[Persist] Failed to persist ${name}:`, error);
    }
  };

  if (globalThis.window !== undefined) {
    hydrate();
  }

  const persistedSet: any = (...arguments_: any[]) => {
    set(...(arguments_ as [any]));
    persist();
  };

  return config(persistedSet as any, get, api);
};

export function clearPersistedState(
  name: string,
  storage: Storage = localStorage
) {
  try {
    storage.removeItem(name);
  } catch (error) {
    console.error(`[Persist] Failed to clear ${name}:`, error);
  }
}
