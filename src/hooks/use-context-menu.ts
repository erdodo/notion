import { useCallback, useRef, useEffect } from "react"
import { ContextMenuType, useContextMenuStore } from "@/store/use-context-menu-store"

interface UseContextMenuProps {
    type: ContextMenuType
    data?: Record<string, any>
}

export const useContextMenu = ({ type, data = {} }: UseContextMenuProps) => {
    const { openContextMenu } = useContextMenuStore()
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const isLongPress = useRef(false)

    // Clear timer helper
    const clearTimer = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }, [])

    const onContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            openContextMenu({ x: e.clientX, y: e.clientY }, type, data)
        },
        [openContextMenu, type, data]
    )

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        clearTimer()
        isLongPress.current = false

        const touch = e.touches[0]
        const { clientX, clientY } = touch

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true
            openContextMenu({ x: clientX, y: clientY }, type, data)
        }, 500) // 500ms for long press
    }, [openContextMenu, type, data, clearTimer])

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        clearTimer()
        // If it was a long press, prevent default click behavior if necessary
        if (isLongPress.current) {
            e.preventDefault()
        }
    }, [clearTimer])

    const onTouchMove = useCallback(() => {
        // If moved, cancel long press
        clearTimer()
    }, [clearTimer])

    return {
        onContextMenu,
        onTouchStart,
        onTouchEnd,
        onTouchMove
    }
}
