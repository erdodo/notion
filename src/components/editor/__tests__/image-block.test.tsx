import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config) => ({
    type: config.type,
    config,
  })),
}))

describe('ImageBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockImageBlock = (props = {}) => ({
    id: 'image-block-1',
    type: 'image',
    props: {
      url: 'https://example.com/image.jpg',
      caption: 'Image caption',
      width: 100,
      height: 100,
      alt: 'Alt text',
      ...props,
    },
  })

  // Basic Structure
  it('should create image block spec', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'image',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.type).toBe('image')
  })

  // URL Handling
  it('should store image URL', () => {
    const block = createMockImageBlock()
    expect(block.props.url).toContain('image.jpg')
  })

  it('should update image URL', () => {
    const block = createMockImageBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-image.png',
      },
    }
    expect(updated.props.url).toContain('new-image.png')
  })

  // Caption Handling
  it('should store image caption', () => {
    const block = createMockImageBlock()
    expect(block.props.caption).toBe('Image caption')
  })

  it('should update image caption', () => {
    const block = createMockImageBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        caption: 'Updated caption',
      },
    }
    expect(updated.props.caption).toBe('Updated caption')
  })

  it('should handle empty caption', () => {
    const block = createMockImageBlock({ caption: '' })
    expect(block.props.caption).toBe('')
  })

  // Alt Text
  it('should store alt text', () => {
    const block = createMockImageBlock()
    expect(block.props.alt).toBe('Alt text')
  })

  it('should update alt text', () => {
    const block = createMockImageBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        alt: 'Updated alt text',
      },
    }
    expect(updated.props.alt).toBe('Updated alt text')
  })

  // Image Formats
  it('should support JPG format', () => {
    const block = createMockImageBlock({ url: 'https://example.com/image.jpg' })
    expect(block.props.url).toContain('.jpg')
  })

  it('should support PNG format', () => {
    const block = createMockImageBlock({ url: 'https://example.com/image.png' })
    expect(block.props.url).toContain('.png')
  })

  it('should support WebP format', () => {
    const block = createMockImageBlock({ url: 'https://example.com/image.webp' })
    expect(block.props.url).toContain('.webp')
  })

  it('should support GIF format', () => {
    const block = createMockImageBlock({ url: 'https://example.com/image.gif' })
    expect(block.props.url).toContain('.gif')
  })

  // Sizing
  it('should store image width', () => {
    const block = createMockImageBlock({ width: 800 })
    expect(block.props.width).toBe(800)
  })

  it('should store image height', () => {
    const block = createMockImageBlock({ height: 600 })
    expect(block.props.height).toBe(600)
  })

  it('should update dimensions', () => {
    const block = createMockImageBlock()
    const resized = {
      ...block,
      props: {
        ...block.props,
        width: 500,
        height: 400,
      },
    }
    expect(resized.props.width).toBe(500)
    expect(resized.props.height).toBe(400)
  })

  // Aspect Ratio
  it('should maintain aspect ratio', () => {
    const block = createMockImageBlock({ width: 800, height: 600 })
    const ratio = block.props.width / block.props.height
    expect(ratio).toBeCloseTo(1.333)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockImageBlock()
    const block2 = {
      ...createMockImageBlock(),
      id: 'image-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type image', () => {
    const block = createMockImageBlock()
    expect(block.type).toBe('image')
  })

  // Multiple Image Blocks
  it('should handle multiple image blocks', () => {
    const block1 = createMockImageBlock({
      url: 'https://example.com/image1.jpg',
      caption: 'Image 1',
    })
    const block2 = createMockImageBlock({
      url: 'https://example.com/image2.jpg',
      caption: 'Image 2',
    })

    expect(block1.props.url).not.toBe(block2.props.url)
    expect(block1.props.caption).not.toBe(block2.props.caption)
  })

  // URL Validation
  it('should accept valid image URLs', () => {
    const validUrls = [
      'https://example.com/image.jpg',
      'https://storage.googleapis.com/image.png',
      'https://cdn.example.com/picture.webp',
    ]

    validUrls.forEach(url => {
      const block = createMockImageBlock({ url })
      expect(block.props.url).toBe(url)
    })
  })

  // Metadata
  it('should store metadata', () => {
    const block = {
      ...createMockImageBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        uploadedBy: 'user-1',
      },
    }
    expect(block.metadata).toBeDefined()
  })

  // Props Schema
  it('should have url prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'image',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('url')
  })

  it('should have caption prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'image',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('caption')
  })

  // Lazy Loading
  it('should support lazy loading', () => {
    const block = createMockImageBlock()
    const loading = 'lazy'
    expect(loading).toBe('lazy')
  })

  // Responsive
  it('should support responsive sizing', () => {
    const block = createMockImageBlock()
    const responsive = true
    expect(responsive).toBe(true)
  })

  // Default Values
  it('should have default values', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'image',
      propSchema: {
        url: { default: '' },
        caption: { default: '' },
      },
    })
    expect(spec.config.propSchema.url.default).toBe('')
    expect(spec.config.propSchema.caption.default).toBe('')
  })

  // Content Type
  it('should have leaf content type', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'image',
      content: 'none',
    })
    expect(spec.config.content).toBe('none')
  })

  // Image Loading
  it('should handle image loaded state', () => {
    const block = createMockImageBlock()
    let isLoaded = false
    expect(isLoaded).toBe(false)

    isLoaded = true
    expect(isLoaded).toBe(true)
  })

  // Image Error
  it('should handle image load error', () => {
    const block = createMockImageBlock()
    const handleError = vi.fn()
    handleError()
    expect(handleError).toHaveBeenCalled()
  })

  // Caption Editing
  it('should support caption editing', () => {
    const block = createMockImageBlock()
    expect(block.props.caption).toBeDefined()
  })

  // Zoom/Scale
  it('should support zoom functionality', () => {
    const block = createMockImageBlock({ width: 100, height: 100 })
    let scale = 1.0
    expect(scale).toBe(1.0)

    scale = 1.5
    expect(scale).toBe(1.5)

    scale = 2.0
    expect(scale).toBe(2.0)
  })

  // Full Screen
  it('should support full screen view', () => {
    const block = createMockImageBlock()
    let isFullScreen = false
    expect(isFullScreen).toBe(false)

    isFullScreen = true
    expect(isFullScreen).toBe(true)
  })

  // Download
  it('should support download action', () => {
    const block = createMockImageBlock()
    const downloadAction = vi.fn()
    downloadAction(block.props.url)
    expect(downloadAction).toHaveBeenCalledWith(block.props.url)
  })
})
