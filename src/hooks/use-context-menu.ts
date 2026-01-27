import { useCallback, useRef } from 'react';

import {
  ContextMenuType,
  useContextMenuStore,
} from '@/store/use-context-menu-store';

interface UseContextMenuProperties {
  type: ContextMenuType;
  data?: Record<string, unknown>;
}

export const useContextMenu = ({
  type,
  data = {},
}: UseContextMenuProperties) => {
  const { openContextMenu } = useContextMenuStore();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu({ x: e.clientX, y: e.clientY }, type, data);
    },
    [openContextMenu, type, data]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      clearTimer();
      isLongPress.current = false;

      const touch = e.touches[0];
      const { clientX, clientY } = touch;

      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        openContextMenu({ x: clientX, y: clientY }, type, data);
      }, 500);
    },
    [openContextMenu, type, data, clearTimer]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearTimer();

      if (isLongPress.current) {
        e.preventDefault();
      }
    },
    [clearTimer]
  );

  const onTouchMove = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return {
    onContextMenu,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
  };
};
