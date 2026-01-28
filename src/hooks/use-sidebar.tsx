import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  isCollapsed: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: true,
  isCollapsed: false,
  onOpen: () => {
    set({ isOpen: true, isCollapsed: false });
  },
  onClose: () => {
    set({ isOpen: false, isCollapsed: true });
  },
  toggle: () => {
    set((state) => ({ isCollapsed: !state.isCollapsed }));
  },
  collapse: () => {
    set({ isCollapsed: true });
  },
  expand: () => {
    set({ isCollapsed: false });
  },
}));
