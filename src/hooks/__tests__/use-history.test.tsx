import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useHistory } from '../use-history';

describe('useHistory', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useHistory());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.documentId).toBeNull();
  });

  it('should open history with documentId', () => {
    const { result } = renderHook(() => useHistory());
    const documentId = 'doc-123';

    act(() => {
      result.current.onOpen(documentId);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.documentId).toBe(documentId);
  });

  it('should close history', () => {
    const { result } = renderHook(() => useHistory());
    const documentId = 'doc-123';

    act(() => {
      result.current.onOpen(documentId);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.documentId).toBeNull();
  });

  it('should switch between documents', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.onOpen('doc-1');
    });

    expect(result.current.documentId).toBe('doc-1');

    act(() => {
      result.current.onOpen('doc-2');
    });

    expect(result.current.documentId).toBe('doc-2');
    expect(result.current.isOpen).toBe(true);
  });

  it('should be shared across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useHistory());
    const { result: result2 } = renderHook(() => useHistory());

    act(() => {
      result1.current.onOpen('doc-123');
    });

    expect(result2.current.isOpen).toBe(true);
    expect(result2.current.documentId).toBe('doc-123');
  });

  it('should handle rapid open/close operations', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.onOpen('doc-1');
      result.current.onClose();
      result.current.onOpen('doc-2');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.documentId).toBe('doc-2');
  });
});
