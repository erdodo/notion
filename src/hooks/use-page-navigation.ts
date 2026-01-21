import { useRouter } from "next/navigation"
import { usePreview } from "./use-preview"
import { useDatabase } from "./use-database"

export function usePageNavigation() {
    const router = useRouter()
    const { onOpen } = usePreview()
    const { pageOpenMode } = useDatabase()

    const navigateToPage = (pageId: string) => {
        console.log('Navigating to page:', pageId, 'with mode:', pageOpenMode)

        switch (pageOpenMode) {
            case 'current':
                router.push(`/documents/${pageId}`)
                break
            case 'new-tab':
                window.open(`/documents/${pageId}`, '_blank')
                break
            case 'dialog':
                onOpen(pageId, 'center')
                break
            case 'drawer':
                onOpen(pageId, 'side')
                break
        }
    }

    return { navigateToPage, pageOpenMode }
}
