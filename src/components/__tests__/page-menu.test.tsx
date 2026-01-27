import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PageMenu } from '@/components/page-menu';

vi.mock('@/app/(main)/_actions/documents', () => ({
  archiveDocument: vi.fn(),
  removeDocument: vi.fn(),
}));

const mockOnOpen = vi.fn();
vi.mock('@/hooks/use-history', () => ({
  useHistory: () => ({ onOpen: mockOnOpen }),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PageMenu', () => {
  const documentId = 'doc-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders options', () => {
    render(<PageMenu documentId={documentId} isArchived={false} />);
    expect(screen.getByText('Page History')).toBeInTheDocument();
  });

  it('opens history modal on click', () => {
    render(<PageMenu documentId={documentId} isArchived={false} />);
    const historyButton = screen.getByText('Page History');
    fireEvent.click(historyButton);
    expect(mockOnOpen).toHaveBeenCalledWith(documentId);
  });
});
