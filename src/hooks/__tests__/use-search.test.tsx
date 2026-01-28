import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useSearch } from '../use-search';

describe('useSearch', () => {
  beforeEach(() => {
    useSearch.setState({ isOpen: false });
  });
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.isOpen).toBe(false);
  });

  it('should open search', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close search', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle search state', () => {
    const { result } = renderHook(() => useSearch());

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
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.onOpen();
      result.current.onOpen();
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should handle multiple close calls', () => {
    const { result } = renderHook(() => useSearch());

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
    const { result: result1 } = renderHook(() => useSearch());
    const { result: result2 } = renderHook(() => useSearch());

    act(() => {
      result1.current.onOpen();
    });

    expect(result2.current.isOpen).toBe(true);
  });

  it('should handle rapid toggle operations', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should maintain state across multiple operations', () => {
    const { result } = renderHook(() => useSearch());

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
    const { result } = renderHook(() => useSearch());

    expect(typeof result.current.onOpen).toBe('function');
    expect(typeof result.current.onClose).toBe('function');
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.isOpen).toBe('boolean');
  });

  it('should work correctly after unmount and remount', () => {
    const { result, unmount } = renderHook(() => useSearch());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);

    unmount();

    const { result: result2 } = renderHook(() => useSearch());

    expect(result2.current.isOpen).toBe(true);
  });
});
