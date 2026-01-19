import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRenameModal } from '../use-rename-modal'

describe('useRenameModal', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useRenameModal())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.documentId).toBe('')
    expect(result.current.initialTitle).toBe('')
  })

  it('should open rename modal with document id and title', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-123', 'Old Title')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.documentId).toBe('doc-123')
    expect(result.current.initialTitle).toBe('Old Title')
  })

  it('should close rename modal', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-123', 'Old Title')
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.onClose()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.documentId).toBe('')
    expect(result.current.initialTitle).toBe('')
  })

  it('should reset state on close', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-123', 'My Document')
    })

    expect(result.current.documentId).toBe('doc-123')
    expect(result.current.initialTitle).toBe('My Document')

    act(() => {
      result.current.onClose()
    })

    expect(result.current.documentId).toBe('')
    expect(result.current.initialTitle).toBe('')
  })

  it('should handle empty initial title', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-123', '')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.initialTitle).toBe('')
  })

  it('should handle long titles', () => {
    const { result } = renderHook(() => useRenameModal())

    const longTitle = 'A'.repeat(500)

    act(() => {
      result.current.onOpen('doc-123', longTitle)
    })

    expect(result.current.initialTitle).toBe(longTitle)
  })

  it('should switch between different documents', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-1', 'Document 1')
    })

    expect(result.current.documentId).toBe('doc-1')

    act(() => {
      result.current.onOpen('doc-2', 'Document 2')
    })

    expect(result.current.documentId).toBe('doc-2')
    expect(result.current.initialTitle).toBe('Document 2')
    expect(result.current.isOpen).toBe(true)
  })

  it('should be shared across hook instances', () => {
    const { result: result1 } = renderHook(() => useRenameModal())
    const { result: result2 } = renderHook(() => useRenameModal())

    act(() => {
      result1.current.onOpen('doc-123', 'Shared Title')
    })

    expect(result2.current.isOpen).toBe(true)
    expect(result2.current.documentId).toBe('doc-123')
    expect(result2.current.initialTitle).toBe('Shared Title')
  })

  it('should handle rapid open/close operations', () => {
    const { result } = renderHook(() => useRenameModal())

    act(() => {
      result.current.onOpen('doc-1', 'Title 1')
      result.current.onClose()
      result.current.onOpen('doc-2', 'Title 2')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.documentId).toBe('doc-2')
    expect(result.current.initialTitle).toBe('Title 2')
  })

  it('should handle special characters in title', () => {
    const { result } = renderHook(() => useRenameModal())

    const specialTitle = 'Title with & < > " \' characters'

    act(() => {
      result.current.onOpen('doc-123', specialTitle)
    })

    expect(result.current.initialTitle).toBe(specialTitle)
  })

  it('should handle unicode characters in title', () => {
    const { result } = renderHook(() => useRenameModal())

    const unicodeTitle = 'Başlık 中文 العربية'

    act(() => {
      result.current.onOpen('doc-123', unicodeTitle)
    })

    expect(result.current.initialTitle).toBe(unicodeTitle)
  })
})
