import { create } from "zustand"

export type PreviewMode = "modal" | "drawer"

interface PreviewStore {
    isOpen: boolean
    documentId: string | null
    mode: PreviewMode
    onOpen: (documentId: string, mode?: PreviewMode) => void
    onClose: () => void
}

export const usePreview = create<PreviewStore>((set) => ({
    isOpen: false,
    documentId: null,
    mode: "drawer",
    onOpen: (documentId, mode = "drawer") => set({ isOpen: true, documentId, mode }),
    onClose: () => set({ isOpen: false, documentId: null })
}))
