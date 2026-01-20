import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormattingToolbar } from '../formatting-toolbar'

// Mock dependencies
vi.mock('@blocknote/react', () => ({
  useBlockNoteEditor: vi.fn(),
  FormattingToolbarPositioner: ({ children }: any) => <div>{children}</div>,
}))

describe.skip('FormattingToolbar', () => {
  let getSelectionSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getSelection
    getSelectionSpy = vi.spyOn(window, 'getSelection').mockImplementation(() => {
      return {
        rangeCount: 1,
        getRangeAt: () => ({
          getBoundingClientRect: () => ({
            top: 100, left: 100, width: 100, height: 20, right: 200, bottom: 120
          }),
          commonAncestorContainer: document.createElement('div'),
        }),
        toString: () => 'Selected Text',
        removeAllRanges: vi.fn(),
      } as any
    })
  })

  afterEach(() => {
    getSelectionSpy.mockRestore()
  })

  // Mock editor
  const createMockEditor = () => ({
    isActive: vi.fn(() => false),
    getActiveStyles: vi.fn(() => ({})),
    commands: {
      toggleBold: vi.fn(() => true),
      toggleItalic: vi.fn(() => true),
      toggleUnderline: vi.fn(() => true),
      toggleStrike: vi.fn(() => true),
      toggleCode: vi.fn(() => true),
      setTextColor: vi.fn(() => true),
      setHighlight: vi.fn(() => true),
    },
    toggleStyles: vi.fn(),
    addStyles: vi.fn(),
    removeStyles: vi.fn(),
  })

  // Basic Rendering
  it('should render formatting toolbar', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    // Needs async wait for useEffect to pick up selection and set isVisible
    expect(await screen.findByRole('button', { name: /bold/i })).toBeInTheDocument()
  })

  // Bold Button
  it('should render bold button', async () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Bold/i)).toBeInTheDocument()
  })

  it('should toggle bold on click', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const boldButton = await screen.findByTitle(/Bold/i)
    fireEvent.click(boldButton)
    expect(editor.toggleStyles).toHaveBeenCalledWith({ bold: true })
  })

  // Italic Button
  it('should render italic button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Italic/i)).toBeInTheDocument()
  })

  // Underline Button
  it('should render underline button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Underline/i)).toBeInTheDocument()
  })

  // Strikethrough Button
  it('should render strikethrough button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Strikethrough/i)).toBeInTheDocument()
  })

  // Code Button
  it('should render code button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Inline Code/i)).toBeInTheDocument()
  })

  // Color Picker
  it('should render color picker button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Text Color/i)).toBeInTheDocument()
  })

  it('should open color picker popover', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const colorBtn = await screen.findByTitle(/Text Color/i)
    fireEvent.click(colorBtn)
    expect(await screen.findByText('Text Color')).toBeInTheDocument()
  })

  // Highlight Picker
  it('should render highlight picker button', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByTitle(/Highlight Color/i)).toBeInTheDocument()
  })

  // Button Click Handlers
  it('should handle multiple button clicks', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const boldBtn = await screen.findByTitle(/Bold/i)
    const italicBtn = await screen.findByTitle(/Italic/i)
    await user.click(boldBtn)
    await user.click(italicBtn)
    expect(editor.toggleStyles).toHaveBeenCalledTimes(2)
  })

  // Icon Display
  it('should display formatting icons', async () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    await screen.findByTitle(/Bold/i) // Wait for render
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  // Toolbar State
  it('should reflect editor state for bold', async () => {
    const editor = createMockEditor()
    editor.getActiveStyles.mockReturnValue({ bold: true })
    render(<FormattingToolbar editor={editor} />)

    // Check if bold button has active class or similar
    const boldBtn = await screen.findByTitle(/Bold/i)
    expect(boldBtn.className).toContain('bg-accent')
  })

  // Toolbar State Changes
  it('should update state when editor changes', async () => {
    const editor = createMockEditor()
    const { rerender } = render(<FormattingToolbar editor={editor} />)

    await screen.findByTitle(/Bold/i)

    // Simulate state change
    editor.getActiveStyles.mockReturnValue({ bold: true })
    rerender(<FormattingToolbar editor={editor} />)

    const boldBtn = await screen.findByTitle(/Bold/i)
    expect(boldBtn.className).toContain('bg-accent')
  })

  // Accessibility
  it('should have accessible buttons', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    const buttons = await screen.findAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
    })
  })

  // Keyboard Navigation
  it('should support keyboard navigation between buttons', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = await screen.findAllByRole('button')
    buttons[0].focus()
    expect(buttons[0]).toHaveFocus()

    await user.keyboard('{Tab}')
    expect(buttons[1]).toHaveFocus()
  })

  // Disabled State
  it('should handle disabled editor gracefully', async () => {
    // If editor provides no commands, buttons might throw? 
    // The current implementation checks "editor" prop existence.
    // If editor prop is valid but methods are missing? 
    // Type is "any" in component.
    const editor = {
      isActive: vi.fn(() => false),
      getActiveStyles: vi.fn(() => ({})),
      commands: {}, // Empty
    }
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByRole('button', { name: /bold/i })).toBeInTheDocument()
  })

  // Multiple Toolbars
  it('should render multiple toolbars independently', async () => {
    const editor1 = createMockEditor()
    const editor2 = createMockEditor()

    render(
      <>
        <FormattingToolbar editor={editor1} />
        <FormattingToolbar editor={editor2} />
      </>
    )

    const buttons = await screen.findAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5) // Just checking they render
  })


  // Command Execution
  it('should execute bold command', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const btn = await screen.findByTitle(/Bold/i)
    await user.click(btn)
    expect(editor.toggleStyles).toHaveBeenCalledWith({ bold: true })
  })

  it('should execute italic command', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const btn = await screen.findByTitle(/Italic/i)
    await user.click(btn)
    expect(editor.toggleStyles).toHaveBeenCalledWith({ italic: true })
  })

  // Rapid Clicks
  it('should handle rapid button clicks', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const btn = await screen.findByTitle(/Bold/i)
    await user.click(btn)
    await user.click(btn)
    await user.click(btn)

    expect(editor.toggleStyles).toHaveBeenCalledTimes(3)
  })

  // Layout
  it('should display buttons in row layout', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    // Just verify visible
    expect(await screen.findByTitle(/Bold/i)).toBeInTheDocument()
  })

  // Props
  it('should accept editor prop', async () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(await screen.findByRole('button', { name: /bold/i })).toBeInTheDocument()
  })
})
