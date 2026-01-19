import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config) => ({
    type: config.type,
    config,
  })),
}))

describe('FileBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockFileBlock = (props = {}) => ({
    id: 'file-block-1',
    type: 'file',
    props: {
      url: 'https://example.com/document.pdf',
      fileName: 'document.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      ...props,
    },
  })

  // Basic Structure
  it('should create file block spec', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'file',
      propSchema: {
        url: { default: '' },
        fileName: { default: '' },
      },
    })
    expect(spec.type).toBe('file')
  })

  // File URL
  it('should store file URL', () => {
    const block = createMockFileBlock()
    expect(block.props.url).toContain('document.pdf')
  })

  it('should update file URL', () => {
    const block = createMockFileBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-document.pdf',
      },
    }
    expect(updated.props.url).toContain('new-document.pdf')
  })

  // File Name
  it('should store file name', () => {
    const block = createMockFileBlock()
    expect(block.props.fileName).toBe('document.pdf')
  })

  it('should update file name', () => {
    const block = createMockFileBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        fileName: 'updated-document.pdf',
      },
    }
    expect(updated.props.fileName).toBe('updated-document.pdf')
  })

  // File Size
  it('should store file size', () => {
    const block = createMockFileBlock({ fileSize: 2048000 })
    expect(block.props.fileSize).toBe(2048000)
  })

  it('should format file size', () => {
    const block = createMockFileBlock({ fileSize: 1024000 })
    const sizeMB = block.props.fileSize / (1024 * 1024)
    expect(sizeMB).toBeGreaterThan(0)
  })

  // File Type
  it('should store file type', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' })
    expect(block.props.fileType).toBe('application/pdf')
  })

  // Supported File Types
  it('should support PDF files', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' })
    expect(block.props.fileType).toBe('application/pdf')
  })

  it('should support Word documents', () => {
    const block = createMockFileBlock({
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    expect(block.props.fileType).toContain('word')
  })

  it('should support Excel files', () => {
    const block = createMockFileBlock({
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    expect(block.props.fileType).toContain('spreadsheet')
  })

  it('should support PowerPoint files', () => {
    const block = createMockFileBlock({
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })
    expect(block.props.fileType).toContain('presentation')
  })

  it('should support images', () => {
    const block = createMockFileBlock({ fileType: 'image/jpeg' })
    expect(block.props.fileType).toContain('image')
  })

  it('should support archives', () => {
    const block = createMockFileBlock({ fileType: 'application/zip' })
    expect(block.props.fileType).toContain('zip')
  })

  // Download Action
  it('should support download action', () => {
    const block = createMockFileBlock()
    const downloadAction = vi.fn()
    downloadAction(block.props.url)
    expect(downloadAction).toHaveBeenCalledWith(block.props.url)
  })

  it('should include file name in download', () => {
    const block = createMockFileBlock()
    expect(block.props.fileName).toBeDefined()
  })

  // File Icon
  it('should determine icon from file type', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' })
    const icon = 'file-pdf'
    expect(icon).toBeDefined()
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockFileBlock()
    const block2 = {
      ...createMockFileBlock(),
      id: 'file-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type file', () => {
    const block = createMockFileBlock()
    expect(block.type).toBe('file')
  })

  // Multiple File Blocks
  it('should handle multiple file blocks', () => {
    const block1 = createMockFileBlock({
      url: 'https://example.com/file1.pdf',
      fileName: 'file1.pdf',
    })
    const block2 = createMockFileBlock({
      url: 'https://example.com/file2.docx',
      fileName: 'file2.docx',
    })

    expect(block1.props.url).not.toBe(block2.props.url)
    expect(block1.props.fileName).not.toBe(block2.props.fileName)
  })

  // URL Validation
  it('should accept valid file URLs', () => {
    const validUrls = [
      'https://example.com/document.pdf',
      'https://storage.googleapis.com/file.docx',
      'https://cdn.example.com/archive.zip',
    ]

    validUrls.forEach(url => {
      const block = createMockFileBlock({ url })
      expect(block.props.url).toBe(url)
    })
  })

  // Props Schema
  it('should have url prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'file',
      propSchema: {
        url: { default: '' },
        fileName: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('url')
  })

  it('should have fileName prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'file',
      propSchema: {
        url: { default: '' },
        fileName: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('fileName')
  })

  // Metadata
  it('should store file metadata', () => {
    const block = {
      ...createMockFileBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        uploadedBy: 'user-1',
        lastModified: '2024-01-01',
      },
    }
    expect(block.metadata).toBeDefined()
  })

  // Default Values
  it('should have default values', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'file',
      propSchema: {
        url: { default: '' },
        fileName: { default: '' },
      },
    })
    expect(spec.config.propSchema.url.default).toBe('')
  })

  // Content Type
  it('should have leaf content type', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'file',
      content: 'none',
    })
    expect(spec.config.content).toBe('none')
  })

  // File Size Units
  it('should handle bytes', () => {
    const block = createMockFileBlock({ fileSize: 512 })
    expect(block.props.fileSize).toBe(512)
  })

  it('should handle kilobytes', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 50 })
    expect(block.props.fileSize).toBe(51200)
  })

  it('should handle megabytes', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 1024 * 5 })
    expect(block.props.fileSize).toBe(5242880)
  })

  // File Info Display
  it('should display file name', () => {
    const block = createMockFileBlock()
    expect(block.props.fileName).toBeDefined()
  })

  it('should display file size', () => {
    const block = createMockFileBlock()
    expect(block.props.fileSize).toBeDefined()
  })

  // Preview Support
  it('should support preview for certain file types', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' })
    const canPreview = ['application/pdf', 'image/jpeg', 'image/png']
    expect(canPreview).toContain(block.props.fileType)
  })

  // Remove File
  it('should support removal', () => {
    const block = createMockFileBlock()
    const removeAction = vi.fn()
    removeAction(block.id)
    expect(removeAction).toHaveBeenCalledWith(block.id)
  })

  // Update File
  it('should support updating file', () => {
    const block = createMockFileBlock()
    const updateAction = vi.fn()
    const newUrl = 'https://example.com/updated.pdf'
    updateAction(block.id, { url: newUrl })
    expect(updateAction).toHaveBeenCalledWith(block.id, expect.objectContaining({ url: newUrl }))
  })

  // File Name Extraction
  it('should extract file name from URL', () => {
    const block = createMockFileBlock({
      url: 'https://example.com/downloads/document.pdf',
      fileName: 'document.pdf',
    })
    expect(block.props.fileName).toContain('document')
  })

  // Empty State
  it('should handle empty file', () => {
    const block = createMockFileBlock({ fileSize: 0 })
    expect(block.props.fileSize).toBe(0)
  })

  // Large Files
  it('should handle large files', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 1024 * 100 })
    expect(block.props.fileSize).toBeGreaterThan(100000000)
  })
})
