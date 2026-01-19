import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Rendering Tests
  it('should render badge element', () => {
    render(<Badge>Badge</Badge>)
    expect(screen.getByText('Badge')).toBeInTheDocument()
  })

  it('should render badge with text content', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  // Variant Tests
  it('should apply default variant by default', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/bg-primary/)
  })

  it('should apply secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/secondary/)
  })

  it('should apply destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Destructive</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/destructive/)
  })

  it('should apply outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/outline/)
  })

  // Size Tests
  it('should apply default size by default', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/px-2.5/)
  })

  it('should apply sm size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/sm/)
  })

  it('should apply lg size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/lg/)
  })

  // Styling Tests
  it('should have rounded-full styling', () => {
    const { container } = render(<Badge>Rounded</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('rounded-full')
  })

  it('should have inline-flex display', () => {
    const { container } = render(<Badge>Inline</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('inline-flex')
  })

  it('should have border styling', () => {
    const { container } = render(<Badge>Border</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('border')
  })

  it('should have items center alignment', () => {
    const { container } = render(<Badge>Centered</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('items-center')
  })

  // Text Styling Tests
  it('should have text-xs sizing', () => {
    const { container } = render(<Badge>Text</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('text-xs')
  })

  it('should have font-semibold weight', () => {
    const { container } = render(<Badge>Bold</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('font-semibold')
  })

  // Combination Tests
  it('should combine variant and size', () => {
    const { container } = render(
      <Badge variant="destructive" size="lg">
        Delete
      </Badge>
    )
    const badge = container.querySelector('div')
    expect(badge).toBeInTheDocument()
  })

  it('should combine all attributes', () => {
    const { container } = render(
      <Badge
        variant="secondary"
        size="sm"
        className="custom-badge"
      >
        Custom
      </Badge>
    )
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('custom-badge')
  })

  // Attribute Tests
  it('should support className prop', () => {
    const { container } = render(<Badge className="custom">Custom</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('custom')
  })

  it('should support aria-label prop', () => {
    render(<Badge aria-label="New feature">New</Badge>)
    expect(screen.getByLabelText('New feature')).toBeInTheDocument()
  })

  it('should support data attributes', () => {
    render(<Badge data-testid="custom-badge">Badge</Badge>)
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })

  // Children Tests
  it('should render text children', () => {
    render(<Badge>Text content</Badge>)
    expect(screen.getByText('Text content')).toBeInTheDocument()
  })

  it('should render element children', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Label</span>
      </Badge>
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('should render mixed children', () => {
    render(
      <Badge>
        Status: <strong>Active</strong>
      </Badge>
    )
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  // Focus Tests
  it('should support focus styling', () => {
    const { container } = render(<Badge>Focusable</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('focus:outline-none')
  })

  // Hover Tests
  it('should have hover styling', () => {
    const { container } = render(<Badge>Hover</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/hover:/)
  })

  // Multiple Badges
  it('should render multiple badges', () => {
    render(
      <>
        <Badge>First</Badge>
        <Badge>Second</Badge>
        <Badge>Third</Badge>
      </>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('should render badges with different variants', () => {
    render(
      <>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </>
    )
    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Destructive')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  // Empty Badge
  it('should render empty badge', () => {
    const { container } = render(<Badge />)
    const badge = container.querySelector('div')
    expect(badge).toBeInTheDocument()
  })

  // Long Text
  it('should handle long text', () => {
    render(<Badge>This is a very long badge text that might wrap</Badge>)
    expect(screen.getByText('This is a very long badge text that might wrap')).toBeInTheDocument()
  })

  // Special Characters
  it('should handle special characters', () => {
    render(<Badge>New! @#$</Badge>)
    expect(screen.getByText('New! @#$')).toBeInTheDocument()
  })

  // Numbers
  it('should handle numeric content', () => {
    render(<Badge>5</Badge>)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  // Transition Styling
  it('should have transition styling', () => {
    const { container } = render(<Badge>Transition</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toContain('transition-colors')
  })

  // Flex Properties
  it('should have proper flex spacing', () => {
    const { container } = render(<Badge>Flex</Badge>)
    const badge = container.querySelector('div')
    expect(badge?.className).toMatch(/justify-center/)
  })

  // Edge Cases
  it('should handle all variant and size combinations', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline']
    const sizes = ['default', 'sm', 'lg']

    variants.forEach(variant => {
      sizes.forEach(size => {
        const { container: container1 } = render(
          <Badge variant={variant as any} size={size as any}>
            {variant}-{size}
          </Badge>
        )
        expect(container1.querySelector('div')).toBeInTheDocument()
      })
    })
  })
})
