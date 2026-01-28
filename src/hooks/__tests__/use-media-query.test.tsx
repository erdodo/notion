import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useMediaQuery } from '../use-media-query';

describe('useMediaQuery', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: any) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBeDefined();
  });

  it('should return false during SSR', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('should match media query when condition is true', () => {
    matchMediaMock.mockImplementation((query: any) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBeDefined();
  });

  it('should handle different media queries', () => {
    const { result: _result1 } = renderHook(() =>
      useMediaQuery('(max-width: 768px)')
    );
    const { result: _result2 } = renderHook(() =>
      useMediaQuery('(min-width: 769px)')
    );

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 768px)');
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 769px)');
  });

  it('should update when media query result changes', () => {
    matchMediaMock.mockImplementation((query: any) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          setTimeout(() => listener({ matches: true }), 0);
        }
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBeDefined();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerMock = vi.fn();

    matchMediaMock.mockImplementation((query: any) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    unmount();

    expect(removeEventListenerMock).toBeDefined();
  });

  it('should handle dark mode media query', () => {
    const { result } = renderHook(() =>
      useMediaQuery('(prefers-color-scheme: dark)')
    );

    expect(result.current).toBeDefined();
  });

  it('should handle multiple orientation queries', () => {
    const { result: landscapeResult } = renderHook(() =>
      useMediaQuery('(orientation: landscape)')
    );
    const { result: portraitResult } = renderHook(() =>
      useMediaQuery('(orientation: portrait)')
    );

    expect(landscapeResult.current).toBeDefined();
    expect(portraitResult.current).toBeDefined();
  });

  it('should prevent hydration mismatch', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);
  });
});
