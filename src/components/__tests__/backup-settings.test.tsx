import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { BackupSettings } from '@/components/backup-settings';

globalThis.fetch = vi.fn();
globalThis.URL.createObjectURL = vi.fn(() => 'blob:url');
globalThis.URL.revokeObjectURL = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span>Select Value</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/modals/import-modal', () => ({
  ImportModal: () => <div>ImportModal Mock</div>,
}));

describe('BackupSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders export options', () => {
    render(<BackupSettings />);
    expect(screen.getByText('Workspace Backup')).toBeInTheDocument();
    expect(screen.getByText('Export Backup')).toBeInTheDocument();
  });

  it('triggers backup download on click', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['zip content'])),
    });

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi
      .spyOn(document, 'createElement')
      .mockImplementation(
        (tagName: string, options?: ElementCreationOptions) => {
          if (tagName === 'a') {
            const a = originalCreateElement('a');
            a.click = clickSpy;
            return a;
          }
          return originalCreateElement(tagName, options);
        }
      ) as any;

    render(<BackupSettings />);

    const exportButton = screen.getByText('Export Backup');
    await act(async () => {
      fireEvent.click(exportButton);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/export/backup?format=markdown')
    );

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it('handles export error', async () => {
    (globalThis.fetch as any).mockResolvedValue({ ok: false });

    render(<BackupSettings />);
    const exportButton = screen.getByText('Export Backup');
    await act(async () => {
      fireEvent.click(exportButton);
    });

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Backup failed');
    });
  });
});
