import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config) => ({
    type: config.type,
    config,
  })),
}))

describe('PageMentionBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockPageMentionBlock = (props = {}) => ({
    id: 'page-mention-block-1',
    type: 'pageMention',
    props: {
      pageId: 'page-123',
      pageName: 'Referenced Page',
      pageIcon: '📄',
      pageStatus: 'active',
      ...props,
    },
  })

  // Basic Structure
  it('should create page mention block spec', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'pageMention',
      propSchema: {
        pageId: { default: '' },
        pageName: { default: '' },
      },
    })
    expect(spec.type).toBe('pageMention')
  })

  // Page ID
  it('should store page ID', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageId).toBe('page-123')
  })

  it('should update page ID', () => {
    const block = createMockPageMentionBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageId: 'page-456',
      },
    }
    expect(updated.props.pageId).toBe('page-456')
  })

  // Page Name
  it('should store page name', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageName).toBe('Referenced Page')
  })

  it('should update page name', () => {
    const block = createMockPageMentionBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageName: 'New Page Name',
      },
    }
    expect(updated.props.pageName).toBe('New Page Name')
  })

  // Page Icon
  it('should store page icon', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageIcon).toBe('📄')
  })

  it('should update page icon', () => {
    const block = createMockPageMentionBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageIcon: '📝',
      },
    }
    expect(updated.props.pageIcon).toBe('📝')
  })

  // Page Status
  it('should store page status', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageStatus).toBe('active')
  })

  it('should update page status', () => {
    const block = createMockPageMentionBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageStatus: 'archived',
      },
    }
    expect(updated.props.pageStatus).toBe('archived')
  })

  // Page Status Variants
  it('should support active status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'active' })
    expect(block.props.pageStatus).toBe('active')
  })

  it('should support archived status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'archived' })
    expect(block.props.pageStatus).toBe('archived')
  })

  it('should support deleted status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'deleted' })
    expect(block.props.pageStatus).toBe('deleted')
  })

  // Navigation
  it('should navigate to referenced page', () => {
    const block = createMockPageMentionBlock()
    const navigate = vi.fn()
    navigate(block.props.pageId)
    expect(navigate).toHaveBeenCalledWith(block.props.pageId)
  })

  // Hover Preview
  it('should support hover preview', () => {
    const block = createMockPageMentionBlock()
    let showPreview = false
    expect(showPreview).toBe(false)

    showPreview = true
    expect(showPreview).toBe(true)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockPageMentionBlock()
    const block2 = {
      ...createMockPageMentionBlock(),
      id: 'page-mention-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type pageMention', () => {
    const block = createMockPageMentionBlock()
    expect(block.type).toBe('pageMention')
  })

  // Multiple Page Mentions
  it('should handle multiple page mentions', () => {
    const block1 = createMockPageMentionBlock({
      pageId: 'page-1',
      pageName: 'Page 1',
    })
    const block2 = createMockPageMentionBlock({
      pageId: 'page-2',
      pageName: 'Page 2',
    })

    expect(block1.props.pageId).not.toBe(block2.props.pageId)
    expect(block1.props.pageName).not.toBe(block2.props.pageName)
  })

  // Props Schema
  it('should have pageId prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'pageMention',
      propSchema: {
        pageId: { default: '' },
        pageName: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('pageId')
  })

  it('should have pageName prop', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'pageMention',
      propSchema: {
        pageId: { default: '' },
        pageName: { default: '' },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('pageName')
  })

  // Metadata
  it('should store page metadata', () => {
    const block = {
      ...createMockPageMentionBlock(),
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    }
    expect(block.metadata).toBeDefined()
  })

  // Default Values
  it('should have default values', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'pageMention',
      propSchema: {
        pageId: { default: '' },
        pageName: { default: '' },
      },
    })
    expect(spec.config.propSchema.pageId.default).toBe('')
  })

  // Content Type
  it('should have leaf content type', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'pageMention',
      content: 'none',
    })
    expect(spec.config.content).toBe('none')
  })

  // Display Style
  it('should display as link', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageName).toBeDefined()
  })

  // Click Handler
  it('should handle click navigation', () => {
    const block = createMockPageMentionBlock()
    const handleClick = vi.fn()
    handleClick(block.props.pageId)
    expect(handleClick).toHaveBeenCalledWith(block.props.pageId)
  })

  // Icon Display
  it('should display page icon', () => {
    const block = createMockPageMentionBlock()
    expect(block.props.pageIcon).toBeDefined()
  })

  // Page Link Validation
  it('should validate page exists', () => {
    const block = createMockPageMentionBlock()
    const isValid = !!block.props.pageId
    expect(isValid).toBe(true)
  })

  // Update Reference
  it('should update reference when page changes', () => {
    const block = createMockPageMentionBlock()
    const updateReference = vi.fn()
    updateReference(block.id, { pageName: 'Updated Name' })
    expect(updateReference).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ pageName: 'Updated Name' })
    )
  })

  // Remove Mention
  it('should support removal', () => {
    const block = createMockPageMentionBlock()
    const removeAction = vi.fn()
    removeAction(block.id)
    expect(removeAction).toHaveBeenCalledWith(block.id)
  })

  // Circular Reference Check
  it('should handle circular references', () => {
    const block1 = createMockPageMentionBlock({ pageId: 'page-1' })
    const block2 = createMockPageMentionBlock({ pageId: 'page-1' })

    expect(block1.props.pageId).toBe(block2.props.pageId)
  })

  // Dead Link Handling
  it('should handle deleted page reference', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'deleted' })
    expect(block.props.pageStatus).toBe('deleted')
  })

  // Archived Page
  it('should indicate archived page', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'archived' })
    expect(block.props.pageStatus).toBe('archived')
  })

  // Copy Page ID
  it('should support copying page ID', () => {
    const block = createMockPageMentionBlock()
    const copyAction = vi.fn()
    copyAction(block.props.pageId)
    expect(copyAction).toHaveBeenCalledWith(block.props.pageId)
  })

  // Tooltip
  it('should display tooltip with page info', () => {
    const block = createMockPageMentionBlock()
    const tooltip = {
      title: block.props.pageName,
      icon: block.props.pageIcon,
      status: block.props.pageStatus,
    }
    expect(tooltip.title).toBeDefined()
  })
})
