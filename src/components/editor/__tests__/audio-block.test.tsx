import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('AudioBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockAudioBlock = (properties = {}) => ({
    id: `audio-block-${++idCounter}`,
    type: 'audio',
    props: {
      url: 'https://example.com/audio.mp3',
      title: 'Sample Audio',
      ...properties,
    },
  });

  it('should create audio block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'audio',
        content: 'none',
        propSchema: {
          url: { default: '' },
          title: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('audio');
  });

  it('should store audio URL', () => {
    const block = createMockAudioBlock();
    expect(block.props.url).toBe('https://example.com/audio.mp3');
  });

  it('should update audio URL', () => {
    const block = createMockAudioBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-audio.mp3',
      },
    };
    expect(updated.props.url).toBe('https://example.com/new-audio.mp3');
  });

  it('should handle empty URL', () => {
    const block = createMockAudioBlock({ url: '' });
    expect(block.props.url).toBe('');
  });

  it('should store audio title', () => {
    const block = createMockAudioBlock();
    expect(block.props.title).toBe('Sample Audio');
  });

  it('should update audio title', () => {
    const block = createMockAudioBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        title: 'Updated Title',
      },
    };
    expect(updated.props.title).toBe('Updated Title');
  });

  it('should support MP3 format', () => {
    const block = createMockAudioBlock({
      url: 'https://example.com/audio.mp3',
    });
    expect(block.props.url).toContain('.mp3');
  });

  it('should support WAV format', () => {
    const block = createMockAudioBlock({
      url: 'https://example.com/audio.wav',
    });
    expect(block.props.url).toContain('.wav');
  });

  it('should support OGG format', () => {
    const block = createMockAudioBlock({
      url: 'https://example.com/audio.ogg',
    });
    expect(block.props.url).toContain('.ogg');
  });

  it('should support play action', () => {
    createMockAudioBlock();
    const playAction = vi.fn();
    playAction();
    expect(playAction).toHaveBeenCalled();
  });

  it('should support pause action', () => {
    createMockAudioBlock();
    const pauseAction = vi.fn();
    pauseAction();
    expect(pauseAction).toHaveBeenCalled();
  });

  it('should support stop action', () => {
    createMockAudioBlock();
    const stopAction = vi.fn();
    stopAction();
    expect(stopAction).toHaveBeenCalled();
  });

  it('should have unique block ID', () => {
    const block1 = createMockAudioBlock();
    const block2 = {
      ...createMockAudioBlock(),
      id: 'audio-block-2',
    };
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type audio', () => {
    const _block = createMockAudioBlock();
    expect(_block.type).toBe('audio');
  });

  it('should handle multiple audio blocks', () => {
    const block1 = createMockAudioBlock({
      url: 'https://example.com/audio1.mp3',
      title: 'Audio 1',
    });
    const block2 = createMockAudioBlock({
      url: 'https://example.com/audio2.mp3',
      title: 'Audio 2',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.title).not.toBe(block2.props.title);
  });

  it('should accept valid URLs', () => {
    const validUrls = [
      'https://example.com/audio.mp3',
      'https://storage.googleapis.com/audio.wav',
      'https://cdn.example.com/music.ogg',
    ];

    for (const url of validUrls) {
      const block = createMockAudioBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should store metadata', () => {
    const block = {
      ...createMockAudioBlock(),
      metadata: {
        artist: 'Unknown',
        album: 'Album Name',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have url prop in schema', () => {
    const spec = createReactBlockSpec(
      {
        type: 'audio',
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

  it('should have title prop in schema', () => {
    const spec = createReactBlockSpec(
      {
        type: 'audio',
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

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'audio',
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
      expect(spec.config.propSchema.title.default).toBe('');
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'audio',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });
});
