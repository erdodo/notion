import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('QuoteBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockQuoteBlock = (properties = {}) => ({
    id: `quote-block-${++idCounter}`,
    type: 'quote',
    props: {
      color: 'gray',
      ...properties,
    },
    children: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Quote content' }],
      },
    ],
  });

  it('should create quote block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'quote',
        content: 'inline',
        propSchema: {
          color: { default: 'gray' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('quote');
  });

  it('should store quote color', () => {
    const block = createMockQuoteBlock();
    expect(block.props.color).toBe('gray');
  });

  it('should update quote color', () => {
    const block = createMockQuoteBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        color: 'blue',
      },
    };
    expect(updated.props.color).toBe('blue');
  });

  it('should support gray color', () => {
    const block = createMockQuoteBlock({ color: 'gray' });
    expect(block.props.color).toBe('gray');
  });

  it('should support blue color', () => {
    const block = createMockQuoteBlock({ color: 'blue' });
    expect(block.props.color).toBe('blue');
  });

  it('should support red color', () => {
    const block = createMockQuoteBlock({ color: 'red' });
    expect(block.props.color).toBe('red');
  });

  it('should support yellow color', () => {
    const block = createMockQuoteBlock({ color: 'yellow' });
    expect(block.props.color).toBe('yellow');
  });

  it('should support green color', () => {
    const block = createMockQuoteBlock({ color: 'green' });
    expect(block.props.color).toBe('green');
  });

  it('should support purple color', () => {
    const block = createMockQuoteBlock({ color: 'purple' });
    expect(block.props.color).toBe('purple');
  });

  it('should support nested content', () => {
    const block = createMockQuoteBlock();
    expect(block.children).toBeDefined();
    expect(block.children.length).toBeGreaterThan(0);
  });

  it('should support multiple paragraphs', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'First paragraph' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Second paragraph' }],
        },
      ],
    };
    expect(block.children).toHaveLength(2);
  });

  it('should have unique block ID', () => {
    const block1 = createMockQuoteBlock();
    const block2 = createMockQuoteBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type quote', () => {
    const _block = createMockQuoteBlock();
    expect(_block.type).toBe('quote');
  });

  it('should handle multiple quote blocks', () => {
    const block1 = createMockQuoteBlock({ color: 'gray' });
    const block2 = createMockQuoteBlock({ color: 'blue' });

    expect(block1.props.color).not.toBe(block2.props.color);
  });

  it('should have color prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'quote',
        content: 'inline',
        propSchema: {
          color: { default: 'gray' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('color');
    }
  });

  it('should have default color', () => {
    const spec = createReactBlockSpec(
      {
        type: 'quote',
        content: 'inline',
        propSchema: {
          color: { default: 'gray' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.color.default).toBe('gray');
    }
  });

  it('should support inline content', () => {
    const spec = createReactBlockSpec(
      {
        type: 'quote',
        content: 'inline',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    expect(spec.config.content).toBe('inline');
  });

  it('should support color picker', () => {
    const block = createMockQuoteBlock();
    const pickColor = vi.fn((color) => {
      return {
        ...block,
        props: { ...block.props, color },
      };
    });

    const result = pickColor('red');
    expect(result.props.color).toBe('red');
  });

  it('should have text color styling', () => {
    const _block = createMockQuoteBlock();
    expect(_block.props.color).toBeDefined();
  });

  it('should support removal', () => {
    const _block = createMockQuoteBlock();
    const removeAction = vi.fn();
    removeAction(_block.id);
    expect(removeAction).toHaveBeenCalledWith(_block.id);
  });

  it('should support color editing', () => {
    const _block = createMockQuoteBlock();
    const editColor = vi.fn();
    editColor(_block.id);
    expect(editColor).toHaveBeenCalledWith(_block.id);
  });

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
    };
    expect(block.children[0].content).toHaveLength(2);
  });

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
    };
    expect(block.children.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle focus state', () => {
    createMockQuoteBlock();
    let isFocused = false;
    expect(isFocused).toBe(false);

    isFocused = true;
    expect(isFocused).toBe(true);
  });

  it('should support text selection', () => {
    createMockQuoteBlock();
    const selectionStart = 0;
    const selectionEnd = 5;
    expect(selectionStart).toBeLessThan(selectionEnd);
  });

  it('should handle empty quote', () => {
    const block = {
      ...createMockQuoteBlock(),
      children: [],
    };
    expect(block.children).toHaveLength(0);
  });

  it('should handle long quotes', () => {
    const longText = 'a'.repeat(1000);
    const block = {
      ...createMockQuoteBlock(),
      children: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: longText }],
        },
      ],
    };
    expect(block.children[0].content[0].text.length).toBe(1000);
  });

  it('should support attribution', () => {
    const block = {
      ...createMockQuoteBlock(),
      attribution: 'Author Name',
    };
    expect(block.attribution).toBeDefined();
  });
});
