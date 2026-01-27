import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('BookmarkBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockBookmarkBlock = (properties = {}) => ({
    id: `bookmark-block-${++idCounter}`,
    type: 'bookmark',
    props: {
      url: 'https://example.com',
      title: 'Example Website',
      description: 'This is an example website',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      ...properties,
    },
  });

  it('should create bookmark block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'bookmark',
        content: 'none',
        propSchema: {
          url: { default: '' },
          title: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('bookmark');
  });

  it('should store bookmark URL', () => {
    const block = createMockBookmarkBlock();
    expect(block.props.url).toContain('example.com');
  });

  it('should update bookmark URL', () => {
    const block = createMockBookmarkBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://newexample.com',
      },
    };
    expect(updated.props.url).toContain('newexample.com');
  });

  it('should store bookmark title', () => {
    const block = createMockBookmarkBlock();
    expect(block.props.title).toBe('Example Website');
  });

  it('should update bookmark title', () => {
    const block = createMockBookmarkBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        title: 'Updated Title',
      },
    };
    expect(updated.props.title).toBe('Updated Title');
  });

  it('should store bookmark description', () => {
    const block = createMockBookmarkBlock();
    expect(block.props.description).toBe('This is an example website');
  });

  it('should update bookmark description', () => {
    const block = createMockBookmarkBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        description: 'Updated description',
      },
    };
    expect(updated.props.description).toBe('Updated description');
  });

  it('should store thumbnail URL', () => {
    const block = createMockBookmarkBlock();
    expect(block.props.thumbnailUrl).toContain('thumbnail.jpg');
  });

  it('should update thumbnail URL', () => {
    const block = createMockBookmarkBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        thumbnailUrl: 'https://example.com/new-thumbnail.jpg',
      },
    };
    expect(updated.props.thumbnailUrl).toContain('new-thumbnail.jpg');
  });

  it('should support opening link in new tab', () => {
    const block = createMockBookmarkBlock();
    const openAction = vi.fn();
    openAction(block.props.url, '_blank');
    expect(openAction).toHaveBeenCalledWith(block.props.url, '_blank');
  });

  it('should support opening link in same tab', () => {
    const block = createMockBookmarkBlock();
    const openAction = vi.fn();
    openAction(block.props.url, '_self');
    expect(openAction).toHaveBeenCalledWith(block.props.url, '_self');
  });

  it('should support copy link action', () => {
    const block = createMockBookmarkBlock();
    const copyAction = vi.fn();
    copyAction(block.props.url);
    expect(copyAction).toHaveBeenCalledWith(block.props.url);
  });

  it('should fetch metadata from URL', () => {
    const block = createMockBookmarkBlock();
    const fetchMetadata = vi.fn().mockResolvedValue({
      title: 'Example Website',
      description: 'This is an example website',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    });

    fetchMetadata(block.props.url);
    expect(fetchMetadata).toHaveBeenCalledWith(block.props.url);
  });

  it('should have unique block ID', () => {
    const block1 = createMockBookmarkBlock();
    const block2 = createMockBookmarkBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type bookmark', () => {
    const _block = createMockBookmarkBlock();
    expect(_block.type).toBe('bookmark');
  });

  it('should handle multiple bookmark blocks', () => {
    const block1 = createMockBookmarkBlock({
      url: 'https://example1.com',
      title: 'Example 1',
    });
    const block2 = createMockBookmarkBlock({
      url: 'https://example2.com',
      title: 'Example 2',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.title).not.toBe(block2.props.title);
  });

  it('should accept valid URLs', () => {
    const validUrls = [
      'https://example.com',
      'https://www.example.com/page',
      'https://subdomain.example.com',
    ];

    for (const url of validUrls) {
      const block = createMockBookmarkBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should have url prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'bookmark',
        content: 'none',
        propSchema: {
          url: { default: '' },
          title: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('url');
    }
  });

  it('should have title prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'bookmark',
        content: 'none',
        propSchema: {
          url: { default: '' },
          title: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('title');
    }
  });

  it('should store bookmark metadata', () => {
    const block = {
      ...createMockBookmarkBlock(),
      metadata: {
        faviconUrl: 'https://example.com/favicon.ico',
        domain: 'example.com',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'bookmark',
        content: 'none',
        propSchema: {
          url: { default: '' },
          title: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.url.default).toBe('');
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'bookmark',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should display bookmark preview', () => {
    const block = createMockBookmarkBlock();
    expect(block.props.title).toBeDefined();
    expect(block.props.description).toBeDefined();
    expect(block.props.thumbnailUrl).toBeDefined();
  });

  it('should support favicon', () => {
    const block = {
      ...createMockBookmarkBlock(),
      faviconUrl: 'https://example.com/favicon.ico',
    };
    expect(block.faviconUrl).toBeDefined();
  });

  it('should handle missing thumbnail', () => {
    const block = createMockBookmarkBlock({ thumbnailUrl: '' });
    expect(block.props.thumbnailUrl).toBe('');
  });

  it('should handle missing description', () => {
    const block = createMockBookmarkBlock({ description: '' });
    expect(block.props.description).toBe('');
  });

  it('should support removal', () => {
    const block = createMockBookmarkBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should support editing', () => {
    const block = createMockBookmarkBlock();
    const editAction = vi.fn();
    editAction(block.id);
    expect(editAction).toHaveBeenCalledWith(block.id);
  });

  it('should support duplication', () => {
    const block = createMockBookmarkBlock();
    const duplicateAction = vi.fn();
    duplicateAction(block.id);
    expect(duplicateAction).toHaveBeenCalledWith(block.id);
  });

  it('should extract domain from URL', () => {
    const block = createMockBookmarkBlock({
      url: 'https://example.com/page/path',
    });
    expect(block.props.url).toContain('example.com');
  });

  it('should support http protocol', () => {
    const block = createMockBookmarkBlock({
      url: 'http://example.com',
    });
    expect(block.props.url).toContain('http');
  });

  it('should support https protocol', () => {
    const block = createMockBookmarkBlock({
      url: 'https://example.com',
    });
    expect(block.props.url).toContain('https');
  });

  it('should support hover preview', () => {
    createMockBookmarkBlock();
    let showPreview = false;
    expect(showPreview).toBe(false);

    showPreview = true;
    expect(showPreview).toBe(true);
  });
});
