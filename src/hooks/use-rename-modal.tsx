import { create } from 'zustand';

interface RenameModalStore {
  isOpen: boolean;
  documentId: string;
  initialTitle: string;
  onOpen: (documentId: string, initialTitle: string) => void;
  onClose: () => void;
}

export const useRenameModal = create<RenameModalStore>((set) => ({
  isOpen: false,
  documentId: '',
  initialTitle: '',
  onOpen: (documentId, initialTitle) => {
    set({ isOpen: true, documentId, initialTitle });
  },
  onClose: () => {
    set({ isOpen: false, documentId: '', initialTitle: '' });
  },
}));
