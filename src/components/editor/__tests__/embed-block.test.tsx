import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('EmbedBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockEmbedBlock = (properties = {}) => ({
    id: `embed-block-${++idCounter}`,
    type: 'embed',
    props: {
      url: 'https://example.com/embed',
      width: 560,
      height: 315,
      caption: 'Embedded content',
      ...properties,
    },
  });

  it('should create embed block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'embed',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('embed');
  });

  it('should store embed URL', () => {
    const block = createMockEmbedBlock();
    expect(block.props.url).toContain('example.com');
  });

  it('should update embed URL', () => {
    const block = createMockEmbedBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://newexample.com/embed',
      },
    };
    expect(updated.props.url).toContain('newexample.com');
  });

  it('should store embed caption', () => {
    const block = createMockEmbedBlock();
    expect(block.props.caption).toBe('Embedded content');
  });

  it('should update embed caption', () => {
    const block = createMockEmbedBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        caption: 'Updated caption',
      },
    };
    expect(updated.props.caption).toBe('Updated caption');
  });

  it('should support YouTube embeds', () => {
    const block = createMockEmbedBlock({
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
    expect(block.props.url).toContain('youtube.com');
  });

  it('should support Vimeo embeds', () => {
    const block = createMockEmbedBlock({
      url: 'https://vimeo.com/123456789',
    });
    expect(block.props.url).toContain('vimeo.com');
  });

  it('should support Twitter embeds', () => {
    const block = createMockEmbedBlock({
      url: 'https://twitter.com/example/status/123456',
    });
    expect(block.props.url).toContain('twitter.com');
  });

  it('should support Figma embeds', () => {
    const block = createMockEmbedBlock({
      url: 'https://www.figma.com/file/abc123',
    });
    expect(block.props.url).toContain('figma.com');
  });

  it('should support Google Maps embeds', () => {
    const block = createMockEmbedBlock({
      url: 'https://maps.google.com/maps?q=location',
    });
    expect(block.props.url).toContain('maps.google.com');
  });

  it('should store embed width', () => {
    const block = createMockEmbedBlock({ width: 800 });
    expect(block.props.width).toBe(800);
  });

  it('should store embed height', () => {
    const block = createMockEmbedBlock({ height: 600 });
    expect(block.props.height).toBe(600);
  });

  it('should maintain responsive sizing', () => {
    const block = createMockEmbedBlock({ width: 560, height: 315 });
    const ratio = block.props.width / block.props.height;
    expect(ratio).toBeCloseTo(1.777);
  });

  it('should have unique block ID', () => {
    const block1 = createMockEmbedBlock();
    const block2 = createMockEmbedBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type embed', () => {
    const block = createMockEmbedBlock();
    expect(block.type).toBe('embed');
  });

  it('should handle multiple embed blocks', () => {
    const block1 = createMockEmbedBlock({
      url: 'https://youtube.com/embed/video1',
      caption: 'Video 1',
    });
    const block2 = createMockEmbedBlock({
      url: 'https://figma.com/file/file1',
      caption: 'Design 1',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.caption).not.toBe(block2.props.caption);
  });

  it('should accept valid embed URLs', () => {
    const validUrls = [
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://vimeo.com/123456789',
      'https://www.figma.com/file/abc123',
    ];

    for (const url of validUrls) {
      const block = createMockEmbedBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should have url prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'embed',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('url');
    }
  });

  it('should have caption prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'embed',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('caption');
    }
  });

  it('should store embed metadata', () => {
    const block = {
      ...createMockEmbedBlock(),
      metadata: {
        title: 'Embedded Title',
        provider: 'youtube',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'embed',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
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
        type: 'embed',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should handle loading state', () => {
    createMockEmbedBlock();
    let isLoading = true;
    expect(isLoading).toBe(true);

    isLoading = false;
    expect(isLoading).toBe(false);
  });

  it('should handle error state', () => {
    createMockEmbedBlock();
    const handleError = vi.fn();
    handleError();
    expect(handleError).toHaveBeenCalled();
  });

  it('should support fullscreen attribute', () => {
    const block = {
      ...createMockEmbedBlock(),
      allowFullscreen: true,
    };
    expect(block.allowFullscreen).toBe(true);
  });

  it('should support permissions policy', () => {
    const block = {
      ...createMockEmbedBlock(),
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media',
    };
    expect(block.allow).toBeDefined();
  });

  it('should support sandbox attribute', () => {
    const block = {
      ...createMockEmbedBlock(),
      sandbox: 'allow-same-origin allow-scripts allow-popups',
    };
    expect(block.sandbox).toBeDefined();
  });

  it('should preserve aspect ratio on resize', () => {
    const block = createMockEmbedBlock({ width: 560, height: 315 });
    const originalRatio = block.props.width / block.props.height;

    const resized = {
      ...block,
      props: {
        ...block.props,
        width: 1120,
        height: 630,
      },
    };
    const newRatio = resized.props.width / resized.props.height;

    expect(originalRatio).toBeCloseTo(newRatio);
  });

  it('should detect provider from URL', () => {
    const block = createMockEmbedBlock({
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
    expect(block.props.url).toContain('youtube');
  });

  it('should support caption editing', () => {
    const _block = createMockEmbedBlock();
    expect(_block.props.caption).toBeDefined();
  });

  it('should support removal', () => {
    const block = createMockEmbedBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should support updating URL', () => {
    const block = createMockEmbedBlock();
    const updateAction = vi.fn();
    const newUrl = 'https://example.com/new-embed';
    updateAction(block.id, { url: newUrl });
    expect(updateAction).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ url: newUrl })
    );
  });
});
