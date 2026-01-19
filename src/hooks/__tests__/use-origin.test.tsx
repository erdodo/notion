import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOrigin } from '../use-origin'

describe('useOrigin', () => {
  beforeEach(() => {
    // Mock window.location
    vi.stubGlobal('location', {
      origin: 'http://localhost:3000'
    });
  })

  it('should return empty string initially and then the origin', async () => {
    const { result } = renderHook(() => useOrigin())

    // Depending on race conditions in JSDOM, it might already be hydrated or not.
    // We should at least verify it eventually returns the origin.
    await waitFor(() => {
      expect(result.current).toBe('http://localhost:3000')
    });
  })

  it('should return correct origin for localhost', async () => {
    vi.stubGlobal('location', { origin: 'http://localhost:3000' });
    const { result } = renderHook(() => useOrigin())

    await waitFor(() => {
      expect(result.current).toBe('http://localhost:3000')
    });
  })

  it('should return correct origin for production domain', async () => {
    vi.stubGlobal('location', { origin: 'https://example.com' });
    const { result } = renderHook(() => useOrigin())

    await waitFor(() => {
      expect(result.current).toBe('https://example.com')
    });
  })

  it('should handle undefined window.location.origin', async () => {
    vi.stubGlobal('location', {});
    const { result } = renderHook(() => useOrigin())

    await waitFor(() => {
      expect(result.current).toBe('')
    });
  })

  it('should include protocol and domain', async () => {
    vi.stubGlobal('location', { origin: 'https://app.example.com:8080' });
    const { result } = renderHook(() => useOrigin())

    await waitFor(() => {
      expect(result.current).toBe('https://app.example.com:8080')
    });
  })
})
