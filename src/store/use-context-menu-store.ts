import { create } from 'zustand';

export type ContextMenuType =
  | 'sidebar-page'
  | 'editor-block'
  | 'database-row'
  | 'cover-image'
  | 'icon'
  | 'trash-item'
  | 'generic'
  | 'interface-element'
  | 'database-cell';

interface ContextMenuStore {
  isOpen: boolean;
  position: { x: number; y: number };
  type: ContextMenuType | null;
  data: Record<string, unknown>;
  openContextMenu: (
    position: { x: number; y: number },
    type: ContextMenuType,
    data?: Record<string, unknown>
  ) => void;
  closeContextMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuStore>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  type: null,
  data: {},
  openContextMenu: (position, type, data = {}) => {
    set({ isOpen: true, position, type, data });
  },
  closeContextMenu: () => {
    set({ isOpen: false, type: null, data: {} });
  },
}));
