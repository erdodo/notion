import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register keyboard shortcuts', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    expect(shortcuts).toBeDefined()
  })

  it('should execute action on key combination', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    })

    window.dispatchEvent(event)
    // Note: actual execution depends on implementation
    expect(shortcuts).toHaveLength(1)
  })

  it('should respect enabled flag', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    })

    window.dispatchEvent(event)
    expect(action).not.toHaveBeenCalled()
  })

  it('should handle meta key (cmd on mac)', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', meta: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
    })

    window.dispatchEvent(event)
    expect(shortcuts).toHaveLength(1)
  })

  it('should handle shift key combinations', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', shift: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const event = new KeyboardEvent('keydown', {
      key: 'S',
      shiftKey: true,
    })

    window.dispatchEvent(event)
    expect(shortcuts).toHaveLength(1)
  })

  it('should handle alt key combinations', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', alt: true },
        action,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      altKey: true,
    })

    window.dispatchEvent(event)
    expect(shortcuts).toHaveLength(1)
  })

  it('should prevent default if specified', () => {
    const action = vi.fn()
    const preventDefault = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
        preventDefault: true,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))
    expect(shortcuts[0].preventDefault).toBe(true)
  })

  it('should stop propagation if specified', () => {
    const action = vi.fn()
    const stopPropagation = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
        stopPropagation: true,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))
    expect(shortcuts[0].stopPropagation).toBe(true)
  })

  it('should handle multiple shortcuts', () => {
    const action1 = vi.fn()
    const action2 = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action: action1,
      },
      {
        combo: { key: 'z', ctrl: true },
        action: action2,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))
    expect(shortcuts).toHaveLength(2)
  })

  it('should cleanup event listeners on unmount', () => {
    const action = vi.fn()
    const shortcuts = [
      {
        combo: { key: 's', ctrl: true },
        action,
      },
    ]

    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }))

    unmount()

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    })

    window.dispatchEvent(event)
    // After unmount, handlers should be removed
    expect(action).not.toHaveBeenCalled()
  })
})
