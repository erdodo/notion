import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useSidebar } from '../use-sidebar';

describe('useSidebar', () => {
  it('should initialize with open and expanded state', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('should open sidebar', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('should close sidebar', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCollapsed).toBe(true);
  });

  it('should collapse sidebar', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.collapse();
    });

    expect(result.current.isCollapsed).toBe(true);
  });

  it('should expand sidebar', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.collapse();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.expand();
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should toggle collapse state', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isCollapsed).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should sync isOpen and isCollapsed on open', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('should sync isOpen and isCollapsed on close', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCollapsed).toBe(true);
  });

  it('should be shared across hook instances', () => {
    const { result: result1 } = renderHook(() => useSidebar());
    const { result: result2 } = renderHook(() => useSidebar());

    act(() => {
      result1.current.onClose();
    });

    expect(result2.current.isOpen).toBe(false);
    expect(result2.current.isCollapsed).toBe(true);
  });

  it('should handle rapid operations', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.collapse();
      result.current.expand();
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(true);
  });

  it('should allow independent collapse/expand', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.collapse();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.expand();
    });

    expect(result.current.isCollapsed).toBe(false);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useSidebar());

    expect(typeof result.current.onOpen).toBe('function');
    expect(typeof result.current.onClose).toBe('function');
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.collapse).toBe('function');
    expect(typeof result.current.expand).toBe('function');
  });

  it('should handle multiple collapse/expand cycles', () => {
    const { result } = renderHook(() => useSidebar());

    for (let index = 0; index < 5; index++) {
      act(() => {
        result.current.collapse();
      });
      expect(result.current.isCollapsed).toBe(true);

      act(() => {
        result.current.expand();
      });
      expect(result.current.isCollapsed).toBe(false);
    }
  });

  it('should maintain state consistency', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.collapse();
    });

    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(false);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCollapsed).toBe(true);
  });
});
