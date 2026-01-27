import { create } from 'zustand';

interface MovePageStore {
  isOpen: boolean;
  pageId: string | null;
  currentParentId: string | null;
  onOpen: (pageId: string, currentParentId: string | null) => void;
  onClose: () => void;
}

export const useMovePage = create<MovePageStore>((set) => ({
  isOpen: false,
  pageId: null,
  currentParentId: null,
  onOpen: (pageId, currentParentId) => {
    set({ isOpen: true, pageId, currentParentId });
  },
  onClose: () => {
    set({ isOpen: false, pageId: null, currentParentId: null });
  },
}));
