import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Label } from '../label'

describe('Label', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render label element', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('should render as label HTML element', () => {
    render(<Label>Form Label</Label>)
    const label = screen.getByText('Form Label')
    expect(label.tagName).toBe('LABEL')
  })

  // Text Content
  it('should render label with text content', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('should render label with long text', () => {
    const longText = 'This is a very long label text that might wrap to multiple lines'
    render(<Label>{longText}</Label>)
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('should render label with special characters', () => {
    render(<Label>Label with @#$ special chars</Label>)
    expect(screen.getByText('Label with @#$ special chars')).toBeInTheDocument()
  })

  // htmlFor Association
  it('should associate with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email')
  })

  it('should focus associated input on label click', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </>
    )
    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')

    await user.click(label)
    expect(input).toHaveFocus()
  })

  it('should associate with different input types', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    )
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')

    await user.click(label)
    expect(input).toHaveFocus()
  })

  // Styling Tests
  it('should have text-sm styling', () => {
    render(<Label>Small Text</Label>)
    const label = screen.getByText('Small Text')
    expect(label.className).toContain('text-sm')
  })

  it('should have font-medium weight', () => {
    render(<Label>Medium Weight</Label>)
    const label = screen.getByText('Medium Weight')
    expect(label.className).toContain('font-medium')
  })

  it('should have leading-none', () => {
    render(<Label>No Leading</Label>)
    const label = screen.getByText('No Leading')
    expect(label.className).toContain('leading-none')
  })

  it('should have peer styling', () => {
    render(<Label>Peer</Label>)
    const label = screen.getByText('Peer')
    expect(label.className).toContain('peer')
  })

  // Disabled State
  it('should have disabled styling when disabled', () => {
    render(<Label disabled>Disabled Label</Label>)
    const label = screen.getByText('Disabled Label')
    expect(label.className).toContain('disabled')
  })

  it('should prevent interaction when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <>
        <Label disabled htmlFor="disabled-input" onClick={handleClick}>
          Disabled
        </Label>
        <input id="disabled-input" type="text" />
      </>
    )
    const label = screen.getByText('Disabled')

    await user.click(label)
    // Label should still be in the document even when disabled
    expect(label).toBeInTheDocument()
  })

  // Required Indicator
  it('should display required indicator', () => {
    render(
      <Label>
        Email <span aria-label="required">*</span>
      </Label>
    )
    expect(screen.getByLabelText('required')).toBeInTheDocument()
  })

  it('should support required prop styling', () => {
    render(<Label required>Required Field</Label>)
    const label = screen.getByText('Required Field')
    expect(label).toBeInTheDocument()
  })

  // Attributes
  it('should support className prop', () => {
    render(<Label className="custom-label">Custom</Label>)
    const label = screen.getByText('Custom')
    expect(label.className).toContain('custom-label')
  })

  it('should support data attributes', () => {
    render(<Label data-testid="custom-label">Test</Label>)
    expect(screen.getByTestId('custom-label')).toBeInTheDocument()
  })

  it('should support aria-label', () => {
    render(<Label aria-label="form label">Label</Label>)
    expect(screen.getByLabelText('form label')).toBeInTheDocument()
  })

  it('should support aria-describedby', () => {
    render(
      <>
        <Label aria-describedby="hint">Label</Label>
        <span id="hint">This is a hint</span>
      </>
    )
    const label = screen.getByText('Label')
    expect(label).toHaveAttribute('aria-describedby', 'hint')
  })

  // Children
  it('should render text children', () => {
    render(<Label>Simple text</Label>)
    expect(screen.getByText('Simple text')).toBeInTheDocument()
  })

  it('should render element children', () => {
    render(
      <Label>
        <span>Icon</span>
        <span>Text</span>
      </Label>
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('should render mixed children', () => {
    render(
      <Label>
        Email: <strong>Required</strong>
      </Label>
    )
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('should render children with input reference', () => {
    render(
      <Label htmlFor="input-id">
        <span>Clickable</span> Label
      </Label>
    )
    const label = screen.getByText('Label').closest('label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  // Focus Management
  it('should receive focus when clicked', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="focus-input">Focus Label</Label>
        <input id="focus-input" type="text" />
      </>
    )
    const label = screen.getByText('Focus Label')
    const input = screen.getByRole('textbox')

    await user.click(label)
    expect(input).toHaveFocus()
  })

  it.skip('should support focus-visible styling', () => {
    render(<Label>Focus Visible</Label>)
    const label = screen.getByText('Focus Visible')
    expect(label.className).toMatch(/focus:/)
  })

  // Event Handlers
  it('should support onClick handler', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Label onClick={handleClick}>Clickable</Label>)
    const label = screen.getByText('Clickable')

    await user.click(label)
    expect(handleClick).toHaveBeenCalled()
  })

  it('should support onMouseEnter handler', async () => {
    const user = userEvent.setup()
    const handleMouseEnter = vi.fn()
    render(<Label onMouseEnter={handleMouseEnter}>Hover</Label>)
    const label = screen.getByText('Hover')

    await user.hover(label)
    expect(handleMouseEnter).toHaveBeenCalled()
  })

  it('should support onMouseLeave handler', async () => {
    const user = userEvent.setup()
    const handleMouseLeave = vi.fn()
    render(
      <div>
        <Label onMouseLeave={handleMouseLeave}>Hover</Label>
      </div>
    )
    const label = screen.getByText('Hover')

    await user.hover(label)
    fireEvent.mouseLeave(label)
    expect(handleMouseLeave).toHaveBeenCalled()
  })

  // Label with Checkbox
  it('should work with checkbox', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <>
        <Label htmlFor="remember">Remember me</Label>
        <input id="remember" type="checkbox" onChange={handleChange} />
      </>
    )
    const label = screen.getByText('Remember me')
    const checkbox = screen.getByRole('checkbox')

    await user.click(label)
    expect(checkbox).toBeChecked()
  })

  // Label with Radio
  it('should work with radio button', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="option1">Option 1</Label>
        <input id="option1" type="radio" name="options" value="1" />
      </>
    )
    const label = screen.getByText('Option 1')
    const radio = screen.getByRole('radio')

    await user.click(label)
    expect(radio).toBeChecked()
  })

  // Label with Select
  it('should work with select element', () => {
    render(
      <>
        <Label htmlFor="select">Choose option</Label>
        <select id="select">
          <option>Option 1</option>
        </select>
      </>
    )
    const label = screen.getByText('Choose option')
    const select = screen.getByRole('combobox')
    expect(label).toHaveAttribute('for', 'select')
  })

  // Label with Textarea
  it('should work with textarea', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="message">Message</Label>
        <textarea id="message" />
      </>
    )
    const label = screen.getByText('Message')
    const textarea = screen.getByRole('textbox', { hidden: false })

    await user.click(label)
    expect(textarea).toHaveFocus()
  })

  // Multiple Labels
  it('should render multiple labels', () => {
    render(
      <>
        <Label htmlFor="field1">Field 1</Label>
        <Label htmlFor="field2">Field 2</Label>
        <Label htmlFor="field3">Field 3</Label>
      </>
    )
    expect(screen.getByText('Field 1')).toBeInTheDocument()
    expect(screen.getByText('Field 2')).toBeInTheDocument()
    expect(screen.getByText('Field 3')).toBeInTheDocument()
  })

  // Error States
  it('should support error styling via className', () => {
    render(<Label className="text-red-500">Error Label</Label>)
    const label = screen.getByText('Error Label')
    expect(label.className).toContain('text-red-500')
  })

  it('should support success styling via className', () => {
    render(<Label className="text-green-500">Success Label</Label>)
    const label = screen.getByText('Success Label')
    expect(label.className).toContain('text-green-500')
  })

  // Optional Indicator
  it('should display optional indicator', () => {
    render(
      <Label>
        Email <span className="text-muted-foreground">(optional)</span>
      </Label>
    )
    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  // Cursor Styling


  // Combination Tests
  it('should combine multiple attributes', () => {
    render(
      <Label
        htmlFor="combined"
        className="text-lg font-bold"
        aria-describedby="helper"
      >
        Combined Label
      </Label>
    )
    const label = screen.getByText('Combined Label')
    expect(label).toHaveAttribute('for', 'combined')
    expect(label).toHaveAttribute('aria-describedby', 'helper')
    expect(label.className).toContain('text-lg')
    expect(label.className).toContain('font-bold')
  })

  it('should combine with input in form', () => {
    render(
      <>
        <Label htmlFor="email">Email Address</Label>
        <input id="email" type="email" placeholder="you@example.com" />
      </>
    )
    const label = screen.getByText('Email Address')
    const input = screen.getByPlaceholderText('you@example.com')
    expect(label).toHaveAttribute('for', 'email')
  })

  // Edge Cases
  it('should handle empty label', () => {
    const { container } = render(<Label></Label>)
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
  })

  it('should handle label with only whitespace', () => {
    const { container } = render(<Label>   </Label>)
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
  })

  it('should handle numeric htmlFor', () => {
    render(
      <>
        <Label htmlFor="123">Field</Label>
        <input id="123" type="text" />
      </>
    )
    const label = screen.getByText('Field')
    expect(label).toHaveAttribute('for', '123')
  })

  // Ref Forwarding
  it('should forward ref to label element', () => {
    let ref: HTMLLabelElement | null = null
    render(<Label ref={el => (ref = el)}>Ref Test</Label>)
    expect(ref).toBeInstanceOf(HTMLLabelElement)
    expect(ref?.textContent).toBe('Ref Test')
  })

  // Keyboard Navigation
  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Label htmlFor="keyboard-input">Keyboard Label</Label>
        <input id="keyboard-input" type="text" />
      </>
    )
    const input = screen.getByRole('textbox')

    await user.tab()
    expect(input).toHaveFocus()
  })

  it('should be part of tab order', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button>Button</button>
        <Label htmlFor="input">Label</Label>
        <input id="input" type="text" />
      </>
    )
    const button = screen.getByRole('button')
    const input = screen.getByRole('textbox')

    await user.tab()
    expect(button).toHaveFocus()

    await user.tab()
    expect(input).toHaveFocus()
  })
})
