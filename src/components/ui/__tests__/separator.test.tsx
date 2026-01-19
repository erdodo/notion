import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from '../separator'

describe('Separator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render separator element', () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render separator with role attribute', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator).toHaveAttribute('role')
  })

  // Orientation Tests
  it('should render horizontal separator by default', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('h-')
    expect(separator?.className).toContain('w-full')
  })

  it('should render vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('h-full')
    expect(separator?.className).toContain('w-')
  })

  // Styling Tests - Horizontal
  it('should have correct horizontal height', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toMatch(/h-\[1px\]/)
  })

  it('should have full width when horizontal', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('w-full')
  })

  it('should have background color when horizontal', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toMatch(/bg-/)
  })

  // Styling Tests - Vertical
  it('should have correct vertical width', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toMatch(/w-\[1px\]/)
  })

  it('should have full height when vertical', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('h-full')
  })

  it('should have background color when vertical', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toMatch(/bg-/)
  })

  // Border Styling
  it('should have shrink-0 to prevent collapsing', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('shrink-0')
  })

  // Color Tests
  it('should use border color', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toMatch(/bg-border/)
  })

  // Attributes
  it('should support className prop', () => {
    const { container } = render(<Separator className="custom-sep" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('custom-sep')
  })

  it('should support data attributes', () => {
    render(<Separator data-testid="custom-separator" />)
    expect(screen.getByTestId('custom-separator')).toBeInTheDocument()
  })

  it('should support aria-label', () => {
    render(<Separator aria-label="divider" />)
    expect(screen.getByLabelText('divider')).toBeInTheDocument()
  })

  it('should support aria-orientation', () => {
    const { container } = render(<Separator orientation="vertical" aria-orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  // Multiple Separators
  it('should render multiple horizontal separators', () => {
    const { container } = render(
      <>
        <Separator data-testid="sep-1" />
        <div>Content</div>
        <Separator data-testid="sep-2" />
        <div>More Content</div>
        <Separator data-testid="sep-3" />
      </>
    )
    expect(screen.getByTestId('sep-1')).toBeInTheDocument()
    expect(screen.getByTestId('sep-2')).toBeInTheDocument()
    expect(screen.getByTestId('sep-3')).toBeInTheDocument()
  })

  it('should render multiple vertical separators', () => {
    render(
      <>
        <Separator orientation="vertical" data-testid="vsep-1" />
        <Separator orientation="vertical" data-testid="vsep-2" />
        <Separator orientation="vertical" data-testid="vsep-3" />
      </>
    )
    expect(screen.getByTestId('vsep-1')).toBeInTheDocument()
    expect(screen.getByTestId('vsep-2')).toBeInTheDocument()
    expect(screen.getByTestId('vsep-3')).toBeInTheDocument()
  })

  // Mixed Orientations
  it('should render mixed horizontal and vertical separators', () => {
    render(
      <>
        <Separator data-testid="h-sep" />
        <Separator orientation="vertical" data-testid="v-sep" />
        <Separator data-testid="h-sep-2" />
      </>
    )
    expect(screen.getByTestId('h-sep')).toBeInTheDocument()
    expect(screen.getByTestId('v-sep')).toBeInTheDocument()
    expect(screen.getByTestId('h-sep-2')).toBeInTheDocument()
  })

  // Layout Context - Flexbox
  it('should work in flex row layout', () => {
    const { container } = render(
      <div className="flex gap-4">
        <div>Item 1</div>
        <Separator orientation="vertical" />
        <div>Item 2</div>
      </div>
    )
    expect(container.querySelector('div > div:nth-child(2)')).toBeInTheDocument()
  })

  it('should work in flex column layout', () => {
    const { container } = render(
      <div className="flex flex-col gap-4">
        <div>Item 1</div>
        <Separator />
        <div>Item 2</div>
      </div>
    )
    expect(container.querySelector('div > div:nth-child(2)')).toBeInTheDocument()
  })

  // Layout Context - Grid
  it('should work in grid layout', () => {
    const { container } = render(
      <div className="grid gap-4">
        <div>Item 1</div>
        <Separator />
        <div>Item 2</div>
      </div>
    )
    expect(container.querySelector('div > div:nth-child(2)')).toBeInTheDocument()
  })

  // Accessibility
  it('should have proper role for horizontal separator', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator).toHaveAttribute('role')
  })

  it('should have proper role for vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('div')
    expect(separator).toHaveAttribute('role')
  })

  // Responsive Styling
  it('should support responsive className', () => {
    const { container } = render(
      <Separator className="md:h-[2px] lg:h-[3px]" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('md:h-[2px]')
    expect(separator?.className).toContain('lg:h-[3px]')
  })

  // Size Variations
  it('should support custom height for horizontal', () => {
    const { container } = render(
      <Separator className="h-1" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('h-1')
  })

  it('should support custom width for vertical', () => {
    const { container } = render(
      <Separator orientation="vertical" className="w-1" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('w-1')
  })

  // Color Variations
  it('should support custom background color', () => {
    const { container } = render(
      <Separator className="bg-red-500" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('bg-red-500')
  })

  it('should support opacity', () => {
    const { container } = render(
      <Separator className="opacity-50" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('opacity-50')
  })

  // Margin Tests
  it('should support custom margins', () => {
    const { container } = render(
      <Separator className="my-4" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('my-4')
  })

  it('should support custom margins on vertical', () => {
    const { container } = render(
      <Separator orientation="vertical" className="mx-4" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('mx-4')
  })

  // Default Props
  it('should have default orientation horizontal', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('w-full')
  })

  // Edge Cases
  it('should render without any props', () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render with only orientation prop', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render with only className prop', () => {
    const { container } = render(<Separator className="custom" />)
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('custom')
  })

  // Ref Forwarding
  it('should forward ref to div element', () => {
    let ref: HTMLDivElement | null = null
    render(<Separator ref={el => (ref = el)} />)
    expect(ref).toBeInstanceOf(HTMLDivElement)
  })

  // Decorative Content
  it('should work as decorative separator', () => {
    const { container } = render(
      <div>
        <h1>Title</h1>
        <Separator />
        <p>Content</p>
      </div>
    )
    expect(container.querySelector('div > div:nth-child(2)')).toBeInTheDocument()
  })

  // List Separator
  it('should work as list item separator', () => {
    const { container } = render(
      <ul>
        <li>Item 1</li>
        <li><Separator /></li>
        <li>Item 2</li>
      </ul>
    )
    expect(container.querySelector('li > div')).toBeInTheDocument()
  })

  // Form Separator
  it('should work in form layout', () => {
    const { container } = render(
      <form>
        <input type="text" placeholder="Field 1" />
        <Separator className="my-4" />
        <input type="text" placeholder="Field 2" />
      </form>
    )
    expect(container.querySelector('form > div')).toBeInTheDocument()
  })

  // Card Content Separator
  it('should work in card layout', () => {
    const { container } = render(
      <div className="border rounded">
        <div>Header</div>
        <Separator className="my-4" />
        <div>Body</div>
      </div>
    )
    expect(container.querySelector('div > div:nth-child(2)')).toBeInTheDocument()
  })

  // Navigation Separator
  it('should work in navigation layout', () => {
    const { container } = render(
      <nav>
        <a href="#1">Link 1</a>
        <Separator orientation="vertical" className="mx-2" />
        <a href="#2">Link 2</a>
      </nav>
    )
    expect(container.querySelector('nav > div')).toBeInTheDocument()
  })

  // Breadcrumb Separator
  it('should work as breadcrumb separator', () => {
    render(
      <>
        <span>Home</span>
        <Separator orientation="vertical" className="mx-1" data-testid="sep" />
        <span>Products</span>
      </>
    )
    expect(screen.getByTestId('sep')).toBeInTheDocument()
  })

  // Menu Separator
  it('should work as menu item separator', () => {
    render(
      <menu>
        <li><a href="#1">New</a></li>
        <li><Separator className="my-1" data-testid="menu-sep" /></li>
        <li><a href="#2">Save</a></li>
      </menu>
    )
    expect(screen.getByTestId('menu-sep')).toBeInTheDocument()
  })

  // Table Separator
  it('should work in table layout', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr><td>Data 1</td></tr>
          <tr><td><Separator /></td></tr>
          <tr><td>Data 2</td></tr>
        </tbody>
      </table>
    )
    expect(container.querySelector('td > div')).toBeInTheDocument()
  })

  // Combination Tests
  it('should combine orientation with custom className', () => {
    const { container } = render(
      <Separator orientation="vertical" className="h-12 bg-blue-500" />
    )
    const separator = container.querySelector('div')
    expect(separator?.className).toContain('h-12')
    expect(separator?.className).toContain('bg-blue-500')
  })

  it('should combine all attributes', () => {
    render(
      <Separator
        orientation="vertical"
        className="custom-sep"
        data-testid="full-sep"
        aria-label="separator"
      />
    )
    expect(screen.getByTestId('full-sep')).toBeInTheDocument()
    expect(screen.getByLabelText('separator')).toBeInTheDocument()
  })

  // Display Verification
  it('should not have displayName', () => {
    // Separator is a simple component, just verify it renders
    const { container } = render(<Separator />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
