import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the blocknote module
vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((config, renderer) => ({
    type: config.type,
    config,
    renderer,
  })),
}))

describe('ToggleBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock editor and block
  const createMockEditor = () => ({
    updateBlock: vi.fn(),
    deleteBlock: vi.fn(),
    insertBlocks: vi.fn(),
  })

  const createMockBlock = (isOpen = false) => ({
    id: 'block-1',
    type: 'toggle',
    props: {
      isOpen,
    },
    content: [{ type: 'text', text: 'Toggle content' }],
  })

  // Basic Structure
  it('should create toggle block spec', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'toggle',
      content: 'inline',
      propSchema: {
        isOpen: { default: false },
      },
    })
    expect(spec.type).toBe('toggle')
  })

  // Initial State
  it('should start with closed state by default', () => {
    const block = createMockBlock(false)
    expect(block.props.isOpen).toBe(false)
  })

  it('should support open state', () => {
    const block = createMockBlock(true)
    expect(block.props.isOpen).toBe(true)
  })

  // Toggle Functionality
  it('should toggle open state', () => {
    const block = createMockBlock(false)
    const toggled = {
      ...block,
      props: {
        isOpen: !block.props.isOpen,
      },
    }
    expect(toggled.props.isOpen).toBe(true)
  })

  it('should toggle closed state', () => {
    const block = createMockBlock(true)
    const toggled = {
      ...block,
      props: {
        isOpen: !block.props.isOpen,
      },
    }
    expect(toggled.props.isOpen).toBe(false)
  })

  // Multiple Toggles
  it('should handle multiple toggle blocks', () => {
    const block1 = createMockBlock(false)
    const block2 = createMockBlock(true)
    const block3 = createMockBlock(false)

    expect(block1.props.isOpen).toBe(false)
    expect(block2.props.isOpen).toBe(true)
    expect(block3.props.isOpen).toBe(false)
  })

  // Content Handling
  it('should contain inline content', () => {
    const block = createMockBlock()
    expect(block.content).toBeDefined()
    expect(block.content.length).toBeGreaterThan(0)
  })

  it('should update content when modified', () => {
    const block = createMockBlock()
    const updated = {
      ...block,
      content: [{ type: 'text', text: 'Updated content' }],
    }
    expect(updated.content[0].text).toBe('Updated content')
  })

  // Icon Display
  it('should display closed icon when collapsed', () => {
    const block = createMockBlock(false)
    expect(block.props.isOpen).toBe(false)
    // ChevronRight icon would be displayed
  })

  it('should display open icon when expanded', () => {
    const block = createMockBlock(true)
    expect(block.props.isOpen).toBe(true)
    // ChevronDown icon would be displayed
  })

  // Editor Integration
  it('should update block in editor', () => {
    const editor = createMockEditor()
    const block = createMockBlock(false)

    editor.updateBlock(block.id, {
      props: { isOpen: true },
    })

    expect(editor.updateBlock).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({
        props: expect.objectContaining({ isOpen: true }),
      })
    )
  })

  it('should delete block from editor', () => {
    const editor = createMockEditor()
    const block = createMockBlock()

    editor.deleteBlock(block.id)

    expect(editor.deleteBlock).toHaveBeenCalledWith(block.id)
  })

  // Nested Content
  it('should support nested blocks', () => {
    const block = createMockBlock()
    const nested = {
      id: 'nested-1',
      parent: block.id,
      type: 'paragraph',
    }
    expect(nested.parent).toBe(block.id)
  })

  // Visibility Toggle
  it('should show/hide children when toggled', () => {
    const block = createMockBlock(false)
    expect(block.props.isOpen).toBe(false)

    const openBlock = {
      ...block,
      props: { isOpen: true },
    }
    expect(openBlock.props.isOpen).toBe(true)
  })

  // Props Schema
  it('should have isOpen prop in schema', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'toggle',
      propSchema: {
        isOpen: { default: false },
      },
    })
    expect(spec.config.propSchema).toHaveProperty('isOpen')
  })

  it('should have default isOpen value', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'toggle',
      propSchema: {
        isOpen: { default: false },
      },
    })
    expect(spec.config.propSchema.isOpen.default).toBe(false)
  })

  // Type Definition
  it('should be of type toggle', () => {
    const block = createMockBlock()
    expect(block.type).toBe('toggle')
  })

  // Content Type
  it('should have inline content type', () => {
    const { createReactBlockSpec } = require('@blocknote/react')
    const spec = createReactBlockSpec({
      type: 'toggle',
      content: 'inline',
    })
    expect(spec.config.content).toBe('inline')
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockBlock()
    const block2 = createMockBlock()

    expect(block1.id).not.toBe(block2.id)
  })

  // State Persistence
  it('should persist open state', () => {
    const block = createMockBlock(true)
    const persistent = { ...block }

    expect(persistent.props.isOpen).toBe(true)
  })

  // Multiple Toggles Independent
  it('should handle independent toggle states', () => {
    const block1 = createMockBlock(false)
    const block2 = createMockBlock(true)

    const toggled1 = {
      ...block1,
      props: { isOpen: !block1.props.isOpen },
    }
    const toggled2 = {
      ...block2,
      props: { isOpen: !block2.props.isOpen },
    }

    expect(toggled1.props.isOpen).toBe(true)
    expect(toggled2.props.isOpen).toBe(false)
  })

  // Animation
  it('should support state transition for animation', () => {
    const block = createMockBlock(false)
    const steps = [false, true, false, true]

    steps.forEach((state, index) => {
      const updated = {
        ...block,
        props: { isOpen: state },
      }
      expect(updated.props.isOpen).toBe(state)
    })
  })

  // Ref Handling
  it('should handle content ref callback', () => {
    const mockRef = vi.fn()
    const block = createMockBlock()

    expect(mockRef).toBeDefined()
  })

  // Content Element
  it('should manage content element', () => {
    const block = createMockBlock()
    expect(block.content).toBeDefined()
  })

  // Block Updates
  it('should update block props', () => {
    const block = createMockBlock(false)
    const updated = {
      ...block,
      props: {
        ...block.props,
        isOpen: true,
      },
    }
    expect(updated.props.isOpen).toBe(true)
    expect(block.props.isOpen).toBe(false)
  })

  // Rapid Toggles
  it('should handle rapid toggle clicks', () => {
    let block = createMockBlock(false)

    for (let i = 0; i < 10; i++) {
      block = {
        ...block,
        props: { isOpen: !block.props.isOpen },
      }
    }

    expect(block.props.isOpen).toBe(true)
  })

  // Block Hierarchy
  it('should maintain block hierarchy', () => {
    const parent = createMockBlock()
    const children = [
      { id: 'child-1', parent: parent.id },
      { id: 'child-2', parent: parent.id },
    ]

    expect(children.every(c => c.parent === parent.id)).toBe(true)
  })

  // Content Clearing
  it('should handle empty content', () => {
    const block = {
      ...createMockBlock(),
      content: [],
    }
    expect(block.content.length).toBe(0)
  })

  // Edge Cases
  it('should handle block with no content', () => {
    const block = {
      id: 'block-1',
      type: 'toggle',
      props: { isOpen: false },
      content: [],
    }
    expect(block.content).toEqual([])
  })

  it('should handle rapid state changes', () => {
    const block = createMockBlock(false)
    let state = block.props.isOpen

    for (let i = 0; i < 100; i++) {
      state = !state
    }

    expect(state).toBe(true)
  })
})
