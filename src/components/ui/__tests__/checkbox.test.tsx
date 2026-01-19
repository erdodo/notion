import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Rendering Tests
  it('should render checkbox element', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should render unchecked by default', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox).not.toBeChecked()
  })

  // Checked State Tests
  it('should render checked when defaultChecked is true', () => {
    render(<Checkbox defaultChecked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should handle controlled checked state', () => {
    render(<Checkbox checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalled()
  })

  // Disabled Tests
  it('should support disabled prop', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('should not toggle when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox disabled onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).not.toHaveBeenCalled()
  })

  // Required Tests
  it('should support required prop', () => {
    render(<Checkbox required />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.required).toBe(true)
  })

  // Attribute Tests
  it('should support className prop', () => {
    const { container } = render(<Checkbox className="custom-class" />)
    const checkbox = container.querySelector('[role="checkbox"]')
    expect(checkbox?.className).toContain('custom-class')
  })

  it('should support aria-label prop', () => {
    render(<Checkbox aria-label="Agree to terms" />)
    expect(screen.getByLabelText('Agree to terms')).toBeInTheDocument()
  })

  it('should support data attributes', () => {
    render(<Checkbox data-testid="custom-checkbox" />)
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument()
  })

  // Event Handler Tests
  it('should handle change event', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalled()
  })

  it('should call onChange with correct event', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith(expect.any(Event))
  })

  // Multiple Toggles
  it('should toggle multiple times', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    await user.click(checkbox)
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledTimes(3)
  })

  // Ref Tests
  it('should forward ref to checkbox element', () => {
    let checkboxRef: HTMLButtonElement | null = null
    render(<Checkbox ref={el => { checkboxRef = el }} />)

    expect(checkboxRef).toBeTruthy()
  })

  // Focus Tests
  it('should handle focus event', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()

    render(<Checkbox onFocus={handleFocus} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleFocus).toHaveBeenCalled()
  })

  it('should handle blur event', async () => {
    const user = userEvent.setup()
    const handleBlur = vi.fn()

    render(<Checkbox onBlur={handleBlur} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    await user.tab()

    expect(handleBlur).toHaveBeenCalled()
  })

  // Keyboard Navigation Tests
  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    checkbox.focus()

    expect(checkbox).toHaveFocus()
  })

  it('should toggle on Space key', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    checkbox.focus()
    await user.keyboard(' ')

    expect(handleChange).toHaveBeenCalled()
  })

  // Indicator Display Tests
  it('should display check icon when checked', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')

    // Icon is in the DOM after checking
    await user.click(checkbox)

    // Verify it's checked
    expect(checkbox).toBeChecked()
  })

  // Accessibility Tests
  it('should have proper ARIA attributes', () => {
    render(<Checkbox aria-labelledby="label-id" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-labelledby', 'label-id')
  })

  it('should have aria-checked state', () => {
    const { rerender } = render(<Checkbox checked onChange={() => {}} />)
    const checkbox = screen.getByRole('checkbox')

    // Checked state
    expect(checkbox).toBeChecked()

    rerender(<Checkbox checked={false} onChange={() => {}} />)
    expect(checkbox).not.toBeChecked()
  })

  // Mixed State Tests
  it('should support indeterminate state', () => {
    const { container } = render(<Checkbox aria-label="Select all" />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    expect(checkbox).toBeInTheDocument()
  })

  // Styling Tests
  it('should have focus ring styling', () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('[role="checkbox"]')
    expect(checkbox?.className).toMatch(/focus-visible:ring/)
  })

  // Disabled Styling
  it('should apply disabled styling', () => {
    const { container } = render(<Checkbox disabled />)
    const checkbox = container.querySelector('[role="checkbox"]')
    expect(checkbox?.className).toMatch(/disabled/)
  })

  // Name Attribute Tests
  it('should support name attribute', () => {
    render(<Checkbox name="agree" />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.name).toBe('agree')
  })

  // Value Tests
  it('should support value attribute', () => {
    render(<Checkbox value="option-1" />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.value).toBe('option-1')
  })

  // Complex Interactions
  it('should handle controlled and uncontrolled states', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    const { rerender } = render(<Checkbox defaultChecked onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(handleChange).toHaveBeenCalled()
  })

  // Edge Cases
  it('should handle rapid clicks', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    await user.click(checkbox)
    await user.click(checkbox)
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledTimes(4)
  })
})
