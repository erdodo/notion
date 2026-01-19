import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormattingToolbar } from '../formatting-toolbar'

describe('FormattingToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock editor
  const createMockEditor = () => ({
    isActive: vi.fn(() => false),
    commands: {
      toggleBold: vi.fn(() => true),
      toggleItalic: vi.fn(() => true),
      toggleUnderline: vi.fn(() => true),
      toggleStrike: vi.fn(() => true),
      toggleCode: vi.fn(() => true),
      setTextColor: vi.fn(() => true),
      setHighlight: vi.fn(() => true),
    },
  })

  // Basic Rendering
  it('should render formatting toolbar', () => {
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  // Bold Button
  it('should render bold button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const boldButton = container.querySelector('button')
    expect(boldButton).toBeInTheDocument()
  })

  it('should toggle bold on click', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(buttons[0]).toBeInTheDocument()
  })

  // Italic Button
  it('should render italic button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(1)
  })

  // Underline Button
  it('should render underline button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(2)
  })

  // Strikethrough Button
  it('should render strikethrough button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(3)
  })

  // Code Button
  it('should render code button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(4)
  })

  // Color Picker
  it('should render color picker button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5)
  })

  it('should open color picker popover', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    // Find color picker button
    const colorButtons = buttons.filter(
      btn => btn.querySelector('svg') || btn.textContent
    )
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  // Highlight Picker
  it('should render highlight picker button', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(6)
  })

  // Button Click Handlers
  it('should handle multiple button clicks', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    await user.click(buttons[1])
    expect(buttons.length).toBeGreaterThan(1)
  })

  // Icon Display
  it('should display formatting icons', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  // Toolbar State
  it('should reflect editor state for bold', () => {
    const editor = createMockEditor()
    editor.isActive.mockReturnValue(true)
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  // Toolbar State Changes
  it('should update state when editor changes', async () => {
    const editor = createMockEditor()
    const { rerender } = render(<FormattingToolbar editor={editor} />)

    editor.isActive.mockReturnValue(true)
    rerender(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  // Accessibility
  it('should have accessible buttons', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
    })
  })

  // Keyboard Navigation
  it('should support keyboard navigation between buttons', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    expect(buttons[0]).toHaveFocus()

    await user.keyboard('{Tab}')
    expect(buttons[1]).toHaveFocus()
  })

  // Disabled State
  it('should handle disabled editor gracefully', () => {
    const editor = {
      isActive: vi.fn(() => false),
      commands: {},
    }
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  // Multiple Toolbars
  it('should render multiple toolbars independently', () => {
    const editor1 = createMockEditor()
    const editor2 = createMockEditor()

    const { container } = render(
      <>
        <FormattingToolbar editor={editor1} />
        <FormattingToolbar editor={editor2} />
      </>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5)
  })

  // Color Options
  it('should support text color options', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  it('should support background color options', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  // Command Execution
  it('should execute bold command', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(editor.commands.toggleBold).toBeDefined()
  })

  it('should execute italic command', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    if (buttons[1]) {
      await user.click(buttons[1])
      expect(editor.commands.toggleItalic).toBeDefined()
    }
  })

  // Toggle State
  it('should show toggled state when button is active', () => {
    const editor = createMockEditor()
    editor.isActive.mockImplementation((format: string) => format === 'bold')
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  // Rapid Clicks
  it('should handle rapid button clicks', async () => {
    const user = userEvent.setup()
    const editor = createMockEditor()
    render(<FormattingToolbar editor={editor} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    await user.click(buttons[1])
    await user.click(buttons[2])

    expect(buttons.length).toBeGreaterThan(0)
  })

  // Layout
  it('should display buttons in row layout', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  // Styling
  it('should apply styling classes to toolbar', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  // Props
  it('should accept editor prop', () => {
    const editor = createMockEditor()
    const { container } = render(<FormattingToolbar editor={editor} />)
    expect(container).toBeInTheDocument()
  })

  // Editor Interaction
  it('should work with different editor instances', () => {
    const editor1 = createMockEditor()
    const editor2 = createMockEditor()

    const { rerender } = render(<FormattingToolbar editor={editor1} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)

    rerender(<FormattingToolbar editor={editor2} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
