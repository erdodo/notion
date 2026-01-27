import { useMutation } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RenameModal } from '../rename-modal';

import { useRenameModal } from '@/hooks/use-rename-modal';

vi.mock('@/hooks/use-rename-modal');
vi.mock('@tanstack/react-query');
vi.mock('sonner');
vi.mock('@/app/(main)/_actions/documents', () => ({
  updateDocument: vi.fn(),
}));

describe('RenameModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when modal is closed', () => {
    (useRenameModal as any).mockReturnValue({
      isOpen: false,
      onClose: mockOnClose,
      documentId: null,
      initialTitle: '',
    });
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<RenameModal />);

    expect(screen.queryByText('Rename Page')).not.toBeInTheDocument();
  });

  it('should render dialog when modal is open', () => {
    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<RenameModal />);

    expect(screen.getByText('Rename Page')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a new name for this page.')
    ).toBeInTheDocument();
  });

  it('should display initial title in input field', () => {
    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'My Document',
    });
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('My Document');
    expect(input).toBeInTheDocument();
  });

  it('should update input value on typing', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Title');

    expect(input.value).toBe('New Title');
  });

  it('should call mutation on Save button click', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit on Enter key', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    await userEvent.type(input, '{Enter}');

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should disable buttons when mutation is pending', () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    const saveButton = screen.getByRole('button', { name: /save/i });

    expect(input).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('should update input when initialTitle changes', () => {
    const mockMutate = vi.fn();

    const { rerender } = render(<RenameModal />);

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    rerender(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    expect(input).toBeInTheDocument();
    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Updated Title',
    });

    rerender(<RenameModal />);

    const updatedInput = screen.getByDisplayValue('Updated Title');
    expect(updatedInput).toBeInTheDocument();
  });

  it('should autoFocus input when dialog opens', () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'My Document',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('My Document');
    expect(input).toHaveFocus();
  });

  it('should handle empty title with default value', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should prevent event propagation in dialog', async () => {
    const mockMutate = vi.fn();
    const mockParentClick = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const { container } = render(
      <div onClick={mockParentClick}>
        <RenameModal />
      </div>
    );

    const dialogContent = container.querySelector('[role="dialog"]');
    if (dialogContent) {
      await userEvent.click(dialogContent);
    }

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('should handle special characters in title', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Title with & < > " characters');

    expect(input.value).toBe('Title with & < > " characters');
  });

  it('should handle unicode characters in title', async () => {
    const mockMutate = vi.fn();

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: 'Old Title',
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue('Old Title');
    await userEvent.clear(input);
    await userEvent.type(input, '中文标题 العربية');

    expect(input.value).toBe('中文标题 العربية');
  });

  it('should handle very long titles', async () => {
    const mockMutate = vi.fn();
    const longTitle = 'A'.repeat(500);

    (useRenameModal as any).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
      documentId: 'doc-123',
      initialTitle: longTitle,
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RenameModal />);

    const input = screen.getByDisplayValue(longTitle);
    expect(input.value).toBe(longTitle);
  });
});
