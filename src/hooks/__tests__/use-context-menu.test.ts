import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useContextMenu } from '../use-context-menu';

import * as contextMenuStore from '@/store/use-context-menu-store';

vi.mock('@/store/use-context-menu-store');

describe('useContextMenu', () => {
  const mockOpenContextMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (contextMenuStore.useContextMenuStore as any).mockReturnValue({
      openContextMenu: mockOpenContextMenu,
    });
  });

  it('should initialize with correct type and data', () => {
    const type = 'page' as any;
    const data = { id: '123' };

    renderHook(() => useContextMenu({ type, data }));

    expect(mockOpenContextMenu).not.toHaveBeenCalled();
  });

  it('should handle context menu event', () => {
    const type = 'page' as any;
    const { result } = renderHook(() => useContextMenu({ type }));

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 200,
    } as any;

    act(() => {
      result.current.onContextMenu(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockOpenContextMenu).toHaveBeenCalledWith(
      { x: 100, y: 200 },
      type,
      {}
    );
  });

  it('should handle touch events with long press', () => {
    vi.useFakeTimers();
    const type = 'page' as any;
    const { result } = renderHook(() => useContextMenu({ type }));

    const touch = { clientX: 150, clientY: 250 } as any;
    const touchEvent = {
      touches: [touch],
    } as any;

    act(() => {
      result.current.onTouchStart(touchEvent);
    });

    expect(mockOpenContextMenu).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOpenContextMenu).toHaveBeenCalledWith(
      { x: 150, y: 250 },
      type,
      {}
    );

    vi.useRealTimers();
  });

  it('should clear timer on touch end', () => {
    vi.useFakeTimers();
    const type = 'page' as any;
    const { result } = renderHook(() => useContextMenu({ type }));

    const touch = { clientX: 150, clientY: 250 } as any;
    const touchStartEvent = {
      touches: [touch],
    } as any;

    const touchEndEvent = {
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
      result.current.onTouchEnd(touchEndEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOpenContextMenu).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should return context menu event handlers', () => {
    const type = 'page' as any;
    const { result } = renderHook(() => useContextMenu({ type }));

    expect(result.current.onContextMenu).toBeDefined();
    expect(result.current.onTouchStart).toBeDefined();
    expect(result.current.onTouchEnd).toBeDefined();
    // expect(result.current.cleanup).toBeDefined();
  });
});
