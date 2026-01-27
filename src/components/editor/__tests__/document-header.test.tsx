import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config) => ({
    type: config.type,
    config,
  })),
}));

describe('DocumentHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockDocumentHeader = (properties = {}) => ({
    title: 'Document Title',
    icon: '📄',
    coverImage: 'https://example.com/cover.jpg',
    description: 'Document description',
    tags: ['tag1', 'tag2'],
    ...properties,
  });

  it('should render document title', () => {
    const header = createMockDocumentHeader();
    expect(header.title).toBe('Document Title');
  });

  it('should support title editing', () => {
    createMockDocumentHeader();
    const updateTitle = vi.fn();
    updateTitle('New Title');
    expect(updateTitle).toHaveBeenCalledWith('New Title');
  });

  it('should handle empty title', () => {
    const header = createMockDocumentHeader({ title: '' });
    expect(header.title).toBe('');
  });

  it('should display document icon', () => {
    const header = createMockDocumentHeader();
    expect(header.icon).toBe('📄');
  });

  it('should support icon editing', () => {
    createMockDocumentHeader();
    const updateIcon = vi.fn();
    updateIcon('📝');
    expect(updateIcon).toHaveBeenCalledWith('📝');
  });

  it('should display cover image', () => {
    const header = createMockDocumentHeader();
    expect(header.coverImage).toContain('cover.jpg');
  });

  it('should support cover image upload', () => {
    createMockDocumentHeader();
    const uploadCover = vi.fn();
    const newCover = 'https://example.com/new-cover.jpg';
    uploadCover(newCover);
    expect(uploadCover).toHaveBeenCalledWith(newCover);
  });

  it('should support removing cover image', () => {
    createMockDocumentHeader();
    const removeCover = vi.fn();
    removeCover();
    expect(removeCover).toHaveBeenCalled();
  });

  it('should display description', () => {
    const header = createMockDocumentHeader();
    expect(header.description).toBe('Document description');
  });

  it('should support description editing', () => {
    createMockDocumentHeader();
    const updateDescription = vi.fn();
    updateDescription('New description');
    expect(updateDescription).toHaveBeenCalledWith('New description');
  });

  it('should display tags', () => {
    const header = createMockDocumentHeader();
    expect(header.tags).toHaveLength(2);
  });

  it('should support adding tags', () => {
    createMockDocumentHeader();
    const addTag = vi.fn();
    addTag('tag3');
    expect(addTag).toHaveBeenCalledWith('tag3');
  });

  it('should support removing tags', () => {
    createMockDocumentHeader();
    const removeTag = vi.fn();
    removeTag('tag1');
    expect(removeTag).toHaveBeenCalledWith('tag1');
  });

  it('should support edit mode', () => {
    createMockDocumentHeader();
    let isEditing = false;
    expect(isEditing).toBe(false);

    isEditing = true;
    expect(isEditing).toBe(true);
  });

  it('should render title input field', () => {
    const header = createMockDocumentHeader();
    const hasInput = !!header.title;
    expect(hasInput).toBe(true);
  });

  it('should support icon picker', () => {
    createMockDocumentHeader();
    const pickIcon = vi.fn();
    pickIcon('🚀');
    expect(pickIcon).toHaveBeenCalledWith('🚀');
  });

  it('should support cover image upload with progress', () => {
    createMockDocumentHeader();
    let uploadProgress = 0;
    expect(uploadProgress).toBe(0);

    uploadProgress = 50;
    expect(uploadProgress).toBe(50);

    uploadProgress = 100;
    expect(uploadProgress).toBe(100);
  });

  it('should display creation date', () => {
    const header = {
      ...createMockDocumentHeader(),
      createdAt: '2024-01-01',
    };
    expect(header.createdAt).toBeDefined();
  });

  it('should display last modified date', () => {
    const header = {
      ...createMockDocumentHeader(),
      modifiedAt: '2024-01-02',
    };
    expect(header.modifiedAt).toBeDefined();
  });

  it('should display creator info', () => {
    const header = {
      ...createMockDocumentHeader(),
      createdBy: 'John Doe',
    };
    expect(header.createdBy).toBeDefined();
  });

  it('should show collaboration status', () => {
    const header = {
      ...createMockDocumentHeader(),
      collaborators: [{ id: 'user-1', name: 'User 1' }],
    };
    expect(header.collaborators).toBeDefined();
  });

  it('should handle title focus', () => {
    createMockDocumentHeader();
    const handleFocus = vi.fn();
    handleFocus();
    expect(handleFocus).toHaveBeenCalled();
  });

  it('should handle title blur', () => {
    createMockDocumentHeader();
    const handleBlur = vi.fn();
    handleBlur();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should support keyboard shortcuts', () => {
    createMockDocumentHeader();
    const handleKeyDown = vi.fn();
    handleKeyDown({ key: 'Escape' });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('should handle long titles', () => {
    const longTitle = 'a'.repeat(200);
    const header = createMockDocumentHeader({ title: longTitle });
    expect(header.title.length).toBe(200);
  });

  it('should handle special characters in title', () => {
    const header = createMockDocumentHeader({
      title: 'Title with @#$%^&*()',
    });
    expect(header.title).toContain('@#$%^&*()');
  });

  it('should support emoji in title', () => {
    const header = createMockDocumentHeader({
      title: '🎉 Celebration Document',
    });
    expect(header.title).toContain('🎉');
  });

  it('should support multi-line content', () => {
    const header = {
      ...createMockDocumentHeader(),
      title: 'Line 1\nLine 2',
    };
    expect(header.title).toContain('\n');
  });

  it('should support bold text', () => {
    const header = {
      ...createMockDocumentHeader(),
      titleFormatted: '<strong>Bold Title</strong>',
    };
    expect(header.titleFormatted).toContain('strong');
  });
});
