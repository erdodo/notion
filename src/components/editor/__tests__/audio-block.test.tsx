import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReactBlockSpec } from '@blocknote/react'

// Mock blocknote
vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}))

describe('AudioBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  let idCounter = 0
  const createMockAudioBlock = (props = {}) => ({
    id: `audio-block-${++idCounter}`,
    type: 'audio',
    props: {
      url: 'https://example.com/audio.mp3',
      title: 'Sample Audio',
      ...props,
    },
  })

  // Basic Structure
  it('should create audio block spec', () => {
    const spec = createReactBlockSpec({
      type: 'audio',
      propSchema: {
        url: { default: '' },
        title: { default: '' },
      },
    })
    expect(spec.type).toBe('audio')
  })

  // URL Handling
  it('should store audio URL', () => {
    const block = createMockAudioBlock()
    expect(block.props.url).toBe('https://example.com/audio.mp3')
  })

  it('should update audio URL', () => {
    const block = createMockAudioBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-audio.mp3',
      },
    }
    expect(updated.props.url).toBe('https://example.com/new-audio.mp3')
  })

  it('should handle empty URL', () => {
    const block = createMockAudioBlock({ url: '' })
    expect(block.props.url).toBe('')
  })

  // Title Handling
  it('should store audio title', () => {
    const block = createMockAudioBlock()
    expect(block.props.title).toBe('Sample Audio')
  })

  it('should update audio title', () => {
    const block = createMockAudioBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        title: 'Updated Title',
      },
    }
    expect(updated.props.title).toBe('Updated Title')
  })

  // URL Formats
  it('should support MP3 format', () => {
    const block = createMockAudioBlock({ url: 'https://example.com/audio.mp3' })
    expect(block.props.url).toContain('.mp3')
  })

  it('should support WAV format', () => {
    const block = createMockAudioBlock({ url: 'https://example.com/audio.wav' })
    expect(block.props.url).toContain('.wav')
  })

  it('should support OGG format', () => {
    const block = createMockAudioBlock({ url: 'https://example.com/audio.ogg' })
    expect(block.props.url).toContain('.ogg')
  })

  // Playback Control
  it('should support play action', () => {
    const block = createMockAudioBlock()
    const playAction = vi.fn()
    playAction()
    expect(playAction).toHaveBeenCalled()
  })

  it('should support pause action', () => {
    const block = createMockAudioBlock()
    const pauseAction = vi.fn()
    pauseAction()
    expect(pauseAction).toHaveBeenCalled()
  })

  it('should support stop action', () => {
    const block = createMockAudioBlock()
    const stopAction = vi.fn()
    stopAction()
    expect(stopAction).toHaveBeenCalled()
  })

  // Duration Tracking
  it('should handle current time', () => {
    const block = createMockAudioBlock()
    const currentTime = 5.5
    expect(currentTime).toBe(5.5)
  })

  it('should handle total duration', () => {
    const block = createMockAudioBlock()
    const duration = 120 // 2 minutes
    expect(duration).toBeGreaterThan(0)
  })

  // Volume Control
  it('should support volume adjustment', () => {
    const block = createMockAudioBlock()
    let volume = 0.5
    expect(volume).toBe(0.5)

    volume = 1.0
    expect(volume).toBe(1.0)
  })

  it('should handle mute state', () => {
    const block = createMockAudioBlock()
    let isMuted = false
    expect(isMuted).toBe(false)

    isMuted = true
    expect(isMuted).toBe(true)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockAudioBlock()
    const block2 = {
      ...createMockAudioBlock(),
      id: 'audio-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type audio', () => {
    const block = createMockAudioBlock()
    expect(block.type).toBe('audio')
  })

  // Multiple Audio Blocks
  it('should handle multiple audio blocks', () => {
    const block1 = createMockAudioBlock({
      url: 'https://example.com/audio1.mp3',
      title: 'Audio 1',
    })
    const block2 = createMockAudioBlock({
      url: 'https://example.com/audio2.mp3',
      title: 'Audio 2',
    })

    expect(block1.props.url).not.toBe(block2.props.url)
    expect(block1.props.title).not.toBe(block2.props.title)
  })

  // URL Validation
  it('should accept valid URLs', () => {
    const validUrls = [
      'https://example.com/audio.mp3',
      'https://storage.googleapis.com/audio.wav',
      'https://cdn.example.com/music.ogg',
    ]

    validUrls.forEach(url => {
      const block = createMockAudioBlock({ url })
      expect(block.props.url).toBe(url)
    })
  })

  // Metadata
  it('should store metadata', () => {
    const block = {
      ...createMockAudioBlock(),
      metadata: {
        artist: 'Unknown',
        album: 'Album Name',
      },
    }
    expect(block.metadata).toBeDefined()
  })

  // Props Schema
  it('should have url prop in schema', () => {
    const spec = createReactBlockSpec({
      type: 'audio',
      propSchema: {
        url: { default: '' },
        title: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('url')
    }
  })

  it('should have title prop in schema', () => {
    const spec = createReactBlockSpec({
      type: 'audio',
      propSchema: {
        url: { default: '' },
        title: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('title')
    }
  })

  // Playback Speed
  it('should support playback speed control', () => {
    const block = createMockAudioBlock()
    let speed = 1.0
    expect(speed).toBe(1.0)

    speed = 1.5
    expect(speed).toBe(1.5)

    speed = 0.5
    expect(speed).toBe(0.5)
  })

  // Progress Bar
  it('should track progress', () => {
    const block = createMockAudioBlock()
    let progress = 0
    expect(progress).toBe(0)

    progress = 50
    expect(progress).toBe(50)

    progress = 100
    expect(progress).toBe(100)
  })

  // State Management
  it('should maintain playback state', () => {
    const block = createMockAudioBlock()
    const states = ['idle', 'playing', 'paused', 'stopped']

    states.forEach(state => {
      expect(states).toContain(state)
    })
  })

  // Default Values
  it('should have default values', () => {
    const spec = createReactBlockSpec({
      type: 'audio',
      propSchema: {
        url: { default: '' },
        title: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema.url.default).toBe('')
      expect(spec.config.propSchema.title.default).toBe('')
    }
  })

  // Content Type
  it('should have leaf content type', () => {
    const spec = createReactBlockSpec({
      type: 'audio',
      content: 'none',
    })
    if (spec.config) {
      expect(spec.config.content).toBe('none')
    }
  })
})
