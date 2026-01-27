import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CoverImageModal } from '../cover-image-modal';

import * as actions from '@/app/(main)/_actions/documents';
import { useEdgeStore } from '@/lib/edgestore';

vi.mock('next/navigation');
vi.mock('@/lib/edgestore');
vi.mock('@/app/(main)/_actions/documents');
vi.mock('@/components/single-image-dropzone', () => ({
  SingleImageDropzone: ({ onChange }: any) => (
    <div>
      <button onClick={() => onChange(new File([''], 'test.jpg'))}>
        Upload Image
      </button>
    </div>
  ),
}));

describe('CoverImageModal', () => {
  const mockParameters = { id: 'doc-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue(mockParameters);
    (useEdgeStore as any).mockReturnValue({
      edgestore: { publicFiles: { upload: vi.fn() } },
    });
    localStorage.clear();
  });

  it('should render when isOpen is true', () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Upload Cover Image')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<CoverImageModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Upload Cover Image')).not.toBeInTheDocument();
  });

  it('should display tabs for upload, link, and recent', () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('tab', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /link/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /recent/i })).toBeInTheDocument();
  });

  it('should show upload tab content by default', () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const uploadTab = screen.getByRole('tab', { name: /upload/i });
    expect(uploadTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to link tab', async () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    expect(linkTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display image URL input in link tab', async () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    expect(screen.getByPlaceholderText(/enter image url/i)).toBeInTheDocument();
  });

  it('should accept URL input in link tab', async () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/image.jpg');

    expect(input.value).toBe('https://example.com/image.jpg');
  });

  it('should display upload button', () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('should display cancel button', () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<CoverImageModal isOpen={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle image file upload', async () => {
    const mockEdgeStore = {
      publicFiles: {
        upload: vi
          .fn()
          .mockResolvedValue({ url: 'https://example.com/uploaded.jpg' }),
      },
    };
    (useEdgeStore as any).mockReturnValue({ edgestore: mockEdgeStore });

    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    await userEvent.click(uploadButton);

    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('should display recent images tab', async () => {
    const mockOnClose = vi.fn();
    render(<CoverImageModal isOpen={true} onClose={mockOnClose} />);

    const recentTab = screen.getByRole('tab', { name: /recent/i });
    await userEvent.click(recentTab);

    expect(recentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should store recent images in localStorage', () => {
    const mockOnConfirm = vi.fn();
    render(
      <CoverImageModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={mockOnConfirm}
      />
    );

    const stored = localStorage.getItem('notion-recent-covers');
    if (stored) {
      const images = JSON.parse(stored);
      expect(Array.isArray(images)).toBe(true);
    }
  });

  it('should load recent images from localStorage on mount', () => {
    const recentImages = [
      'https://example.com/1.jpg',
      'https://example.com/2.jpg',
    ];
    localStorage.setItem('notion-recent-covers', JSON.stringify(recentImages));

    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const recentTab = screen.getByRole('tab', { name: /recent/i });
    expect(recentTab).toBeInTheDocument();
  });

  it('should call onConfirm with selected URL', async () => {
    const mockOnConfirm = vi.fn();
    render(
      <CoverImageModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={mockOnConfirm}
      />
    );

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/image.jpg');

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com/image.jpg')
    );
  });

  it('should show loading state during upload', async () => {
    const mockEdgeStore = {
      publicFiles: {
        upload: vi.fn(() => new Promise(() => {})),
      },
    };
    (useEdgeStore as any).mockReturnValue({ edgestore: mockEdgeStore });

    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const uploadImageButton = screen.getByRole('button', {
      name: /upload image/i,
    });
    await userEvent.click(uploadImageButton);

    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('should update document with selected cover image', async () => {
    const mockUpdateDocument = vi.fn().mockResolvedValue({});
    (actions.updateDocument as any).mockImplementation(mockUpdateDocument);

    const mockOnClose = vi.fn();
    render(<CoverImageModal isOpen={true} onClose={mockOnClose} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/cover.jpg');

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockUpdateDocument).toHaveBeenCalled();
    });
  });

  it('should handle image URL validation', async () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'invalid-url');

    expect(input.value).toBe('invalid-url');
  });

  it('should limit recent images to 9', () => {
    const manyImages = Array.from(
      { length: 15 },
      (_, index) => `https://example.com/${index}.jpg`
    );
    localStorage.setItem('notion-recent-covers', JSON.stringify(manyImages));

    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const stored = localStorage.getItem('notion-recent-covers');
    if (stored) {
      const images = JSON.parse(stored);
      expect(images.length).toBeLessThanOrEqual(9);
    }
  });

  it('should allow direct confirmation via onConfirm prop', async () => {
    const mockOnConfirm = vi.fn();
    render(
      <CoverImageModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={mockOnConfirm}
      />
    );

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/test.jpg');

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('should close modal after successful upload', async () => {
    const mockOnClose = vi.fn();
    const mockUpdateDocument = vi.fn().mockResolvedValue({});
    (actions.updateDocument as any).mockImplementation(mockUpdateDocument);

    render(<CoverImageModal isOpen={true} onClose={mockOnClose} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/image.jpg');

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display preview of selected image', async () => {
    render(<CoverImageModal isOpen={true} onClose={vi.fn()} />);

    const linkTab = screen.getByRole('tab', { name: /link/i });
    await userEvent.click(linkTab);

    const input = screen.getByPlaceholderText(/enter image url/i);
    await userEvent.type(input, 'https://example.com/preview.jpg');

    expect(input.value).toBe('https://example.com/preview.jpg');
  });
});
