import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render textarea element', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render as textarea HTML element', () => {
    const { container } = render(<Textarea />)
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })

  // Placeholder
  it('should render placeholder text', () => {
    render(<Textarea placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  it('should show placeholder when empty', () => {
    render(<Textarea placeholder="Type your message..." />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Type your message...')
  })

  // Text Input
  it('should accept text input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('should accept multiline text', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Line 1\nLine 2\nLine 3')
    expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
  })

  it('should handle special characters', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, '!@#$%^&*()')
    expect(textarea).toHaveValue('!@#$%^&*()')
  })

  // Value Binding
  it('should bind initial value', () => {
    render(<Textarea value="Initial text" readOnly />)
    expect(screen.getByRole('textbox')).toHaveValue('Initial text')
  })

  it('should work as controlled component', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { rerender } = render(
      <Textarea value="initial" onChange={handleChange} />
    )
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'text')
    expect(handleChange).toHaveBeenCalled()

    rerender(<Textarea value="controlled" onChange={handleChange} />)
    expect(textarea).toHaveValue('controlled')
  })

  it('should have defaultValue', () => {
    render(<Textarea defaultValue="Default text" />)
    expect(screen.getByRole('textbox')).toHaveValue('Default text')
  })

  // Event Handlers
  it('should call onChange handler', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should call onFocus handler', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    render(<Textarea onFocus={handleFocus} />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(handleFocus).toHaveBeenCalled()
  })

  it('should call onBlur handler', async () => {
    const user = userEvent.setup()
    const handleBlur = vi.fn()
    render(
      <>
        <Textarea onBlur={handleBlur} />
        <button>Other</button>
      </>
    )
    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button')

    await user.click(textarea)
    await user.click(button)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('should call onKeyDown handler', async () => {
    const user = userEvent.setup()
    const handleKeyDown = vi.fn()
    render(<Textarea onKeyDown={handleKeyDown} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'a')
    expect(handleKeyDown).toHaveBeenCalled()
  })

  // Styling Tests
  it('should have flex display', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('flex')
  })

  it('should have min-height', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toMatch(/min-h-/)
  })

  it('should have width styling', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('w-full')
  })

  it('should have padding', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toMatch(/px-/)
    expect(textarea.className).toMatch(/py-/)
  })

  it('should have border styling', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('border')
    expect(textarea.className).toContain('rounded-md')
  })

  it('should have background color', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toMatch(/bg-/)
  })

  // Focus Styling
  it('should have focus styling', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toMatch(/focus:/)
  })

  it('should support focus-visible ring', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('focus:outline-none')
  })

  // Disabled State
  it('should render disabled textarea', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should prevent input when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Textarea disabled onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'text')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should have disabled styling', () => {
    const { container } = render(<Textarea disabled />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('disabled')
  })

  // ReadOnly State
  it('should render readonly textarea', () => {
    render(<Textarea readOnly value="Read only text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('readOnly')
  })

  it('should prevent editing when readonly', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <Textarea
        readOnly
        value="Read only"
        onChange={handleChange}
      />
    )
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(handleChange).not.toHaveBeenCalled()
  })

  // Required State
  it('should support required attribute', () => {
    render(<Textarea required />)
    expect(screen.getByRole('textbox')).toHaveAttribute('required')
  })

  // Rows and Cols
  it('should support rows attribute', () => {
    render(<Textarea rows={10} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10')
  })

  it('should support cols attribute', () => {
    render(<Textarea cols={50} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('cols', '50')
  })

  // Attributes
  it('should support id attribute', () => {
    render(<Textarea id="message-input" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'message-input')
  })

  it('should support name attribute', () => {
    render(<Textarea name="message" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'message')
  })

  it('should support className prop', () => {
    const { container } = render(<Textarea className="custom-textarea" />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('custom-textarea')
  })

  it('should support data attributes', () => {
    render(<Textarea data-testid="custom-textarea" />)
    expect(screen.getByTestId('custom-textarea')).toBeInTheDocument()
  })

  it('should support aria-label', () => {
    render(<Textarea aria-label="message input" />)
    expect(screen.getByLabelText('message input')).toBeInTheDocument()
  })

  it('should support aria-describedby', () => {
    render(
      <>
        <Textarea aria-describedby="help-text" />
        <span id="help-text">Max 500 characters</span>
      </>
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
  })

  // Focus Management
  it('should focus textarea on click', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(textarea).toHaveFocus()
  })

  it('should support autofocus', () => {
    render(<Textarea autoFocus />)
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  // Character Count Pattern
  it('should work with character count', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <div>
        <Textarea onChange={handleChange} />
        <span>Character count</span>
      </div>
    )
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Hello')
    expect(handleChange).toHaveBeenCalled()
  })

  // Form Integration
  it('should work in form', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn(e => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Textarea name="message" />
        <button type="submit">Submit</button>
      </form>
    )
    await user.click(screen.getByRole('button'))
    expect(handleSubmit).toHaveBeenCalled()
  })

  // Keyboard Navigation
  it('should accept Tab key', async () => {
    const user = userEvent.setup()
    render(
      <>
        <input type="text" />
        <Textarea />
        <button>Next</button>
      </>
    )
    const textarea = screen.getByRole('textbox')

    await user.tab()
    await user.tab()
    expect(textarea).toHaveFocus()
  })

  it('should accept Enter key for new line', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    await user.keyboard('{Enter}')
    expect(textarea).toHaveValue('\n')
  })

  // Resize Tests
  it('should support resize styling', () => {
    const { container } = render(<Textarea className="resize-vertical" />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('resize-vertical')
  })

  // Text Transform
  it('should accept uppercase input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'HELLO WORLD')
    expect(textarea).toHaveValue('HELLO WORLD')
  })

  it('should accept lowercase input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'hello world')
    expect(textarea).toHaveValue('hello world')
  })

  // Multiple Lines
  it('should handle multiple paragraphs', async () => {
    const user = userEvent.setup()
    const text = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3'
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, text)
    expect(textarea).toHaveValue(text)
  })

  // Copy/Paste Pattern
  it('should handle paste event', async () => {
    const user = userEvent.setup()
    const handlePaste = vi.fn()
    render(<Textarea onPaste={handlePaste} />)
    const textarea = screen.getByRole('textbox')

    textarea.focus()
    // Simulate paste event
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    })
    textarea.dispatchEvent(pasteEvent)
    expect(handlePaste).toHaveBeenCalled()
  })

  // Selection Tests
  it('should support text selection', async () => {
    const user = userEvent.setup()
    render(<Textarea value="Hello World" />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.click(textarea)
    textarea.setSelectionRange(0, 5)
    expect(textarea.selectionStart).toBe(0)
    expect(textarea.selectionEnd).toBe(5)
  })

  // Long Content
  it('should handle very long text', async () => {
    const user = userEvent.setup()
    const longText = 'a'.repeat(1000)
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, longText)
    expect(textarea).toHaveValue(longText)
  })

  // Combination Tests
  it('should combine multiple attributes', () => {
    render(
      <Textarea
        id="message"
        name="content"
        placeholder="Enter message"
        rows={5}
        cols={40}
        className="custom-textarea"
        aria-label="Message input"
        required
      />
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute('name', 'content')
    expect(textarea).toHaveAttribute('placeholder', 'Enter message')
    expect(textarea).toHaveAttribute('required')
  })

  // Ref Forwarding
  it('should forward ref to textarea element', () => {
    let ref: HTMLTextAreaElement | null = null
    render(<Textarea ref={el => (ref = el)} />)
    expect(ref).toBeInstanceOf(HTMLTextAreaElement)
  })

  // Edge Cases
  it('should handle empty input', () => {
    render(<Textarea value="" readOnly />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('should handle whitespace', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, '   ')
    expect(textarea).toHaveValue('   ')
  })

  it('should handle unicode characters', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, '你好世界 🌍 😊')
    expect(textarea).toHaveValue('你好世界 🌍 😊')
  })

  // Scrollable Content
  it('should be scrollable with overflow', () => {
    const { container } = render(<Textarea className="overflow-y-auto" />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toContain('overflow-y-auto')
  })

  // Hover Effects
  it('should have hover styling', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')!
    expect(textarea.className).toMatch(/hover:/)
  })

  // Label Association
  it('should work with label', async () => {
    const user = userEvent.setup()
    render(
      <>
        <label htmlFor="feedback">Feedback</label>
        <Textarea id="feedback" />
      </>
    )
    const label = screen.getByText('Feedback')
    const textarea = screen.getByRole('textbox')

    await user.click(label)
    expect(textarea).toHaveFocus()
  })

  // Placeholder Visibility
  it('should hide placeholder when typing', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByRole('textbox')

    expect(textarea).toHaveAttribute('placeholder', 'Enter text')
    await user.type(textarea, 'some text')
    expect(textarea).toHaveValue('some text')
  })
})
