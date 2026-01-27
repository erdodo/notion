import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ConfirmModal } from '../confirm-modal';

describe('ConfirmModal', () => {
  it('should render trigger button with children', () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    expect(
      screen.getByRole('button', { name: /delete item/i })
    ).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    const triggerButton = screen.getByRole('button', { name: /delete item/i });
    await userEvent.click(triggerButton);

    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument();
  });

  it('should show confirm and cancel buttons in dialog', async () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm/i })
    ).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));
    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    await userEvent.click(confirmButton);

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('should close dialog when cancel button is clicked', async () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));
    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(
        screen.queryByText('Are you absolutely sure?')
      ).not.toBeInTheDocument();
    });

    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should prevent event propagation on trigger click', async () => {
    const mockConfirm = vi.fn();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <ConfirmModal onConfirm={mockConfirm}>
          <button>Delete Item</button>
        </ConfirmModal>
      </div>
    );

    const triggerButton = screen.getByRole('button', { name: /delete item/i });
    await userEvent.click(triggerButton);

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('should prevent event propagation on cancel click', async () => {
    const mockConfirm = vi.fn();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <ConfirmModal onConfirm={mockConfirm}>
          <button>Delete Item</button>
        </ConfirmModal>
      </div>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('should prevent event propagation on confirm click', async () => {
    const mockConfirm = vi.fn();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <ConfirmModal onConfirm={mockConfirm}>
          <button>Delete Item</button>
        </ConfirmModal>
      </div>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('should work with multiple confirm modals', async () => {
    const mockConfirm1 = vi.fn();
    const mockConfirm2 = vi.fn();

    render(
      <>
        <ConfirmModal onConfirm={mockConfirm1}>
          <button>Delete Item 1</button>
        </ConfirmModal>
        <ConfirmModal onConfirm={mockConfirm2}>
          <button>Delete Item 2</button>
        </ConfirmModal>
      </>
    );

    await userEvent.click(
      screen.getByRole('button', { name: /delete item 1/i })
    );
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockConfirm1).toHaveBeenCalledTimes(1);
    expect(mockConfirm2).not.toHaveBeenCalled();
  });

  it('should close dialog after confirm action', async () => {
    const mockConfirm = vi.fn();
    render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete Item</button>
      </ConfirmModal>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete item/i }));
    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(
        screen.queryByText('Are you absolutely sure?')
      ).not.toBeInTheDocument();
    });
  });

  it('should render with different trigger content types', () => {
    const mockConfirm = vi.fn();
    const { rerender } = render(
      <ConfirmModal onConfirm={mockConfirm}>
        <button>Delete</button>
      </ConfirmModal>
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    rerender(
      <ConfirmModal onConfirm={mockConfirm}>
        <div>Click me</div>
      </ConfirmModal>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
