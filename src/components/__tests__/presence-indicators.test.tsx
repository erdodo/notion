import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PresenceIndicators } from '@/components/presence-indicators';

const mockActiveUsers: any[] = [];

vi.mock('@/components/providers/collaboration-provider', () => ({
  useCollaboration: () => ({ activeUsers: mockActiveUsers }),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarImage: () => <img />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

describe('PresenceIndicators', () => {
  beforeEach(() => {
    mockActiveUsers.length = 0;
  });

  it('renders avatars for active users', () => {
    mockActiveUsers.push(
      { name: 'User 1', color: 'red' },
      { name: 'User 2', color: 'blue' }
    );

    render(<PresenceIndicators />);
    expect(screen.getAllByText('U')[0]).toBeInTheDocument();
  });

  it('shows overflow count if more than 3 users', () => {
    mockActiveUsers.push(
      { name: 'U1', color: 'red' },
      { name: 'U2', color: 'red' },
      { name: 'U3', color: 'red' },
      { name: 'U4', color: 'red' }
    );

    render(<PresenceIndicators />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
