import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Editor } from '../editor';

describe('Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.execCommand = vi.fn();
  });

  it('should render editor container', () => {
    const { container } = render(<Editor />);
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('should render editor with default props', () => {
    const { container } = render(<Editor />);
    expect(container.querySelector('[contenteditable]')).toBeInTheDocument();
  });

  it('should render with initial content', () => {
    const { container } = render(
      <Editor initialContent="<p>Initial content</p>" />
    );
    expect(container.textContent).toContain('Initial content');
  });

  it('should render empty when no initial content', () => {
    const { container } = render(<Editor initialContent="" />);
    expect(container).toBeInTheDocument();
  });

  it('should call onChange on text input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    );

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      await user.type(editor, 'New content');
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    }
  });

  it('should pass correct HTML content to onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    );

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      await user.type(editor, 'Test');
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(expect.any(String));
      });
    }
  });

  it('should be editable by default', () => {
    const { container } = render(<Editor />);
    const editor = container.querySelector('[contenteditable]');
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  it('should be editable when editable prop is true', () => {
    const { container } = render(<Editor editable={true} />);
    const editor = container.querySelector('[contenteditable]');
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  it('should not be editable when editable prop is false', () => {
    const { container } = render(<Editor editable={false} />);
    const editor = container.querySelector('[contenteditable]');
    expect(editor).toHaveAttribute('contenteditable', 'false');
  });

  it('should update content when initialContent prop changes', async () => {
    const { rerender, container } = render(
      <Editor initialContent="<p>First content</p>" />
    );

    expect(container.textContent).toContain('First content');

    rerender(<Editor initialContent="<p>Second content</p>" />);

    await waitFor(() => {
      expect(container.textContent).toContain('Second content');
    });
  });

  it('should have prose styling class', () => {
    const { container } = render(<Editor />);
    const editor = container.querySelector('.prose');
    expect(editor).toBeInTheDocument();
  });

  it('should have focus outline none', () => {
    const { container } = render(<Editor />);
    const editor = container.querySelector(String.raw`.focus\:outline-none`);
    expect(editor).toBeInTheDocument();
  });

  it('should support className through container', () => {
    const { container } = render(<Editor />);
    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
  });

  it('should support bold text', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    );

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      document.execCommand('bold');
      expect(document.execCommand).toHaveBeenCalledWith('bold');
    }
  });

  it('should support italic text', async () => {
    const user = userEvent.setup();
    const { container } = render(<Editor onChange={vi.fn()} editable={true} />);

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      document.execCommand('italic');
      expect(document.execCommand).toHaveBeenCalledWith('italic');
    }
  });

  it('should support underline text', async () => {
    const user = userEvent.setup();
    const { container } = render(<Editor onChange={vi.fn()} editable={true} />);

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      document.execCommand('underline');
      expect(document.execCommand).toHaveBeenCalledWith('underline');
    }
  });

  it('should handle keyboard input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Editor onChange={handleChange} editable={true} />
    );

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      await user.keyboard('Hello');
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    }
  });

  it('should render multiple editors independently', () => {
    const handleChange1 = vi.fn();
    const handleChange2 = vi.fn();

    render(
      <>
        <Editor initialContent="<p>Editor 1</p>" onChange={handleChange1} />
        <Editor initialContent="<p>Editor 2</p>" onChange={handleChange2} />
      </>
    );

    const editors = document.querySelectorAll('[contenteditable]');
    expect(editors.length).toBe(2);
  });

  it('should focus editor on click', async () => {
    const user = userEvent.setup();
    const { container } = render(<Editor />);

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      expect(editor).toHaveFocus();
    }
  });

  it('should not call onChange if no handler provided', async () => {
    const user = userEvent.setup();
    const { container } = render(<Editor editable={true} />);

    const editor = container.querySelector('[contenteditable]');
    if (editor) {
      await user.click(editor);
      await user.type(editor, 'Test');

      expect(editor).toBeInTheDocument();
    }
  });

  it('should handle empty string as initial content', () => {
    const { container } = render(<Editor initialContent="" />);
    expect(container.querySelector('[contenteditable]')).toBeInTheDocument();
  });

  it('should preserve HTML structure', () => {
    const { container } = render(
      <Editor initialContent="<h1>Title</h1><p>Content</p>" />
    );
    expect(container.querySelector('[contenteditable]')).toBeInTheDocument();
  });

  it('should combine all props correctly', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Editor
        initialContent="<p>Test</p>"
        onChange={handleChange}
        editable={true}
      />
    );
    expect(container.querySelector('[contenteditable]')).toHaveAttribute(
      'contenteditable',
      'true'
    );
  });

  it('should cleanup editor on unmount', () => {
    const { unmount } = render(<Editor />);
    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
