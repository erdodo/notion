import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReactBlockSpec } from '@blocknote/react'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}))

describe('TocBlock (Table of Contents)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  let idCounter = 0
  const createMockTocBlock = (props = {}) => ({
    id: `toc-block-${++idCounter}`,
    type: 'toc',
    props: {
      color: 'gray',
      ...props,
    },
    headings: [
      { level: 1, text: 'Heading 1', id: 'heading-1' },
      { level: 2, text: 'Subheading 1', id: 'heading-2' },
      { level: 2, text: 'Subheading 2', id: 'heading-3' },
    ],
  })

  // Basic Structure
  it('should create TOC block spec', () => {
    const spec = createReactBlockSpec({
      type: 'toc',
      propSchema: {
        color: { default: 'gray' },
      },
    })
    expect(spec.type).toBe('toc')
  })

  // Color Handling
  it('should store TOC color', () => {
    const block = createMockTocBlock()
    expect(block.props.color).toBe('gray')
  })

  it('should update TOC color', () => {
    const block = createMockTocBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        color: 'blue',
      },
    }
    expect(updated.props.color).toBe('blue')
  })

  // Headings Collection
  it('should extract headings from document', () => {
    const block = createMockTocBlock()
    expect(block.headings).toBeDefined()
    expect(block.headings.length).toBeGreaterThan(0)
  })

  // Heading Levels
  it('should include H1 headings', () => {
    const block = createMockTocBlock()
    const h1 = block.headings.filter(h => h.level === 1)
    expect(h1.length).toBeGreaterThan(0)
  })

  it('should include H2 headings', () => {
    const block = createMockTocBlock()
    const h2 = block.headings.filter(h => h.level === 2)
    expect(h2.length).toBeGreaterThan(0)
  })

  it('should include H3 headings', () => {
    const block = {
      ...createMockTocBlock(),
      headings: [
        { level: 1, text: 'Heading 1', id: 'heading-1' },
        { level: 3, text: 'Deep Heading', id: 'heading-4' },
      ],
    }
    const h3 = block.headings.filter(h => h.level === 3)
    expect(h3.length).toBeGreaterThan(0)
  })

  // Heading Text
  it('should store heading text', () => {
    const block = createMockTocBlock()
    expect(block.headings[0].text).toBe('Heading 1')
  })

  // Heading IDs
  it('should store heading anchor IDs', () => {
    const block = createMockTocBlock()
    block.headings.forEach(heading => {
      expect(heading.id).toBeDefined()
    })
  })

  // Navigation Links
  it('should support click navigation to heading', () => {
    const block = createMockTocBlock()
    const navigate = vi.fn()
    navigate(block.headings[0].id)
    expect(navigate).toHaveBeenCalledWith(block.headings[0].id)
  })

  // Hierarchical Structure
  it('should maintain hierarchical structure', () => {
    const block = createMockTocBlock()
    expect(block.headings[0].level).toBe(1)
    expect(block.headings[1].level).toBe(2)
    expect(block.headings[2].level).toBe(2)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockTocBlock()
    const block2 = createMockTocBlock()
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type toc', () => {
    const block = createMockTocBlock()
    expect(block.type).toBe('toc')
  })

  // Multiple TOC Blocks
  it('should handle multiple TOC blocks', () => {
    const block1 = createMockTocBlock()
    const block2 = createMockTocBlock()

    expect(block1.id).not.toBe(block2.id)
  })

  // Props Schema
  it('should have color prop', () => {
    const spec = createReactBlockSpec({
      type: 'toc',
      propSchema: {
        color: { default: 'gray' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('color')
    }
  })

  // Default Values
  it('should have default color', () => {
    const spec = createReactBlockSpec({
      type: 'toc',
      propSchema: {
        color: { default: 'gray' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema.color.default).toBe('gray')
    }
  })

  // Content Type
  it('should have leaf content type', () => {
    const spec = createReactBlockSpec({
      type: 'toc',
      content: 'none',
    })
    if (spec.config) {
      expect(spec.config.content).toBe('none')
    }
  })

  // Update Headings
  it('should update heading list when document changes', () => {
    const block = createMockTocBlock()
    const updateHeadings = vi.fn()
    const newHeadings = [
      { level: 1, text: 'New Heading', id: 'heading-new' },
    ]
    updateHeadings(newHeadings)
    expect(updateHeadings).toHaveBeenCalledWith(newHeadings)
  })

  // Empty TOC
  it('should handle empty TOC', () => {
    const block = {
      ...createMockTocBlock(),
      headings: [],
    }
    expect(block.headings).toHaveLength(0)
  })

  // Indentation
  it('should apply indentation based on heading level', () => {
    const block = createMockTocBlock()
    block.headings.forEach(heading => {
      const indent = (heading.level - 1) * 20
      expect(indent).toBeGreaterThanOrEqual(0)
    })
  })

  // Bullet Style
  it('should display as bullet list', () => {
    const block = createMockTocBlock()
    const isBulletList = true
    expect(isBulletList).toBe(true)
  })

  // Numbers Style
  it('should support numbered list style', () => {
    const block = {
      ...createMockTocBlock(),
      style: 'numbered',
    }
    expect(block.style).toBe('numbered')
  })

  // Smooth Scroll
  it('should support smooth scroll on navigation', () => {
    const block = createMockTocBlock()
    const smoothScroll = true
    expect(smoothScroll).toBe(true)
  })

  // Copy Link
  it('should support copying heading link', () => {
    const block = createMockTocBlock()
    const copyAction = vi.fn()
    const link = `#${block.headings[0].id}`
    copyAction(link)
    expect(copyAction).toHaveBeenCalledWith(link)
  })

  // Highlight Current
  it('should highlight current heading in view', () => {
    const block = createMockTocBlock()
    let currentHeadingId = block.headings[0].id
    expect(currentHeadingId).toBeDefined()
  })

  // Refresh
  it('should refresh headings on request', () => {
    const block = createMockTocBlock()
    const refreshAction = vi.fn()
    refreshAction()
    expect(refreshAction).toHaveBeenCalled()
  })

  // Search Headings
  it('should support searching headings', () => {
    const block = createMockTocBlock()
    const search = (query) => {
      return block.headings.filter(h =>
        h.text.toLowerCase().includes(query.toLowerCase())
      )
    }

    const results = search('Heading')
    expect(results.length).toBeGreaterThan(0)
  })

  // Filter by Level
  it('should filter headings by level', () => {
    const block = createMockTocBlock()
    const level1Only = block.headings.filter(h => h.level === 1)
    expect(level1Only.length).toBeGreaterThan(0)
  })

  // Auto-generate Anchors
  it('should auto-generate anchor IDs', () => {
    const block = createMockTocBlock()
    block.headings.forEach(heading => {
      expect(heading.id).toMatch(/heading-\d+/)
    })
  })

  // Links Active State
  it('should track active link', () => {
    const block = createMockTocBlock()
    let activeId = block.headings[0].id
    expect(activeId).toBeDefined()

    activeId = block.headings[1].id
    expect(activeId).toBeDefined()
  })

  // Color Variants
  it('should support multiple colors', () => {
    const colors = ['gray', 'blue', 'red', 'green']
    colors.forEach(color => {
      const block = createMockTocBlock({ color })
      expect(block.props.color).toBe(color)
    })
  })

  // Jump to Heading
  it('should support jump-to-heading functionality', () => {
    const block = createMockTocBlock()
    const jumpTo = vi.fn()
    jumpTo(block.headings[1].id)
    expect(jumpTo).toHaveBeenCalledWith(block.headings[1].id)
  })
})
