import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useMovePage } from '../use-move-page';

describe('useMovePage', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMovePage());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.pageId).toBeNull();
    expect(result.current.currentParentId).toBeNull();
  });

  it('should open move page dialog with pageId and parentId', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-123', 'parent-456');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.pageId).toBe('page-123');
    expect(result.current.currentParentId).toBe('parent-456');
  });

  it('should handle null parent id', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-123', null);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.pageId).toBe('page-123');
    expect(result.current.currentParentId).toBeNull();
  });

  it('should close move page dialog', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-123', 'parent-456');
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.pageId).toBeNull();
    expect(result.current.currentParentId).toBeNull();
  });

  it('should reset state on close', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-123', 'parent-456');
    });

    expect(result.current.pageId).toBe('page-123');
    expect(result.current.currentParentId).toBe('parent-456');

    act(() => {
      result.current.onClose();
    });

    expect(result.current.pageId).toBeNull();
    expect(result.current.currentParentId).toBeNull();
  });

  it('should switch between different pages', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-1', 'parent-1');
    });

    expect(result.current.pageId).toBe('page-1');

    act(() => {
      result.current.onOpen('page-2', 'parent-2');
    });

    expect(result.current.pageId).toBe('page-2');
    expect(result.current.currentParentId).toBe('parent-2');
    expect(result.current.isOpen).toBe(true);
  });

  it('should be shared across hook instances', () => {
    const { result: result1 } = renderHook(() => useMovePage());
    const { result: result2 } = renderHook(() => useMovePage());

    act(() => {
      result1.current.onOpen('page-123', 'parent-456');
    });

    expect(result2.current.isOpen).toBe(true);
    expect(result2.current.pageId).toBe('page-123');
    expect(result2.current.currentParentId).toBe('parent-456');
  });

  it('should handle rapid open/close operations', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-1', 'parent-1');
      result.current.onClose();
      result.current.onOpen('page-2', 'parent-2');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.pageId).toBe('page-2');
    expect(result.current.currentParentId).toBe('parent-2');
  });

  it('should handle moving to different hierarchies', () => {
    const { result } = renderHook(() => useMovePage());

    act(() => {
      result.current.onOpen('page-123', 'parent-root');
    });

    expect(result.current.pageId).toBe('page-123');
    expect(result.current.currentParentId).toBe('parent-root');

    act(() => {
      result.current.onOpen('page-123', 'parent-nested');
    });

    expect(result.current.currentParentId).toBe('parent-nested');
  });
});
