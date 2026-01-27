import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ModeToggle } from '@/components/mode-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe('ModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme options', () => {
    render(<ModeToggle />);
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme on option click (Light)', () => {
    render(<ModeToggle />);
    const lightButton = screen.getByText('Light');

    act(() => {
      fireEvent.click(lightButton);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme on option click (Dark)', () => {
    render(<ModeToggle />);
    const darkButton = screen.getByText('Dark');

    act(() => {
      fireEvent.click(darkButton);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
