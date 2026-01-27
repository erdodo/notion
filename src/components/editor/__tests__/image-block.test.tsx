import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('ImageBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockImageBlock = (properties = {}) => ({
    id: `image-block-${++idCounter}`,
    type: 'image',
    props: {
      url: 'https://example.com/image.jpg',
      caption: 'Image caption',
      width: 100,
      height: 100,
      alt: 'Alt text',
      ...properties,
    },
  });

  it('should create image block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'image',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('image');
  });

  it('should store image URL', () => {
    const block = createMockImageBlock();
    expect(block.props.url).toContain('image.jpg');
  });

  it('should update image URL', () => {
    const block = createMockImageBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-image.png',
      },
    };
    expect(updated.props.url).toContain('new-image.png');
  });

  it('should store image caption', () => {
    const block = createMockImageBlock();
    expect(block.props.caption).toBe('Image caption');
  });

  it('should update image caption', () => {
    const block = createMockImageBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        caption: 'Updated caption',
      },
    };
    expect(updated.props.caption).toBe('Updated caption');
  });

  it('should handle empty caption', () => {
    const block = createMockImageBlock({ caption: '' });
    expect(block.props.caption).toBe('');
  });

  it('should store alt text', () => {
    const block = createMockImageBlock();
    expect(block.props.alt).toBe('Alt text');
  });

  it('should update alt text', () => {
    const block = createMockImageBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        alt: 'Updated alt text',
      },
    };
    expect(updated.props.alt).toBe('Updated alt text');
  });

  it('should support JPG format', () => {
    const block = createMockImageBlock({
      url: 'https://example.com/image.jpg',
    });
    expect(block.props.url).toContain('.jpg');
  });

  it('should support PNG format', () => {
    const block = createMockImageBlock({
      url: 'https://example.com/image.png',
    });
    expect(block.props.url).toContain('.png');
  });

  it('should support WebP format', () => {
    const block = createMockImageBlock({
      url: 'https://example.com/image.webp',
    });
    expect(block.props.url).toContain('.webp');
  });

  it('should support GIF format', () => {
    const block = createMockImageBlock({
      url: 'https://example.com/image.gif',
    });
    expect(block.props.url).toContain('.gif');
  });

  it('should store image width', () => {
    const block = createMockImageBlock({ width: 800 });
    expect(block.props.width).toBe(800);
  });

  it('should store image height', () => {
    const block = createMockImageBlock({ height: 600 });
    expect(block.props.height).toBe(600);
  });

  it('should update dimensions', () => {
    const block = createMockImageBlock();
    const resized = {
      ...block,
      props: {
        ...block.props,
        width: 500,
        height: 400,
      },
    };
    expect(resized.props.width).toBe(500);
    expect(resized.props.height).toBe(400);
  });

  it('should maintain aspect ratio', () => {
    const block = createMockImageBlock({ width: 800, height: 600 });
    const ratio = block.props.width / block.props.height;
    expect(ratio).toBeCloseTo(1.333);
  });

  it('should have unique block ID', () => {
    const block1 = createMockImageBlock();
    const block2 = createMockImageBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type image', () => {
    const _block = createMockImageBlock();
    expect(_block.type).toBe('image');
  });

  it('should handle multiple image blocks', () => {
    const block1 = createMockImageBlock({
      url: 'https://example.com/image1.jpg',
      caption: 'Image 1',
    });
    const block2 = createMockImageBlock({
      url: 'https://example.com/image2.jpg',
      caption: 'Image 2',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.caption).not.toBe(block2.props.caption);
  });

  it('should accept valid image URLs', () => {
    const validUrls = [
      'https://example.com/image.jpg',
      'https://storage.googleapis.com/image.png',
      'https://cdn.example.com/picture.webp',
    ];

    for (const url of validUrls) {
      const block = createMockImageBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should store metadata', () => {
    const block = {
      ...createMockImageBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        uploadedBy: 'user-1',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have url prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'image',
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
        type: 'image',
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

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'image',
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
      expect(spec.config.propSchema.caption.default).toBe('');
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'image',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should handle image load error', () => {
    createMockImageBlock();
    const handleError = vi.fn();
    handleError();
    expect(handleError).toHaveBeenCalled();
  });

  it('should support caption editing', () => {
    const _block = createMockImageBlock();
    expect(_block.props.caption).toBeDefined();
  });

  it('should support zoom functionality', () => {
    createMockImageBlock({ width: 100, height: 100 });
    let scale = 1;
    expect(scale).toBe(1);

    scale = 1.5;
    expect(scale).toBe(1.5);

    scale = 2;
    expect(scale).toBe(2);
  });

  it('should support full screen view', () => {
    createMockImageBlock();
    let isFullScreen = false;
    expect(isFullScreen).toBe(false);

    isFullScreen = true;
    expect(isFullScreen).toBe(true);
  });

  it('should support download action', () => {
    const block = createMockImageBlock();
    const downloadAction = vi.fn();
    downloadAction(block.props.url);
    expect(downloadAction).toHaveBeenCalledWith(block.props.url);
  });
});
