import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { Toolbar } from '@/components/toolbar';

vi.mock('lucide-react', () => ({
  ImageIcon: () => <div data-testid="image-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  X: () => <div data-testid="x-icon" />,
  LayoutTemplate: () => <div data-testid="layout-template-icon" />,
}));

vi.mock('@/components/icon-picker', () => ({
  IconPicker: ({ children, onChange }: any) => (
    <div data-testid="icon-picker" onClick={() => onChange('😀')}>
      {children}
    </div>
  ),
}));

vi.mock('@/app/(main)/_actions/documents', () => ({
  updateDocument: vi.fn(),
}));

vi.mock('@/hooks/use-context-menu', () => ({
  useContextMenu: () => ({ onContextMenu: vi.fn() }),
}));

vi.mock('@/lib/edgestore', () => ({
  useEdgeStore: () => ({ edgestore: { coverImages: { upload: vi.fn() } } }),
}));

describe('Toolbar', () => {
  const mockPage = {
    id: '123',
    title: 'Test Page',
    isPublished: false,
  };

  it('renders "Add icon" and "Add cover" items', () => {
    render(<Toolbar page={mockPage} />);
    expect(screen.getByText('Add icon')).toBeInTheDocument();
    expect(screen.getByText('Add cover')).toBeInTheDocument();
  });

  it('renders icon when present', () => {
    const pageWithIcon = { ...mockPage, icon: '🚀' };
    render(<Toolbar page={pageWithIcon} />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });
});
