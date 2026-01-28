import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { restoreDocument } from '@/app/(main)/_actions/documents';
import { TrashBox } from '@/components/trash-box';

const mockRemoveDocument = vi.fn();
const mockSetTrashPages = vi.fn();

vi.mock('@/app/(main)/_actions/documents', () => ({
  restoreDocument: vi.fn(),
}));

vi.mock('@/store/use-documents-store', () => ({
  useDocumentsStore: () => ({
    trashPages: [
      { id: '1', title: 'Page 1', isArchived: true },
      { id: '2', title: 'Page 2', isArchived: true },
    ],
    setTrashPages: mockSetTrashPages,
    removeDocument: mockRemoveDocument,
  }),
}));

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/modals/confirm-modal', () => ({
  ConfirmModal: ({ children, onConfirm }: any) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onConfirm();
      }}
    >
      {children}
    </div>
  ),
}));

describe('TrashBox', () => {
  const documents = [
    { id: '1', title: 'Page 1', isArchived: true },
    { id: '2', title: 'Page 2', isArchived: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document list', () => {
    render(<TrashBox documents={documents} />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  it('filters documents', async () => {
    render(<TrashBox documents={documents} />);
    const input = screen.getByPlaceholderText('Filter by page title...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Page 1' } });
    });

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.queryByText('Page 2')).not.toBeInTheDocument();
  });

  it('restores document', async () => {
    (restoreDocument as any).mockResolvedValue(true);
    render(<TrashBox documents={documents} />);

    const page1Text = screen.getByText('Page 1');
    const row = page1Text.closest('.flex.justify-between');
    const restoreButton = row?.querySelector('button');

    await act(async () => {
      fireEvent.click(restoreButton!);
    });

    expect(restoreDocument).toHaveBeenCalledWith('1');
  });

  it('removes document permanently', async () => {
    mockRemoveDocument.mockResolvedValue(true);
    
    render(<TrashBox documents={documents} />);

    const page1Text = screen.getByText('Page 1');
    const row = page1Text.closest('.text-sm.rounded-sm');
    const buttons = row?.querySelectorAll('button');
    const deleteButton = buttons![1];

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockRemoveDocument).toHaveBeenCalledWith('1');
  });
});
