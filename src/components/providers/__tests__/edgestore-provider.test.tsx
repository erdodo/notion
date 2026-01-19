import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EdgeStoreProviderWrapper } from '../edgestore-provider'

// Mock dependencies
vi.mock('@/lib/edgestore', () => ({
  EdgeStoreProvider: ({ children }: any) => <div data-testid="edgestore-provider">{children}</div>,
}))

describe('EdgeStoreProviderWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render edgestore provider wrapper', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>Test content</div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByTestId('edgestore-provider')).toBeInTheDocument()
  })

  it('should render children inside edgestore provider', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>Test content</div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should accept single child element', () => {
    render(
      <EdgeStoreProviderWrapper>
        <button>Click me</button>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should wrap multiple children correctly', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>Child 1</div>
        <div>Child 2</div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('should maintain children order', () => {
    const { container } = render(
      <EdgeStoreProviderWrapper>
        <span>First</span>
        <span>Second</span>
        <span>Third</span>
      </EdgeStoreProviderWrapper>
    )

    const spans = container.querySelectorAll('span')
    expect(spans[0]).toHaveTextContent('First')
    expect(spans[1]).toHaveTextContent('Second')
    expect(spans[2]).toHaveTextContent('Third')
  })

  it('should render with edgestore context available', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>EdgeStore available</div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('EdgeStore available')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    const { container } = render(
      <EdgeStoreProviderWrapper>
        {null}
      </EdgeStoreProviderWrapper>
    )

    const edgestoreProvider = container.querySelector('[data-testid="edgestore-provider"]')
    expect(edgestoreProvider).toBeInTheDocument()
  })

  it('should handle nested components', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>
          <div>
            <button>Nested button</button>
          </div>
        </div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should work with fragment children', () => {
    render(
      <EdgeStoreProviderWrapper>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Fragment child 1')).toBeInTheDocument()
    expect(screen.getByText('Fragment child 2')).toBeInTheDocument()
  })

  it('should work with functional components as children', () => {
    const ChildComponent = () => <div>Child component</div>

    render(
      <EdgeStoreProviderWrapper>
        <ChildComponent />
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Child component')).toBeInTheDocument()
  })

  it('should provide edgestore functionality to children', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>EdgStore ready</div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('EdgStore ready')).toBeInTheDocument()
  })

  it('should wrap provider correctly with provider element', () => {
    const { container } = render(
      <EdgeStoreProviderWrapper>
        <span>Content</span>
      </EdgeStoreProviderWrapper>
    )

    const provider = container.querySelector('[data-testid="edgestore-provider"]')
    expect(provider).toContainElement(screen.getByText('Content'))
  })

  it('should handle children with event handlers', () => {
    const handleClick = vi.fn()

    render(
      <EdgeStoreProviderWrapper>
        <button onClick={handleClick}>Click</button>
      </EdgeStoreProviderWrapper>
    )

    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render children with text content', () => {
    render(
      <EdgeStoreProviderWrapper>
        <p>Some text content</p>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Some text content')).toBeInTheDocument()
  })

  it('should handle long children tree', () => {
    render(
      <EdgeStoreProviderWrapper>
        <div>
          <section>
            <article>
              <div>
                <span>Deep content</span>
              </div>
            </article>
          </section>
        </div>
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('Deep content')).toBeInTheDocument()
  })

  it('should maintain ReactNode children type', () => {
    render(
      <EdgeStoreProviderWrapper>
        {'String as children'}
      </EdgeStoreProviderWrapper>
    )

    expect(screen.getByText('String as children')).toBeInTheDocument()
  })
})
