import { create } from "zustand";

interface TemplateModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useTemplateModal = create<TemplateModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
