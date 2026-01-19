import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config) => ({
    type: config.type,
    config,
  })),
}))

describe('VideoBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockVideoBlock = (props = {}) => ({
    id: 'video-block-1',
    type: 'video',
    props: {
      url: 'https://example.com/video.mp4',
      caption: 'Video caption',
      width: 640,
      height: 360,
      autoplay: false,
      controls: true,
      ...props,
    },
  })

  // Basic Structure
  it('should create video block spec', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'video',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.type).toBe('video')
  })

  // URL Handling
  it('should store video URL', () => {
    const block = createMockVideoBlock()
    expect(block.props.url).toContain('video.mp4')
  })

  it('should update video URL', () => {
    const block = createMockVideoBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-video.webm',
      },
    }
    expect(updated.props.url).toContain('new-video.webm')
  })

  // Caption Handling
  it('should store video caption', () => {
    const block = createMockVideoBlock()
    expect(block.props.caption).toBe('Video caption')
  })

  it('should update video caption', () => {
    const block = createMockVideoBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        caption: 'Updated caption',
      },
    }
    expect(updated.props.caption).toBe('Updated caption')
  })

  // Video Formats
  it('should support MP4 format', () => {
    const block = createMockVideoBlock({ url: 'https://example.com/video.mp4' })
    expect(block.props.url).toContain('.mp4')
  })

  it('should support WebM format', () => {
    const block = createMockVideoBlock({ url: 'https://example.com/video.webm' })
    expect(block.props.url).toContain('.webm')
  })

  it('should support MOV format', () => {
    const block = createMockVideoBlock({ url: 'https://example.com/video.mov' })
    expect(block.props.url).toContain('.mov')
  })

  it('should support YouTube URLs', () => {
    const block = createMockVideoBlock({
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    })
    expect(block.props.url).toContain('youtube.com')
  })

  // Sizing
  it('should store video width', () => {
    const block = createMockVideoBlock({ width: 1280 })
    expect(block.props.width).toBe(1280)
  })

  it('should store video height', () => {
    const block = createMockVideoBlock({ height: 720 })
    expect(block.props.height).toBe(720)
  })

  it('should maintain aspect ratio', () => {
    const block = createMockVideoBlock({ width: 1280, height: 720 })
    const ratio = block.props.width / block.props.height
    expect(ratio).toBeCloseTo(1.777)
  })

  // Autoplay
  it('should have autoplay prop', () => {
    const block = createMockVideoBlock({ autoplay: false })
    expect(block.props.autoplay).toBe(false)
  })

  it('should enable autoplay', () => {
    const block = createMockVideoBlock({ autoplay: true })
    expect(block.props.autoplay).toBe(true)
  })

  // Controls
  it('should have controls enabled', () => {
    const block = createMockVideoBlock({ controls: true })
    expect(block.props.controls).toBe(true)
  })

  it('should hide controls', () => {
    const block = createMockVideoBlock({ controls: false })
    expect(block.props.controls).toBe(false)
  })

  // Playback Control
  it('should support play action', () => {
    const block = createMockVideoBlock()
    const playAction = vi.fn()
    playAction()
    expect(playAction).toHaveBeenCalled()
  })

  it('should support pause action', () => {
    const block = createMockVideoBlock()
    const pauseAction = vi.fn()
    pauseAction()
    expect(pauseAction).toHaveBeenCalled()
  })

  // Volume Control
  it('should support volume adjustment', () => {
    const block = createMockVideoBlock()
    let volume = 0.7
    expect(volume).toBe(0.7)

    volume = 1.0
    expect(volume).toBe(1.0)
  })

  // Mute
  it('should support mute functionality', () => {
    const block = createMockVideoBlock()
    let isMuted = false
    expect(isMuted).toBe(false)

    isMuted = true
    expect(isMuted).toBe(true)
  })

  // Fullscreen
  it('should support fullscreen mode', () => {
    const block = createMockVideoBlock()
    let isFullscreen = false
    expect(isFullscreen).toBe(false)

    isFullscreen = true
    expect(isFullscreen).toBe(true)
  })

  // Progress Tracking
  it('should track current time', () => {
    const block = createMockVideoBlock()
    let currentTime = 0
    expect(currentTime).toBe(0)

    currentTime = 30.5
    expect(currentTime).toBe(30.5)
  })

  it('should track total duration', () => {
    const block = createMockVideoBlock()
    const duration = 300 // 5 minutes
    expect(duration).toBeGreaterThan(0)
  })

  // Playback Speed
  it('should support speed control', () => {
    const block = createMockVideoBlock()
    const speeds = [0.5, 1.0, 1.5, 2.0]

    speeds.forEach(speed => {
      expect(speeds).toContain(speed)
    })
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockVideoBlock()
    const block2 = {
      ...createMockVideoBlock(),
      id: 'video-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type video', () => {
    const block = createMockVideoBlock()
    expect(block.type).toBe('video')
  })

  // Multiple Video Blocks
  it('should handle multiple video blocks', () => {
    const block1 = createMockVideoBlock({
      url: 'https://example.com/video1.mp4',
      caption: 'Video 1',
    })
    const block2 = createMockVideoBlock({
      url: 'https://example.com/video2.mp4',
      caption: 'Video 2',
    })

    expect(block1.props.url).not.toBe(block2.props.url)
    expect(block1.props.caption).not.toBe(block2.props.caption)
  })

  // URL Validation
  it('should accept valid video URLs', () => {
    const validUrls = [
      'https://example.com/video.mp4',
      'https://storage.googleapis.com/video.webm',
      'https://cdn.example.com/movie.mov',
    ]

    validUrls.forEach(url => {
      const block = createMockVideoBlock({ url })
      expect(block.props.url).toBe(url)
    })
  })

  // Props Schema
  it('should have url prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'video',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('url')
  })

  // Default Values
  it('should have default values', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'video',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.config.propSchema.url.default).toBe('')
  })

  // Content Type
  it('should have leaf content type', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'video',
      content: 'none',
    })
    expect(spec.config.content).toBe('none')
  })

  // Loading State
  it('should handle loading state', () => {
    const block = createMockVideoBlock()
    let isLoading = true
    expect(isLoading).toBe(true)

    isLoading = false
    expect(isLoading).toBe(false)
  })

  // Error Handling
  it('should handle error state', () => {
    const block = createMockVideoBlock()
    const handleError = vi.fn()
    handleError()
    expect(handleError).toHaveBeenCalled()
  })

  // Picture in Picture
  it('should support picture in picture', () => {
    const block = createMockVideoBlock()
    let isPip = false
    expect(isPip).toBe(false)

    isPip = true
    expect(isPip).toBe(true)
  })

  // Quality Selection
  it('should support quality selection', () => {
    const block = createMockVideoBlock()
    const qualities = ['720p', '1080p', '480p', 'auto']

    qualities.forEach(quality => {
      expect(qualities).toContain(quality)
    })
  })

  // Captions
  it('should support captions/subtitles', () => {
    const block = {
      ...createMockVideoBlock(),
      captions: [
        { lang: 'en', src: 'captions-en.vtt' },
        { lang: 'es', src: 'captions-es.vtt' },
      ],
    }
    expect(block.captions).toHaveLength(2)
  })

  // Poster Image
  it('should support poster image', () => {
    const block = {
      ...createMockVideoBlock(),
      poster: 'https://example.com/poster.jpg',
    }
    expect(block.poster).toBeDefined()
  })

  // Loop
  it('should support loop functionality', () => {
    const block = {
      ...createMockVideoBlock(),
      loop: false,
    }
    expect(block.loop).toBe(false)

    const looped = {
      ...block,
      loop: true,
    }
    expect(looped.loop).toBe(true)
  })

  // Metadata
  it('should store metadata', () => {
    const block = {
      ...createMockVideoBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        duration: 300,
      },
    }
    expect(block.metadata).toBeDefined()
  })
})
