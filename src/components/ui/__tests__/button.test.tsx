import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Rendering Tests
  it('should render button element', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render button with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render button with variant prop', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should render button with size prop', () => {
    const { container } = render(<Button size="lg">Large button</Button>)
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  // Variant Tests
  it('should apply default variant by default', () => {
    const { container } = render(<Button>Default</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/bg-primary/)
  })

  it('should apply destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/destructive/)
  })

  it('should apply outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/outline/)
  })

  it('should apply secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/secondary/)
  })

  it('should apply ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/ghost/)
  })

  it('should apply link variant', () => {
    const { container } = render(<Button variant="link">Link</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/link/)
  })

  // Size Tests
  it('should apply default size by default', () => {
    const { container } = render(<Button>Default</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/h-10/)
  })

  it('should apply sm size', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/h-9/)
  })

  it('should apply lg size', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/h-11/)
  })

  it('should apply icon size', () => {
    const { container } = render(<Button size="icon">🔍</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/h-10 w-10/)
  })

  // Click Handler Tests
  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should call onClick handler multiple times', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  // Disabled Tests
  it('should support disabled prop', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should not trigger click handler when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply disabled styles', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/disabled:opacity-50/)
  })

  // Type Tests
  it('should support type prop', () => {
    const { container } = render(<Button type="submit">Submit</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should default to type="button"', () => {
    const { container } = render(<Button>Click</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  // Attribute Tests
  it('should support className prop', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('custom-class')
  })

  it('should support aria attributes', () => {
    render(<Button aria-label="Close">×</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close')
  })

  it('should support data attributes', () => {
    const { container } = render(<Button data-testid="custom-button">Test</Button>)
    const button = container.querySelector('[data-testid="custom-button"]')
    expect(button).toBeInTheDocument()
  })

  // Children Tests
  it('should render text children', () => {
    render(<Button>Text content</Button>)
    expect(screen.getByText('Text content')).toBeInTheDocument()
  })

  it('should render element children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Label</span>
      </Button>
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('should render mixed children', () => {
    render(
      <Button>
        Start <strong>Bold</strong> End
      </Button>
    )
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  // Keyboard Tests
  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Button>Keyboard</Button>)

    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })

  it('should trigger click on Enter key', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Keyboard</Button>)

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })

  it('should trigger click on Space key', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Keyboard</Button>)

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard(' ')
    expect(handleClick).toHaveBeenCalled()
  })

  // Ref Tests
  it('should forward ref to button element', () => {
    let buttonRef: HTMLButtonElement | null = null
    const { container } = render(
      <Button ref={el => { buttonRef = el }}>Ref test</Button>
    )

    expect(buttonRef).toBeTruthy()
    expect(buttonRef?.tagName).toBe('BUTTON')
  })

  // Focus Tests
  it('should have focus-visible ring style', () => {
    const { container } = render(<Button>Focus</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toMatch(/focus-visible:ring/)
  })

  // Multiple Variants
  it('should combine variant and size', () => {
    const { container } = render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    )
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should combine variant and size with custom className', () => {
    const { container } = render(
      <Button variant="outline" size="sm" className="custom">
        Custom
      </Button>
    )
    const button = container.querySelector('button')
    expect(button?.className).toContain('custom')
  })

  // Empty/Loading States
  it('should render empty button', () => {
    render(<Button></Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render button with loading state', () => {
    render(<Button disabled>Loading...</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Loading...')
  })
})
