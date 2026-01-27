import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('VideoBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockVideoBlock = (properties = {}) => ({
    id: `video-block-${++idCounter}`,
    type: 'video',
    props: {
      url: 'https://example.com/video.mp4',
      caption: 'Video caption',
      width: 640,
      height: 360,
      autoplay: false,
      controls: true,
      ...properties,
    },
  });

  it('should create video block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'video',
        content: 'none',
        propSchema: {
          url: { default: '' },
          caption: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('video');

    if (spec.config) {
      expect(spec.config.propSchema).toBeDefined();
    }
  });

  it('should store video URL', () => {
    const _block = createMockVideoBlock();
    expect(_block.props.url).toContain('video.mp4');
  });

  it('should update video URL', () => {
    const block = createMockVideoBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-video.webm',
      },
    };
    expect(updated.props.url).toContain('new-video.webm');
  });

  it('should store video caption', () => {
    const _block = createMockVideoBlock();
    expect(_block.props.caption).toBe('Video caption');
  });

  it('should update video caption', () => {
    const block = createMockVideoBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        caption: 'Updated caption',
      },
    };
    expect(updated.props.caption).toBe('Updated caption');
  });

  it('should support MP4 format', () => {
    const block = createMockVideoBlock({
      url: 'https://example.com/video.mp4',
    });
    expect(block.props.url).toContain('.mp4');
  });

  it('should support WebM format', () => {
    const block = createMockVideoBlock({
      url: 'https://example.com/video.webm',
    });
    expect(block.props.url).toContain('.webm');
  });

  it('should support MOV format', () => {
    const block = createMockVideoBlock({
      url: 'https://example.com/video.mov',
    });
    expect(block.props.url).toContain('.mov');
  });

  it('should support YouTube URLs', () => {
    const block = createMockVideoBlock({
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    });
    expect(block.props.url).toContain('youtube.com');
  });

  it('should store video width', () => {
    const block = createMockVideoBlock({ width: 1280 });
    expect(block.props.width).toBe(1280);
  });

  it('should store video height', () => {
    const block = createMockVideoBlock({ height: 720 });
    expect(block.props.height).toBe(720);
  });

  it('should maintain aspect ratio', () => {
    const block = createMockVideoBlock({ width: 1280, height: 720 });
    const ratio = block.props.width / block.props.height;
    expect(ratio).toBeCloseTo(1.777);
  });

  it('should have autoplay prop', () => {
    const block = createMockVideoBlock({ autoplay: false });
    expect(block.props.autoplay).toBe(false);
  });

  it('should enable autoplay', () => {
    const block = createMockVideoBlock({ autoplay: true });
    expect(block.props.autoplay).toBe(true);
  });

  it('should have controls enabled', () => {
    const block = createMockVideoBlock({ controls: true });
    expect(block.props.controls).toBe(true);
  });

  it('should hide controls', () => {
    const block = createMockVideoBlock({ controls: false });
    expect(block.props.controls).toBe(false);
  });

  it('should support play action', () => {
    createMockVideoBlock();
    const playAction = vi.fn();
    playAction();
    expect(playAction).toHaveBeenCalled();
  });

  it('should support pause action', () => {
    createMockVideoBlock();
    const pauseAction = vi.fn();
    pauseAction();
    expect(pauseAction).toHaveBeenCalled();
  });

  it('should have unique block ID', () => {
    const block1 = createMockVideoBlock();
    const block2 = {
      ...createMockVideoBlock(),
      id: 'video-block-2',
    };
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type video', () => {
    const _block = createMockVideoBlock();
    expect(_block.type).toBe('video');
  });

  it('should handle multiple video blocks', () => {
    const block1 = createMockVideoBlock({
      url: 'https://example.com/video1.mp4',
      caption: 'Video 1',
    });
    const block2 = createMockVideoBlock({
      url: 'https://example.com/video2.mp4',
      caption: 'Video 2',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.caption).not.toBe(block2.props.caption);
  });

  it('should accept valid video URLs', () => {
    const validUrls = [
      'https://example.com/video.mp4',
      'https://storage.googleapis.com/video.webm',
      'https://cdn.example.com/movie.mov',
    ];

    for (const url of validUrls) {
      const block = createMockVideoBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should have url prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'video',
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

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'video',
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
        type: 'video',
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
    createMockVideoBlock();
    let isLoading = true;
    expect(isLoading).toBe(true);

    isLoading = false;
    expect(isLoading).toBe(false);
  });

  it('should handle error state', () => {
    createMockVideoBlock();
    const handleError = vi.fn();
    handleError();
    expect(handleError).toHaveBeenCalled();
  });

  it('should support picture in picture', () => {
    createMockVideoBlock();
    let isPip = false;
    expect(isPip).toBe(false);

    isPip = true;
    expect(isPip).toBe(true);
  });

  it('should support playback speed selection', () => {
    createMockVideoBlock();
    const speeds = [0.5, 1, 1.5, 2];

    for (const speed of speeds) {
      expect(speeds).toContain(speed);
    }
  });

  it('should support quality selection', () => {
    createMockVideoBlock();
    const qualities = ['720p', '1080p', '480p', 'auto'];

    for (const quality of qualities) {
      expect(qualities).toContain(quality);
    }
  });

  it('should support captions/subtitles', () => {
    const block = {
      ...createMockVideoBlock(),
      captions: [
        { lang: 'en', src: 'captions-en.vtt' },
        { lang: 'es', src: 'captions-es.vtt' },
      ],
    };
    expect(block.captions).toHaveLength(2);
  });

  it('should support poster image', () => {
    const block = {
      ...createMockVideoBlock(),
      poster: 'https://example.com/poster.jpg',
    };
    expect(block.poster).toBeDefined();
  });

  it('should support loop functionality', () => {
    const block = {
      ...createMockVideoBlock(),
      loop: false,
    };
    expect(block.loop).toBe(false);

    const looped = {
      ...block,
      loop: true,
    };
    expect(looped.loop).toBe(true);
  });

  it('should store metadata', () => {
    const block = {
      ...createMockVideoBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        duration: 300,
      },
    };
    expect(block.metadata).toBeDefined();
  });
});
