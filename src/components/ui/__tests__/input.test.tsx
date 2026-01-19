import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Rendering Tests
  it('should render input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should have correct default type', () => {
    render(<Input />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('text')
  })

  // Type Tests
  it('should support text type', () => {
    render(<Input type="text" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('text')
  })

  it('should support email type', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('email')
  })

  it('should support password type', () => {
    render(<Input type="password" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('should support number type', () => {
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.type).toBe('number')
  })

  it('should support search type', () => {
    render(<Input type="search" />)
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.type).toBe('search')
  })

  it('should support date type', () => {
    render(<Input type="date" />)
    const input = screen.getByDisplayValue(//) as HTMLInputElement
    expect(input.type).toBe('date')
  })

  it('should support file type', () => {
    render(<Input type="file" />)
    const input = screen.getByRole('button') as HTMLInputElement
    expect(input.type).toBe('file')
  })

  // Value Tests
  it('should handle controlled value', () => {
    render(<Input value="test value" onChange={() => {}} />)
    const input = screen.getByDisplayValue('test value') as HTMLInputElement
    expect(input.value).toBe('test value')
  })

  it('should update value on change', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'Hello')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should support uncontrolled value with defaultValue', () => {
    render(<Input defaultValue="initial" />)
    const input = screen.getByDisplayValue('initial') as HTMLInputElement
    expect(input.value).toBe('initial')
  })

  // Disabled Tests
  it('should support disabled prop', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should not accept input when disabled', async () => {
    const user = userEvent.setup()
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'text')

    expect(input).toHaveValue('')
  })

  // ReadOnly Tests
  it('should support readOnly prop', () => {
    render(<Input readOnly value="read-only" onChange={() => {}} />)
    const input = screen.getByDisplayValue('read-only') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  // Required Tests
  it('should support required prop', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.required).toBe(true)
  })

  // Attribute Tests
  it('should support className prop', () => {
    const { container } = render(<Input className="custom-class" />)
    const input = container.querySelector('input')
    expect(input?.className).toContain('custom-class')
  })

  it('should support aria attributes', () => {
    render(<Input aria-label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('should support data attributes', () => {
    render(<Input data-testid="custom-input" />)
    expect(screen.getByTestId('custom-input')).toBeInTheDocument()
  })

  // Placeholder Tests
  it('should render with placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
  })

  it('should show placeholder when empty', async () => {
    const { container } = render(<Input placeholder="Search..." />)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('placeholder', 'Search...')
  })

  // Min/Max Tests
  it('should support min attribute', () => {
    render(<Input type="number" min="0" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.min).toBe('0')
  })

  it('should support max attribute', () => {
    render(<Input type="number" max="100" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.max).toBe('100')
  })

  it('should support step attribute', () => {
    render(<Input type="number" step="0.5" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.step).toBe('0.5')
  })

  // Pattern Tests
  it('should support pattern attribute', () => {
    render(<Input type="text" pattern="[0-9]{3}-[0-9]{4}" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.pattern).toBe('[0-9]{3}-[0-9]{4}')
  })

  // Focus Tests
  it('should handle focus event', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()

    render(<Input onFocus={handleFocus} />)

    const input = screen.getByRole('textbox')
    await user.click(input)

    expect(handleFocus).toHaveBeenCalled()
  })

  it('should handle blur event', async () => {
    const user = userEvent.setup()
    const handleBlur = vi.fn()

    render(<Input onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab()

    expect(handleBlur).toHaveBeenCalled()
  })

  // Ref Tests
  it('should forward ref to input element', () => {
    let inputRef: HTMLInputElement | null = null
    render(<Input ref={el => { inputRef = el }} />)

    expect(inputRef).toBeTruthy()
    expect(inputRef?.tagName).toBe('INPUT')
  })

  // Text Input Tests
  it('should accept text input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')

    expect(handleChange).toHaveBeenCalled()
  })

  // Special Characters Tests
  it('should accept special characters', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, '!@#$%^&*()')

    expect(input.value).toContain('!')
  })

  // Multiple Handlers
  it('should handle multiple event handlers', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(
      <Input
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.type(input, 'test')
    await user.tab()

    expect(handleFocus).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalled()
    expect(handleBlur).toHaveBeenCalled()
  })

  // Autocomplete Tests
  it('should support autoComplete prop', () => {
    render(<Input autoComplete="email" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.autoComplete).toBe('email')
  })

  // Keyboard Tests
  it('should handle keyboard input', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'keyboard input')

    expect(input.value).toBe('keyboard input')
  })

  it('should handle Enter key', async () => {
    const user = userEvent.setup()
    const handleKeyDown = vi.fn()

    render(<Input onKeyDown={handleKeyDown} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(handleKeyDown).toHaveBeenCalled()
  })
})
