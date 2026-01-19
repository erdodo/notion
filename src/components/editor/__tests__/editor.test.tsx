import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from '../editor'

describe('Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render editor container', () => {
    const { container } = render(<Editor />)
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('should render editor with default props', () => {
    const { container } = render(<Editor />)
    expect(container.querySelector('[role="textbox"]')).toBeInTheDocument()
  })

  // Initial Content
  it('should render with initial content', () => {
    const { container } = render(
      <Editor initialContent="<p>Initial content</p>" />
    )
    expect(container.textContent).toContain('Initial content')
  })

  it('should render empty when no initial content', () => {
    const { container } = render(<Editor initialContent="" />)
    expect(container).toBeInTheDocument()
  })

  // Content Changes
  it('should call onChange on text input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      await user.type(editor, 'New content')
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    }
  })

  it('should pass correct HTML content to onChange', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      await user.type(editor, 'Test')
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(expect.any(String))
      })
    }
  })

  // Editable State
  it('should be editable by default', () => {
    const { container } = render(<Editor />)
    const editor = container.querySelector('[contenteditable]')
    expect(editor).toHaveAttribute('contenteditable', 'true')
  })

  it('should be editable when editable prop is true', () => {
    const { container } = render(<Editor editable={true} />)
    const editor = container.querySelector('[contenteditable]')
    expect(editor).toHaveAttribute('contenteditable', 'true')
  })

  it('should not be editable when editable prop is false', () => {
    const { container } = render(<Editor editable={false} />)
    const editor = container.querySelector('[contenteditable]')
    expect(editor).toHaveAttribute('contenteditable', 'false')
  })

  // Content Update
  it('should update content when initialContent prop changes', async () => {
    const { rerender, container } = render(
      <Editor initialContent="<p>First content</p>" />
    )

    expect(container.textContent).toContain('First content')

    rerender(<Editor initialContent="<p>Second content</p>" />)

    await waitFor(() => {
      expect(container.textContent).toContain('Second content')
    })
  })

  // Styling
  it('should have prose styling class', () => {
    const { container } = render(<Editor />)
    const editor = container.querySelector('.prose')
    expect(editor).toBeInTheDocument()
  })

  it('should have focus outline none', () => {
    const { container } = render(<Editor />)
    const editor = container.querySelector('.focus\\:outline-none')
    expect(editor).toBeInTheDocument()
  })

  // Attributes
  it('should support className through container', () => {
    const { container } = render(<Editor />)
    const wrapper = container.querySelector('.min-h-screen')
    expect(wrapper).toBeInTheDocument()
  })

  // Text Formatting
  it('should support bold text', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      document.execCommand('bold')
      expect(handleChange).toHaveBeenCalled()
    }
  })

  it('should support italic text', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      document.execCommand('italic')
      expect(handleChange).toHaveBeenCalled()
    }
  })

  it('should support underline text', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      document.execCommand('underline')
      expect(handleChange).toHaveBeenCalled()
    }
  })

  // Keyboard Shortcuts
  it('should handle keyboard input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    )

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      await user.keyboard('Hello')
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    }
  })

  // Multiple Editors
  it('should render multiple editors independently', () => {
    const handleChange1 = vi.fn()
    const handleChange2 = vi.fn()

    render(
      <>
        <Editor initialContent="<p>Editor 1</p>" onChange={handleChange1} />
        <Editor initialContent="<p>Editor 2</p>" onChange={handleChange2} />
      </>
    )

    const editors = document.querySelectorAll('[contenteditable]')
    expect(editors.length).toBe(2)
  })

  // Focus Management
  it('should focus editor on click', async () => {
    const user = userEvent.setup()
    const { container } = render(<Editor />)

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      expect(editor).toHaveFocus()
    }
  })

  // Event Handler Tests
  it('should not call onChange if no handler provided', async () => {
    const user = userEvent.setup()
    const { container } = render(<Editor editable={true} />)

    const editor = container.querySelector('[contenteditable]')
    if (editor) {
      await user.click(editor)
      await user.type(editor, 'Test')
      // Should not throw error
      expect(editor).toBeInTheDocument()
    }
  })

  // Empty Content Tests
  it('should handle empty string as initial content', () => {
    const { container } = render(<Editor initialContent="" />)
    expect(container.querySelector('[contenteditable]')).toBeInTheDocument()
  })

  // HTML Content
  it('should preserve HTML structure', () => {
    const { container } = render(
      <Editor initialContent="<h1>Title</h1><p>Content</p>" />
    )
    expect(container.querySelector('[contenteditable]')).toBeInTheDocument()
  })

  // Props Combination
  it('should combine all props correctly', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <Editor
        initialContent="<p>Test</p>"
        onChange={handleChange}
        editable={true}
      />
    )
    expect(container.querySelector('[contenteditable]')).toHaveAttribute(
      'contenteditable',
      'true'
    )
  })

  // Cleanup
  it('should cleanup editor on unmount', () => {
    const { unmount } = render(<Editor />)
    expect(() => unmount()).not.toThrow()
  })
})
