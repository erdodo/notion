import { create } from 'zustand';

type PreviewMode = 'side' | 'center';

interface PreviewStore {
  isOpen: boolean;
  documentId?: string;
  mode?: PreviewMode;
  onOpen: (documentId: string, mode?: PreviewMode) => void;
  onClose: () => void;
}

export const usePreview = create<PreviewStore>((set) => ({
  isOpen: false,
  documentId: undefined,
  mode: 'side',
  onOpen: (documentId, mode = 'side') => {
    set({ isOpen: true, documentId, mode });
  },
  onClose: () => {
    set({ isOpen: false, documentId: undefined });
  },
}));
