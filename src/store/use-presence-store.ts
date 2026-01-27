import { create } from 'zustand';

export interface UserPresence {
  userId: string;
  userName: string;
  userImage?: string;
  pageId: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  cursorPosition?: {
    blockId: string;
    offset: number;
  };
  lastSeen: Date | string;
}

interface PresenceStore {
  presenceByPage: Map<string, Map<string, UserPresence>>;

  getPagePresence: (pageId: string) => UserPresence[];
  getActiveUsersCount: (pageId: string) => number;
  getUserPresence: (pageId: string, userId: string) => UserPresence | undefined;

  joinPage: (pageId: string, user: UserPresence) => void;
  leavePage: (pageId: string, userId: string) => void;
  updatePresence: (
    pageId: string,
    userId: string,
    updates: Partial<UserPresence>
  ) => void;
  updateCursor: (
    pageId: string,
    userId: string,
    cursorPosition?: { blockId: string; offset: number }
  ) => void;
  clearPagePresence: (pageId: string) => void;
  clearAllPresence: () => void;

  generateUserColor: (userId: string) => string;
}

const generateColorFromId = (id: string): string => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52B788',
  ];

  let hash = 0;
  for (let index = 0; index < id.length; index++) {
    hash = id.charCodeAt(index) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const usePresenceStore = create<PresenceStore>((set, get) => ({
  presenceByPage: new Map(),

  getPagePresence: (pageId) => {
    const pageMap = get().presenceByPage.get(pageId);
    if (!pageMap) return [];
    return [...pageMap.values()].filter((p) => p.status === 'online');
  },

  getActiveUsersCount: (pageId) => {
    return get().getPagePresence(pageId).length;
  },

  getUserPresence: (pageId, userId) => {
    const pageMap = get().presenceByPage.get(pageId);
    return pageMap?.get(userId);
  },

  joinPage: (pageId, user) => {
    set((state) => {
      const newMap = new Map(state.presenceByPage);
      let pageMap = newMap.get(pageId);

      if (!pageMap) {
        pageMap = new Map();
        newMap.set(pageId, pageMap);
      }

      pageMap.set(user.userId, {
        ...user,
        status: 'online',
        lastSeen: new Date().toISOString(),
      });

      return { presenceByPage: newMap };
    });
  },

  leavePage: (pageId, userId) => {
    set((state) => {
      const newMap = new Map(state.presenceByPage);
      const pageMap = newMap.get(pageId);

      if (pageMap) {
        pageMap.delete(userId);
        if (pageMap.size === 0) {
          newMap.delete(pageId);
        }
      }

      return { presenceByPage: newMap };
    });
  },

  updatePresence: (pageId, userId, updates) => {
    set((state) => {
      const newMap = new Map(state.presenceByPage);
      const pageMap = newMap.get(pageId);

      if (pageMap) {
        const current = pageMap.get(userId);
        if (current) {
          pageMap.set(userId, {
            ...current,
            ...updates,
            lastSeen: new Date().toISOString(),
          });
        }
      }

      return { presenceByPage: newMap };
    });
  },

  updateCursor: (pageId, userId, cursorPosition) => {
    set((state) => {
      const newMap = new Map(state.presenceByPage);
      const pageMap = newMap.get(pageId);

      if (pageMap) {
        const current = pageMap.get(userId);
        if (current) {
          pageMap.set(userId, {
            ...current,
            cursorPosition,
            lastSeen: new Date().toISOString(),
          });
        }
      }

      return { presenceByPage: newMap };
    });
  },

  clearPagePresence: (pageId) => {
    set((state) => {
      const newMap = new Map(state.presenceByPage);
      newMap.delete(pageId);
      return { presenceByPage: newMap };
    });
  },

  clearAllPresence: () => {
    set({ presenceByPage: new Map() });
  },

  generateUserColor: (userId) => {
    return generateColorFromId(userId);
  },
}));
