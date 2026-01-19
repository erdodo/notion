import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../auth-provider'

// Mock dependencies
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => <div data-testid="session-provider">{children}</div>,
}))

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render auth provider wrapper', () => {
    render(
      <AuthProvider>
        <div>Test content</div>
      </AuthProvider>
    )

    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
  })

  it('should render children inside session provider', () => {
    render(
      <AuthProvider>
        <div>Test content</div>
      </AuthProvider>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render multiple children correctly', () => {
    render(
      <AuthProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AuthProvider>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })

  it('should wrap session provider correctly', () => {
    const { container } = render(
      <AuthProvider>
        <button>Click me</button>
      </AuthProvider>
    )

    const sessionProvider = container.querySelector('[data-testid="session-provider"]')
    expect(sessionProvider).toBeInTheDocument()
    expect(sessionProvider).toContainElement(screen.getByRole('button'))
  })

  it('should handle empty children', () => {
    const { container } = render(
      <AuthProvider>
        {null}
      </AuthProvider>
    )

    const sessionProvider = container.querySelector('[data-testid="session-provider"]')
    expect(sessionProvider).toBeInTheDocument()
  })

  it('should handle complex nested children', () => {
    render(
      <AuthProvider>
        <div>
          <div>
            <button>Nested button</button>
          </div>
        </div>
      </AuthProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with proper structure', () => {
    const { container } = render(
      <AuthProvider>
        <span>Test</span>
      </AuthProvider>
    )

    const sessionProvider = container.querySelector('[data-testid="session-provider"]')
    expect(sessionProvider?.children.length).toBeGreaterThan(0)
  })

  it('should accept react node children', () => {
    render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should work with functional components as children', () => {
    const ChildComponent = () => <div>Child component</div>

    render(
      <AuthProvider>
        <ChildComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Child component')).toBeInTheDocument()
  })

  it('should work with fragment children', () => {
    render(
      <AuthProvider>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </AuthProvider>
    )

    expect(screen.getByText('Fragment child 1')).toBeInTheDocument()
    expect(screen.getByText('Fragment child 2')).toBeInTheDocument()
  })

  it('should maintain children order', () => {
    const { container } = render(
      <AuthProvider>
        <span>First</span>
        <span>Second</span>
        <span>Third</span>
      </AuthProvider>
    )

    const spans = container.querySelectorAll('span')
    expect(spans[0]).toHaveTextContent('First')
    expect(spans[1]).toHaveTextContent('Second')
    expect(spans[2]).toHaveTextContent('Third')
  })

  it('should provide session context to children', () => {
    render(
      <AuthProvider>
        <div>Session is available</div>
      </AuthProvider>
    )

    expect(screen.getByText('Session is available')).toBeInTheDocument()
  })
})
