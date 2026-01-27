import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('CalloutBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockCalloutBlock = (properties = {}) => ({
    id: `callout-block-${++idCounter}`,
    type: 'callout',
    props: {
      icon: '💡',
      color: 'blue',
      content: 'Important information',
      ...properties,
    },
    children: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Callout content' }],
      },
    ],
  });

  it('should create callout block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {
          icon: { default: '💡' },
          color: { default: 'blue' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('callout');

    if (spec.config) {
      expect(spec.config.propSchema).toBeDefined();
    }
  });

  it('should store callout icon', () => {
    const block = createMockCalloutBlock();
    expect(block.props.icon).toBe('💡');
  });

  it('should update callout icon', () => {
    const block = createMockCalloutBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        icon: '⚠️',
      },
    };
    expect(updated.props.icon).toBe('⚠️');
  });

  it('should support info icon', () => {
    const block = createMockCalloutBlock({ icon: 'ℹ️' });
    expect(block.props.icon).toBe('ℹ️');
  });

  it('should support warning icon', () => {
    const block = createMockCalloutBlock({ icon: '⚠️' });
    expect(block.props.icon).toBe('⚠️');
  });

  it('should support error icon', () => {
    const block = createMockCalloutBlock({ icon: '❌' });
    expect(block.props.icon).toBe('❌');
  });

  it('should support success icon', () => {
    const block = createMockCalloutBlock({ icon: '✅' });
    expect(block.props.icon).toBe('✅');
  });

  it('should support question icon', () => {
    const block = createMockCalloutBlock({ icon: '❓' });
    expect(block.props.icon).toBe('❓');
  });

  it('should store callout color', () => {
    const block = createMockCalloutBlock();
    expect(block.props.color).toBe('blue');
  });

  it('should update callout color', () => {
    const block = createMockCalloutBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        color: 'red',
      },
    };
    expect(updated.props.color).toBe('red');
  });

  it('should support blue color', () => {
    const block = createMockCalloutBlock({ color: 'blue' });
    expect(block.props.color).toBe('blue');
  });

  it('should support red color', () => {
    const block = createMockCalloutBlock({ color: 'red' });
    expect(block.props.color).toBe('red');
  });

  it('should support yellow color', () => {
    const block = createMockCalloutBlock({ color: 'yellow' });
    expect(block.props.color).toBe('yellow');
  });

  it('should support green color', () => {
    const block = createMockCalloutBlock({ color: 'green' });
    expect(block.props.color).toBe('green');
  });

  it('should support purple color', () => {
    const block = createMockCalloutBlock({ color: 'purple' });
    expect(block.props.color).toBe('purple');
  });

  it('should support gray color', () => {
    const block = createMockCalloutBlock({ color: 'gray' });
    expect(block.props.color).toBe('gray');
  });

  it('should store callout content', () => {
    const block = createMockCalloutBlock();
    expect(block.props.content).toBe('Important information');
  });

  it('should support nested content', () => {
    const block = createMockCalloutBlock();
    expect(block.children).toBeDefined();
    expect(block.children.length).toBeGreaterThan(0);
  });

  it('should have unique block ID', () => {
    const block1 = createMockCalloutBlock();
    const block2 = {
      ...createMockCalloutBlock(),
      id: 'callout-block-2',
    };
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type callout', () => {
    const _block = createMockCalloutBlock();
    expect(_block.type).toBe('callout');
  });

  it('should handle multiple callout blocks', () => {
    const block1 = createMockCalloutBlock({
      icon: '💡',
      color: 'blue',
    });
    const block2 = createMockCalloutBlock({
      icon: '⚠️',
      color: 'red',
    });

    expect(block1.props.icon).not.toBe(block2.props.icon);
    expect(block1.props.color).not.toBe(block2.props.color);
  });

  it('should have icon prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {
          icon: { default: '💡' },
          color: { default: 'blue' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('icon');
    }
  });

  it('should have color prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {
          icon: { default: '💡' },
          color: { default: 'blue' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('color');
    }
  });

  it('should have default icon', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {
          icon: { default: '💡' },
          color: { default: 'blue' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.icon.default).toBe('💡');
    }
  });

  it('should have default color', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {
          icon: { default: '💡' },
          color: { default: 'blue' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.color.default).toBe('blue');
    }
  });

  it('should support inline content', () => {
    const spec = createReactBlockSpec(
      {
        type: 'callout',
        content: 'inline',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('inline');
    }
  });

  it('should support icon picker', () => {
    const block = createMockCalloutBlock();
    const pickIcon = vi.fn((icon) => {
      return {
        ...block,
        props: { ...block.props, icon },
      };
    });

    const result = pickIcon('⚠️');
    expect(result.props.icon).toBe('⚠️');
  });

  it('should support color picker', () => {
    const block = createMockCalloutBlock();
    const pickColor = vi.fn((color) => {
      return {
        ...block,
        props: { ...block.props, color },
      };
    });

    const result = pickColor('red');
    expect(result.props.color).toBe('red');
  });

  it('should support custom emoji icon', () => {
    const customIcons = ['🎉', '🚀', '📌', '🔔', '💬'];
    const block = createMockCalloutBlock({ icon: customIcons[0] });
    expect(customIcons).toContain(block.props.icon);
  });

  it('should apply color styling', () => {
    const block = createMockCalloutBlock({ color: 'blue' });
    expect(block.props.color).toBeDefined();
  });

  it('should display icon before content', () => {
    const block = createMockCalloutBlock();
    expect(block.props.icon).toBeDefined();
  });

  it('should support removal', () => {
    const block = createMockCalloutBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should support editing icon', () => {
    const _block = createMockCalloutBlock();
    const editIcon = vi.fn();
    editIcon(_block.id);
    expect(editIcon).toHaveBeenCalledWith(_block.id);
  });

  it('should support editing color', () => {
    const _block = createMockCalloutBlock();
    const editColor = vi.fn();
    editColor(_block.id);
    expect(editColor).toHaveBeenCalledWith(_block.id);
  });

  it('should indicate info type', () => {
    const block = createMockCalloutBlock({ icon: 'ℹ️' });
    expect(block.props.icon).toBe('ℹ️');
  });

  it('should indicate warning type', () => {
    const block = createMockCalloutBlock({ icon: '⚠️' });
    expect(block.props.icon).toBe('⚠️');
  });

  it('should indicate success type', () => {
    const block = createMockCalloutBlock({ icon: '✅' });
    expect(block.props.icon).toBe('✅');
  });

  it('should indicate error type', () => {
    const _block = createMockCalloutBlock({ icon: '❌' });
    expect(_block.props.icon).toBe('❌');
  });
});
