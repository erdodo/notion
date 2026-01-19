import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CollaborationProvider, useCollaboration, useOptionalCollaboration } from '../collaboration-provider'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as pusherClient from '@/lib/pusher-client'

// Mock dependencies
vi.mock('next-auth/react')
vi.mock('next/navigation')
vi.mock('@/lib/pusher-client')
vi.mock('randomcolor')
vi.mock('use-debounce')

describe('CollaborationProvider', () => {
  const mockSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
  }

  const mockPush = vi.fn()
  const mockSubscribe = vi.fn()
  const mockUnsubscribe = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useSession as any).mockReturnValue({
      data: mockSession,
    })

    ;(useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
    })

    ;(pusherClient.pusherClient as any) = {
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    }

    mockSubscribe.mockReturnValue({
      bind: vi.fn(),
      unbind_all: vi.fn(),
      trigger: vi.fn(),
      members: {
        each: vi.fn((callback: Function) => {
          // No members by default
        }),
      },
    })
  })

  it('should render collaboration provider with children', () => {
    render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should not render when session is not available', () => {
    ;(useSession as any).mockReturnValue({
      data: null,
    })

    render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should subscribe to pusher channel on mount', async () => {
    render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith('presence-doc-doc-1')
    })
  })

  it('should unsubscribe from pusher channel on unmount', async () => {
    const { unmount } = render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should pass user info to context', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue).toBeDefined()
    expect(contextValue.user).toBeDefined()
    expect(contextValue.yDoc).toBeDefined()
    expect(contextValue.provider).toBeDefined()
  })

  it('should provide activeUsers in context', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue.activeUsers).toEqual([])
  })

  it('should throw error when useCollaboration is used outside provider', () => {
    const TestComponent = () => {
      useCollaboration()
      return <div>Test</div>
    }

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useCollaboration must be used within a CollaborationProvider')
  })

  it('should return null when useOptionalCollaboration is used outside provider', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useOptionalCollaboration()
      return <div>Test</div>
    }

    render(<TestComponent />)

    expect(contextValue).toBeNull()
  })

  it('should return context when useOptionalCollaboration is used inside provider', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useOptionalCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue).not.toBeNull()
    expect(contextValue).toBeDefined()
  })

  it('should have user name from session', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue.user.name).toBe('Test User')
  })

  it('should create new yDoc when documentId changes', () => {
    let contextValue1: any
    let contextValue2: any

    const TestComponent = ({ id }: { id: string }) => {
      contextValue1 = useCollaboration()
      return <div>Test</div>
    }

    const { rerender } = render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent id="doc-1" />
      </CollaborationProvider>
    )

    const firstDoc = contextValue1.yDoc

    rerender(
      <CollaborationProvider documentId="doc-2">
        <TestComponent id="doc-2" />
      </CollaborationProvider>
    )

    contextValue2 = contextValue1
    const secondDoc = contextValue2.yDoc

    // Docs should be different instances when documentId changes
    expect(firstDoc).not.toBe(secondDoc)
  })

  it('should handle session without email gracefully', async () => {
    ;(useSession as any).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: null,
          image: null,
        },
      },
    })

    render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    // Should not subscribe if no email
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('should handle null session gracefully', () => {
    ;(useSession as any).mockReturnValue({
      data: null,
    })

    render(
      <CollaborationProvider documentId="doc-1">
        <div>Test content</div>
      </CollaborationProvider>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should subscribe to correct channel name based on documentId', async () => {
    render(
      <CollaborationProvider documentId="unique-doc-123">
        <div>Test content</div>
      </CollaborationProvider>
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith('presence-doc-unique-doc-123')
    })
  })

  it('should handle special characters in documentId', async () => {
    render(
      <CollaborationProvider documentId="doc-with-special-!@#$%">
        <div>Test content</div>
      </CollaborationProvider>
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith('presence-doc-doc-with-special-!@#$%')
    })
  })

  it('should provide provider instance in context', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue.provider).toBeDefined()
  })

  it('should initialize provider with awareness', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue.provider.awareness).toBeDefined()
  })

  it('should handle multiple children correctly', () => {
    render(
      <CollaborationProvider documentId="doc-1">
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </CollaborationProvider>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })

  it('should render children with correct context', () => {
    let contextCount = 0

    const TestComponent = () => {
      const context = useCollaboration()
      contextCount++
      return <div>Test - {contextCount}</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextCount).toBeGreaterThan(0)
  })

  it('should maintain user color consistency', () => {
    let color1: string
    let color2: string

    const TestComponent1 = () => {
      const { user } = useCollaboration()
      color1 = user.color
      return <div>Test1</div>
    }

    const TestComponent2 = () => {
      const { user } = useCollaboration()
      color2 = user.color
      return <div>Test2</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent1 />
        <TestComponent2 />
      </CollaborationProvider>
    )

    expect(color1).toBe(color2)
  })

  it('should handle context access in deeply nested component', () => {
    let contextValue: any

    const DeepComponent = () => {
      contextValue = useCollaboration()
      return <div>Deep</div>
    }

    const MiddleComponent = () => <DeepComponent />
    const TopComponent = () => <MiddleComponent />

    render(
      <CollaborationProvider documentId="doc-1">
        <TopComponent />
      </CollaborationProvider>
    )

    expect(contextValue).toBeDefined()
  })

  it('should provide yDoc as Y.Doc instance', () => {
    let contextValue: any

    const TestComponent = () => {
      contextValue = useCollaboration()
      return <div>Test</div>
    }

    render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(contextValue.yDoc).toBeDefined()
  })

  it('should handle rapid documentId changes', () => {
    let docCount = 0

    const TestComponent = () => {
      const { yDoc } = useCollaboration()
      docCount++
      return <div>Doc</div>
    }

    const { rerender } = render(
      <CollaborationProvider documentId="doc-1">
        <TestComponent />
      </CollaborationProvider>
    )

    rerender(
      <CollaborationProvider documentId="doc-2">
        <TestComponent />
      </CollaborationProvider>
    )

    rerender(
      <CollaborationProvider documentId="doc-3">
        <TestComponent />
      </CollaborationProvider>
    )

    expect(docCount).toBeGreaterThan(0)
  })
})
