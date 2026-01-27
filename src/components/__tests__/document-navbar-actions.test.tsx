import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getCommentCount } from '@/app/(main)/_actions/comments';
import { togglePublish } from '@/app/(main)/_actions/documents';
import { DocumentNavbarActions } from '@/components/document-navbar-actions';

vi.mock('@/app/(main)/_actions/documents', () => ({
  togglePublish: vi.fn(),
}));

vi.mock('@/app/(main)/_actions/comments', () => ({
  getCommentCount: vi.fn(),
}));

vi.mock('@/components/share-dialog', () => ({
  ShareDialog: ({ isOpen, onPublishChange }: any) =>
    isOpen ? (
      <div onClick={() => onPublishChange(true)}>Mock ShareDialog</div>
    ) : null,
}));

vi.mock('@/components/comments/comments-panel', () => ({
  CommentsPanel: ({ isOpen }: any) =>
    isOpen ? <div>Mock CommentsPanel</div> : null,
}));

vi.mock('@/components/presence-indicators', () => ({
  PresenceIndicators: () => <div>Mock Presence</div>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DocumentNavbarActions', () => {
  const pageId = 'page-1';

  beforeEach(() => {
    vi.clearAllMocks();
    (getCommentCount as any).mockResolvedValue(0);
  });

  it('renders buttons and indicators', async () => {
    render(
      <DocumentNavbarActions
        pageId={pageId}
        pageTitle="Test"
        isPublished={false}
      />
    );

    expect(screen.getByText('Mock Presence')).toBeInTheDocument();
  });

  it('opens comments panel on click', async () => {
    render(
      <DocumentNavbarActions
        pageId={pageId}
        pageTitle="Test"
        isPublished={false}
      />
    );

    const buttons = screen.getAllByRole('button');
    const commentsButton = buttons[1];

    await act(async () => {
      fireEvent.click(commentsButton);
    });

    expect(screen.getByText('Mock CommentsPanel')).toBeInTheDocument();
  });

  it('handlePublishChange updates state and calls action', async () => {
    (togglePublish as any).mockResolvedValue({ isPublished: true });

    render(
      <DocumentNavbarActions
        pageId={pageId}
        pageTitle="Test"
        isPublished={false}
      />
    );
    const buttons = screen.getAllByRole('button');
    const shareButton = buttons[0];

    await act(async () => {
      fireEvent.click(shareButton);
    });

    const mockDialog = screen.getByText('Mock ShareDialog');
    await act(async () => {
      fireEvent.click(mockDialog);
    });

    expect(togglePublish).toHaveBeenCalledWith(pageId);
  });
});
