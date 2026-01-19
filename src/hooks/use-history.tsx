import { create } from "zustand"

interface HistoryStore {
    isOpen: boolean
    documentId: string | null
    onOpen: (documentId: string) => void
    onClose: () => void
}

export const useHistory = create<HistoryStore>((set) => ({
    isOpen: false,
    documentId: null,
    onOpen: (documentId) => set({ isOpen: true, documentId }),
    onClose: () => set({ isOpen: false, documentId: null })
}))
