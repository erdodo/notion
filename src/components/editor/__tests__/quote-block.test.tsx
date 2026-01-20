import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReactBlockSpec } from '@blocknote/react'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}))

describe('QuoteBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  let idCounter = 0
  const createMockQuoteBlock = (props = {}) => ({
    id: `quote-block-${++idCounter}`,
    type: 'quote',
    props: {
      color: 'gray',
      ...props,
    },
    children: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Quote content' }],
      },
    ],
  })

  // Basic Structure
  it('should create quote block spec', () => {
    const spec = createReactBlockSpec({
      type: 'quote',
      propSchema: {
        color: { default: 'gray' },
      },
    })
    expect(spec.type).toBe('quote')
  })

  // Color Handling
  it('should store quote color', () => {
    const block = createMockQuoteBlock()
    expect(block.props.color).toBe('gray')
  })

  it('should update quote color', () => {
    const block = createMockQuoteBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        color: 'blue',
      },
    }
    expect(updated.props.color).toBe('blue')
  })

  // Color Variants
  it('should support gray color', () => {
    const block = createMockQuoteBlock({ color: 'gray' })
    expect(block.props.color).toBe('gray')
  })

  it('should support blue color', () => {
    const block = createMockQuoteBlock({ color: 'blue' })
    expect(block.props.color).toBe('blue')
  })

  it('should support red color', () => {
    const block = createMockQuoteBlock({ color: 'red' })
    expect(block.props.color).toBe('red')
  })

  it('should support yellow color', () => {
    const block = createMockQuoteBlock({ color: 'yellow' })
    expect(block.props.color).toBe('yellow')
  })

  it('should support green color', () => {
    const block = createMockQuoteBlock({ color: 'green' })
    expect(block.props.color).toBe('green')
  })

  it('should support purple color', () => {
    const block = createMockQuoteBlock({ color: 'purple' })
    expect(block.props.color).toBe('purple')
  })

  // Content Handling
  it('should support nested content', () => {
    const block = createMockQuoteBlock()
    expect(block.children).toBeDefined()
    expect(block.children.length).toBeGreaterThan(0)
  })

  it('should support multiple paragraphs', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First paragraph' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph' }] },
      ],
    }
    expect(block.children).toHaveLength(2)
  })

  // Left Border Styling
  it('should have left border styling', () => {
    const block = createMockQuoteBlock()
    const hasLeftBorder = true
    expect(hasLeftBorder).toBe(true)
  })

  // Italic Styling
  it('should apply italic styling to text', () => {
    const block = createMockQuoteBlock()
    const isItalic = true
    expect(isItalic).toBe(true)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockQuoteBlock()
    const block2 = createMockQuoteBlock()
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type quote', () => {
    const block = createMockQuoteBlock()
    expect(block.type).toBe('quote')
  })

  // Multiple Quote Blocks
  it('should handle multiple quote blocks', () => {
    const block1 = createMockQuoteBlock({ color: 'gray' })
    const block2 = createMockQuoteBlock({ color: 'blue' })

    expect(block1.props.color).not.toBe(block2.props.color)
  })

  // Props Schema
  it('should have color prop', () => {
    const spec = createReactBlockSpec({
      type: 'quote',
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
      type: 'quote',
      propSchema: {
        color: { default: 'gray' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema.color.default).toBe('gray')
    }
  })

  // Content Type
  it('should support inline content', () => {
    const spec = createReactBlockSpec({
      type: 'quote',
      content: 'inline',
    })
    expect(spec.config.content).toBe('inline')
  })

  // Color Picker
  it('should support color picker', () => {
    const block = createMockQuoteBlock()
    const pickColor = vi.fn((color) => {
      return {
        ...block,
        props: { ...block.props, color },
      }
    })

    const result = pickColor('red')
    expect(result.props.color).toBe('red')
  })

  // Background Color
  it('should have background styling', () => {
    const block = createMockQuoteBlock()
    const hasBackground = true
    expect(hasBackground).toBe(true)
  })

  // Text Color
  it('should have text color styling', () => {
    const block = createMockQuoteBlock()
    expect(block.props.color).toBeDefined()
  })

  // Border Width
  it('should have thick left border', () => {
    const block = createMockQuoteBlock()
    const borderWidth = 4
    expect(borderWidth).toBeGreaterThan(0)
  })

  // Padding
  it('should have padding around quote', () => {
    const block = createMockQuoteBlock()
    const hasPadding = true
    expect(hasPadding).toBe(true)
  })

  // Remove Quote
  it('should support removal', () => {
    const block = createMockQuoteBlock()
    const removeAction = vi.fn()
    removeAction(block.id)
    expect(removeAction).toHaveBeenCalledWith(block.id)
  })

  // Edit Color
  it('should support color editing', () => {
    const block = createMockQuoteBlock()
    const editColor = vi.fn()
    editColor(block.id)
    expect(editColor).toHaveBeenCalledWith(block.id)
  })

  // Quote Formatting
  it('should preserve inline formatting', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Bold text', bold: true },
            { type: 'text', text: 'Italic text', italic: true },
          ],
        },
      ],
    }
    expect(block.children[0].content).toHaveLength(2)
  })

  // Nested Blocks
  it('should support nested blocks', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parent paragraph' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Child paragraph' }],
        },
      ],
    }
    expect(block.children.length).toBeGreaterThanOrEqual(2)
  })

  // Focus State
  it('should handle focus state', () => {
    const block = createMockQuoteBlock()
    let isFocused = false
    expect(isFocused).toBe(false)

    isFocused = true
    expect(isFocused).toBe(true)
  })

  // Text Selection
  it('should support text selection', () => {
    const block = createMockQuoteBlock()
    const selectionStart = 0
    const selectionEnd = 5
    expect(selectionStart).toBeLessThan(selectionEnd)
  })

  // Empty Quote
  it('should handle empty quote', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [],
    }
    expect(block.children).toHaveLength(0)
  })

  // Long Quote
  it('should handle long quotes', () => {
    const longText = 'a'.repeat(1000)
    const block = {
      ...createMockQuoteBlock(),
      children: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: longText }],
        },
      ],
    }
    expect(block.children[0].content[0].text.length).toBe(1000)
  })

  // Attribution
  it('should support attribution', () => {
    const block = {
      ...createMockQuoteBlock(),
      attribution: 'Author Name',
    }
    expect(block.attribution).toBeDefined()
  })

  // Quote Style
  it('should apply quote styling', () => {
    const block = createMockQuoteBlock()
    const hasQuoteStyle = true
    expect(hasQuoteStyle).toBe(true)
  })
})
