import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { Cover } from '@/components/cover';

vi.mock('@/app/(main)/_actions/documents', () => ({
  updateDocument: vi.fn(),
}));

const mockDelete = vi.fn();
vi.mock('@/lib/edgestore', () => ({
  useEdgeStore: () => ({
    edgestore: {
      coverImages: {
        delete: mockDelete,
      },
    },
  }),
}));

vi.mock('@/hooks/use-context-menu', () => ({
  useContextMenu: () => ({
    onContextMenu: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (properties: any) => <img {...properties} alt={properties.alt} />,
}));

describe('Cover', () => {
  const pageId = 'page-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if no url', () => {
    const { container } = render(<Cover pageId={pageId} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders image if url provided', () => {
    render(<Cover pageId={pageId} url="http://example.com/cover.png" />);
    expect(screen.getByAltText('Cover')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByTitle('Remove cover')).toBeInTheDocument();
  });

  it('does not render buttons in preview mode', () => {
    render(
      <Cover pageId={pageId} url="http://example.com/cover.png" preview />
    );

    expect(screen.queryByText('Change')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remove cover')).not.toBeInTheDocument();
  });

  it('calls remove logic on click', async () => {
    render(
      <Cover pageId={pageId} url="https://files.edgestore.dev/my-image.png" />
    );

    const removeButton = screen.getByTitle('Remove cover');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(mockDelete).toHaveBeenCalledWith({
      url: 'https://files.edgestore.dev/my-image.png',
    });

    expect(updateDocument).toHaveBeenCalledWith(pageId, { 
      coverImage: '',
      coverImagePosition: 0.5 
    });
  });

  it('does not call edgestore delete for non-edgestore urls', async () => {
    render(<Cover pageId={pageId} url="http://external.com/image.png" />);

    const removeButton = screen.getByTitle('Remove cover');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(mockDelete).not.toHaveBeenCalled();
    expect(updateDocument).toHaveBeenCalledWith(pageId, { 
      coverImage: '',
      coverImagePosition: 0.5 
    });
  });
});
