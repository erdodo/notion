import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useSettings } from '../use-settings';

describe('useSettings', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useSettings.setState({ isOpen: false });
  });

  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.isOpen).toBe(false);
  });

  it('should open settings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close settings', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle settings state', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle multiple open calls', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
      result.current.onOpen();
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should handle multiple close calls', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
    });

    act(() => {
      result.current.onClose();
      result.current.onClose();
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should be shared across hook instances', () => {
    const { result: result1 } = renderHook(() => useSettings());
    const { result: result2 } = renderHook(() => useSettings());

    act(() => {
      result1.current.onOpen();
    });

    expect(result2.current.isOpen).toBe(true);
  });

  it('should handle rapid toggle operations', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle odd number of toggles', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should maintain state across multiple operations', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useSettings());

    expect(typeof result.current.onOpen).toBe('function');
    expect(typeof result.current.onClose).toBe('function');
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.isOpen).toBe('boolean');
  });

  it('should persist state through component unmount/remount', () => {
    const { result, unmount } = renderHook(() => useSettings());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    unmount();

    const { result: result2 } = renderHook(() => useSettings());

    expect(result2.current.isOpen).toBe(true);
  });

  it('should handle interleaved operations from multiple instances', () => {
    const { result: result1 } = renderHook(() => useSettings());
    const { result: result2 } = renderHook(() => useSettings());

    act(() => {
      result1.current.onOpen();
    });

    expect(result2.current.isOpen).toBe(true);

    act(() => {
      result2.current.toggle();
    });

    expect(result1.current.isOpen).toBe(false);
  });
});
