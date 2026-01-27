import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  restoreDocument,
  removeDocument,
} from '@/app/(main)/_actions/documents';
import { Banner } from '@/components/banner';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

vi.mock('@/app/(main)/_actions/documents', () => ({
  restoreDocument: vi.fn(),
  removeDocument: vi.fn(),
}));

vi.mock('@/components/modals/confirm-modal', () => ({
  ConfirmModal: ({
    children,
    onConfirm,
  }: {
    children: React.ReactNode;
    onConfirm: () => void;
  }) => <div onClick={onConfirm}>{children}</div>,
}));

describe('Banner', () => {
  const documentId = 'doc-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct text', () => {
    render(<Banner documentId={documentId} />);
    expect(screen.getByText('This page is in the Trash.')).toBeInTheDocument();
    expect(screen.getByText('Restore page')).toBeInTheDocument();
    expect(screen.getByText('Delete forever')).toBeInTheDocument();
  });

  it('calls restoreDocument on restore click', async () => {
    (restoreDocument as any).mockResolvedValue(true);
    render(<Banner documentId={documentId} />);

    const restoreButton = screen.getByText('Restore page');
    await act(async () => {
      fireEvent.click(restoreButton);
    });

    expect(restoreDocument).toHaveBeenCalledWith(documentId);
  });

  it('calls removeDocument and redirects on delete confirm', async () => {
    (removeDocument as any).mockResolvedValue(true);
    render(<Banner documentId={documentId} />);

    const deleteButton = screen.getByText('Delete forever');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(removeDocument).toHaveBeenCalledWith(documentId);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/documents');
    });
  });
});
