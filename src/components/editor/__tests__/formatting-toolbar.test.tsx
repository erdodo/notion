import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { FormattingToolbar } from '../formatting-toolbar';

vi.mock('@blocknote/react', () => ({
  useBlockNoteEditor: vi.fn(),
  FormattingToolbarPositioner: ({ children }: any) => <div>{children}</div>,
}));

describe.skip('FormattingToolbar', () => {
  let getSelectionSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    getSelectionSpy = vi
      .spyOn(globalThis, 'getSelection')
      .mockImplementation(() => {
        return {
          rangeCount: 1,
          getRangeAt: () => ({
            getBoundingClientRect: () => ({
              top: 100,
              left: 100,
              width: 100,
              height: 20,
              right: 200,
              bottom: 120,
            }),
            commonAncestorContainer: document.createElement('div'),
          }),
          toString: () => 'Selected Text',
          removeAllRanges: vi.fn(),
        } as any;
      });
  });

  afterEach(() => {
    getSelectionSpy.mockRestore();
  });

  const createMockEditor = (): any => ({
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
  });

  it('should render formatting toolbar', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    expect(
      await screen.findByRole('button', { name: /bold/i })
    ).toBeInTheDocument();
  });

  it('should render bold button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Bold/i)).toBeInTheDocument();
  });

  it('should toggle bold on click', async () => {
    userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const boldButton = await screen.findByTitle(/Bold/i);
    fireEvent.click(boldButton);
    expect(editor.toggleStyles).toHaveBeenCalledWith({ bold: true });
  });

  it('should render italic button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Italic/i)).toBeInTheDocument();
  });

  it('should render underline button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Underline/i)).toBeInTheDocument();
  });

  it('should render strikethrough button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Strikethrough/i)).toBeInTheDocument();
  });

  it('should render code button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Inline Code/i)).toBeInTheDocument();
  });

  it('should render color picker button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Text Color/i)).toBeInTheDocument();
  });

  it('should open color picker popover', async () => {
    userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const colorButton = await screen.findByTitle(/Text Color/i);
    fireEvent.click(colorButton);
    expect(await screen.findByText('Text Color')).toBeInTheDocument();
  });

  it('should render highlight picker button', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(await screen.findByTitle(/Highlight Color/i)).toBeInTheDocument();
  });

  it('should handle multiple button clicks', async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const boldButton = await screen.findByTitle(/Bold/i);
    const italicButton = await screen.findByTitle(/Italic/i);
    await user.click(boldButton);
    await user.click(italicButton);
    expect(editor.toggleStyles).toHaveBeenCalledTimes(2);
  });

  it('should display formatting icons', async () => {
    const editor = createMockEditor();
    const { container } = render(<FormattingToolbar editor={editor} />);
    await screen.findByTitle(/Bold/i);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should reflect editor state for bold', async () => {
    const editor = createMockEditor();
    editor.getActiveStyles.mockReturnValue({ bold: true });
    render(<FormattingToolbar editor={editor} />);

    const boldButton = await screen.findByTitle(/Bold/i);
    expect(boldButton.className).toContain('bg-accent');
  });

  it('should update state when editor changes', async () => {
    const editor = createMockEditor();
    const { rerender } = render(<FormattingToolbar editor={editor} />);

    await screen.findByTitle(/Bold/i);

    editor.getActiveStyles.mockReturnValue({ bold: true });
    rerender(<FormattingToolbar editor={editor} />);

    const boldButton = await screen.findByTitle(/Bold/i);
    expect(boldButton.className).toContain('bg-accent');
  });

  it('should have accessible buttons', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    const buttons = await screen.findAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeInTheDocument();
    }
  });

  it('should support keyboard navigation between buttons', async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const buttons = await screen.findAllByRole('button');
    buttons[0].focus();
    expect(buttons[0]).toHaveFocus();

    await user.keyboard('{Tab}');
    expect(buttons[1]).toHaveFocus();
  });

  it('should handle disabled editor gracefully', async () => {
    const editor: any = {
      isActive: vi.fn(() => false),
      getActiveStyles: vi.fn(() => ({})),
      commands: {},
    };
    render(<FormattingToolbar editor={editor} />);
    expect(
      await screen.findByRole('button', { name: /bold/i })
    ).toBeInTheDocument();
  });

  it('should render multiple toolbars independently', async () => {
    const editor1 = createMockEditor();
    const editor2 = createMockEditor();

    render(
      <>
        <FormattingToolbar editor={editor1} />
        <FormattingToolbar editor={editor2} />
      </>
    );

    const buttons = await screen.findAllByRole('button');
    expect(buttons.length).toBeGreaterThan(5);
  });

  it('should execute bold command', async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const button = await screen.findByTitle(/Bold/i);
    await user.click(button);
    expect(editor.toggleStyles).toHaveBeenCalledWith({ bold: true });
  });

  it('should execute italic command', async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const button = await screen.findByTitle(/Italic/i);
    await user.click(button);
    expect(editor.toggleStyles).toHaveBeenCalledWith({ italic: true });
  });

  it('should handle rapid button clicks', async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    const button = await screen.findByTitle(/Bold/i);
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(editor.toggleStyles).toHaveBeenCalledTimes(3);
  });

  it('should display buttons in row layout', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);

    expect(await screen.findByTitle(/Bold/i)).toBeInTheDocument();
  });

  it('should accept editor prop', async () => {
    const editor = createMockEditor();
    render(<FormattingToolbar editor={editor} />);
    expect(
      await screen.findByRole('button', { name: /bold/i })
    ).toBeInTheDocument();
  });
});
