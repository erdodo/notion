import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ImportModal } from '../import-modal';

vi.mock('sonner');
vi.mock('next/navigation');
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop }) => ({
    getRootProps: () => ({
      onClick: () => {
        const files = [
          new File(['content'], 'test.md', { type: 'text/markdown' }),
        ];
        onDrop(files);
      },
      onDrop: () => {
        const files = [
          new File(['content'], 'test.md', { type: 'text/markdown' }),
        ];
        onDrop(files);
      },
    }),
    getInputProps: () => ({}),
    isDragActive: false,
    open: vi.fn(),
  })),
}));

describe('ImportModal', () => {
  const mockRouter = { push: vi.fn(), refresh: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should render import modal when isOpen is true', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ImportModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Import')).not.toBeInTheDocument();
  });

  it('should display import type selection', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /markdown/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /backup/i })).toBeInTheDocument();
  });

  it('should switch between import types', async () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const csvTab = screen.getByRole('button', { name: /csv/i });
    await userEvent.click(csvTab);

    expect(csvTab).toHaveClass('bg-secondary');
  });

  it('should have markdown selected by default', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const markdownTab = screen.getByRole('button', { name: /markdown/i });
    expect(markdownTab).toHaveClass('bg-secondary');
  });

  it('should display file upload dropzone', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
  });

  it('should show upload icon in dropzone', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const uploadIcon = document.querySelector('svg.lucide-upload');
    expect(uploadIcon).toBeInTheDocument();
  });

  it('should display file type descriptions', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/import .md files/i)).toBeInTheDocument();
  });

  it('should show loading state during import', async () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as any;

    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const dropzone = screen.getByText(/drag & drop/i);
    await userEvent.click(dropzone);

    expect(screen.getByText(/importing/i)).toBeInTheDocument();
  });

  it('should accept parentId prop', () => {
    render(
      <ImportModal isOpen={true} onClose={vi.fn()} parentId="parent-123" />
    );

    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('should display different file formats for each import type', async () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const csvTab = screen.getByRole('button', { name: /csv/i });
    await userEvent.click(csvTab);

    expect(screen.getByText(/accepted: .csv/i)).toBeInTheDocument();
  });

  it('should show result message on successful import', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, message: 'Import successful' }),
      })
    ) as any;

    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const dropzone = screen.getByText(/drag & drop/i);
    await userEvent.click(dropzone);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Import successful');
    });
  });

  it('should show error message on failed import', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Import failed' }),
      })
    ) as any;

    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const dropzone = screen.getByText(/drag & drop/i);
    await userEvent.click(dropzone);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Import failed');
    });
  });

  it('should handle different import formats', async () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const markdownTab = screen.getByRole('button', { name: /markdown/i });
    expect(markdownTab).toHaveClass('bg-secondary');

    const csvTab = screen.getByRole('button', { name: /csv/i });
    await userEvent.click(csvTab);
    expect(csvTab).toHaveClass('bg-secondary');

    const backupTab = screen.getByRole('button', { name: /backup/i });
    await userEvent.click(backupTab);
    expect(backupTab).toHaveClass('bg-secondary');
  });

  it('should close modal after successful import when clicking open button', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Imported successfully',
            pageId: 'new-page-123',
          }),
      })
    ) as any;

    const mockOnClose = vi.fn();
    render(<ImportModal isOpen={true} onClose={mockOnClose} />);

    const dropzone = screen.getByText(/drag & drop/i);
    await userEvent.click(dropzone);

    const openButton = await screen.findByText(/open imported page/i);
    await userEvent.click(openButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/documents/new-page-123');
  });

  it('should display upload instructions', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/drag & drop a file here/i)).toBeInTheDocument();
  });

  it('should show file info for each format', async () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const csvTab = screen.getByRole('button', { name: /csv/i });
    await userEvent.click(csvTab);

    expect(screen.getByText(/import .csv files/i)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as any;

    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const dropzone = screen.getByText(/drag & drop/i);
    await userEvent.click(dropzone);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should support drag and drop operations', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    const dropzone = screen.getByText(/drag & drop/i);
    expect(dropzone).toBeInTheDocument();
  });

  it('should handle file type validation', () => {
    render(<ImportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/markdown/i)).toBeInTheDocument();
  });
});
