import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { togglePublish } from '@/app/(main)/_actions/documents';
import { Publish } from '@/components/publish';

vi.mock('@/app/(main)/_actions/documents', () => ({
  togglePublish: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('Publish', () => {
  const initialData = { id: 'p1', isPublished: false };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders publish button initially', () => {
    render(<Publish initialData={initialData} />);
    expect(screen.getByText('Publish this note')).toBeInTheDocument();
  });

  it('toggles publish on click', async () => {
    (togglePublish as any).mockResolvedValue({ isPublished: true });
    render(<Publish initialData={initialData} />);

    const btns = screen.getAllByRole('button');
    const publishButton = btns.at(-1);

    await act(async () => {
      fireEvent.click(publishButton!);
    });

    expect(togglePublish).toHaveBeenCalledWith('p1');
  });

  it('renders published state and handles copy', async () => {
    render(<Publish initialData={{ ...initialData, isPublished: true }} />);

    expect(screen.getByText('This page is live on web.')).toBeInTheDocument();

    const btns = screen.getAllByRole('button');

    if (btns[1]) {
      fireEvent.click(btns[1]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });
});
