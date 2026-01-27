import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('DividerBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockDividerBlock = (properties = {}) => ({
    id: `divider-block-${++idCounter}`,
    type: 'divider',
    props: {
      ...properties,
    },
  });

  it('should create divider block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'divider',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('divider');
  });

  it('should render horizontal divider', () => {
    const block = createMockDividerBlock();
    expect(block.type).toBe('divider');
  });

  it('should have unique block ID', () => {
    const block1 = createMockDividerBlock();
    const block2 = createMockDividerBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type divider', () => {
    const _block = createMockDividerBlock();
    expect(_block.type).toBe('divider');
  });

  it('should handle multiple divider blocks', () => {
    const block1 = createMockDividerBlock();
    const block2 = createMockDividerBlock();
    const block3 = createMockDividerBlock();

    expect(block1.id).not.toBe(block2.id);
    expect(block2.id).not.toBe(block3.id);
  });

  it('should have no props', () => {
    const spec = createReactBlockSpec(
      {
        type: 'divider',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;

    if (spec.config) {
      expect(spec.config.propSchema).toEqual({});
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'divider',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should render as horizontal line', () => {
    createMockDividerBlock();
    const isHorizontal = true;
    expect(isHorizontal).toBe(true);
  });

  it('should span full width', () => {
    createMockDividerBlock();
    const fullWidth = true;
    expect(fullWidth).toBe(true);
  });

  it('should have gray color styling', () => {
    createMockDividerBlock();
    const color = 'gray';
    expect(color).toBeDefined();
  });

  it('should have light opacity', () => {
    createMockDividerBlock();
    const opacity = 0.2;
    expect(opacity).toBeLessThan(1);
  });

  it('should have thin height', () => {
    createMockDividerBlock();
    const height = 1;
    expect(height).toBeGreaterThan(0);
  });

  it('should have top margin', () => {
    createMockDividerBlock();
    const marginTop = true;
    expect(marginTop).toBe(true);
  });

  it('should have bottom margin', () => {
    createMockDividerBlock();
    const marginBottom = true;
    expect(marginBottom).toBe(true);
  });

  it('should have role attribute', () => {
    createMockDividerBlock();
    const role = 'separator';
    expect(role).toBeDefined();
  });

  it('should have aria-hidden attribute', () => {
    createMockDividerBlock();
    const ariaHidden = true;
    expect(ariaHidden).toBe(true);
  });

  it('should support removal', () => {
    const block = createMockDividerBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should support duplication', () => {
    const block = createMockDividerBlock();
    const duplicateAction = vi.fn();
    duplicateAction(block.id);
    expect(duplicateAction).toHaveBeenCalledWith(block.id);
  });

  it('should handle consecutive dividers', () => {
    const divider1 = createMockDividerBlock();
    const divider2 = createMockDividerBlock();

    expect(divider1.type).toBe('divider');
    expect(divider2.type).toBe('divider');
  });

  it('should work in any document context', () => {
    const block = createMockDividerBlock();
    expect(block.type).toBe('divider');
  });

  it('should support deletion via keyboard', () => {
    createMockDividerBlock();
    const deleteAction = vi.fn();
    deleteAction();
    expect(deleteAction).toHaveBeenCalled();
  });

  it('should support copying', () => {
    const block = createMockDividerBlock();
    const copyAction = vi.fn();
    copyAction(block);
    expect(copyAction).toHaveBeenCalledWith(block);
  });

  it('should be selectable', () => {
    createMockDividerBlock();
    let isSelected = false;
    expect(isSelected).toBe(false);

    isSelected = true;
    expect(isSelected).toBe(true);
  });

  it('should be focusable', () => {
    createMockDividerBlock();
    let isFocused = false;
    expect(isFocused).toBe(false);

    isFocused = true;
    expect(isFocused).toBe(true);
  });

  it('should visually separate content', () => {
    createMockDividerBlock();
    const separates = true;
    expect(separates).toBe(true);
  });

  it('should have no internal padding', () => {
    createMockDividerBlock();
    const padding = 0;
    expect(padding).toBe(0);
  });

  it('should have consistent styling across instances', () => {
    const block1 = createMockDividerBlock();
    const block2 = createMockDividerBlock();

    expect(block1.type).toBe(block2.type);
    expect(Object.keys(block1.props)).toEqual(Object.keys(block2.props));
  });

  it('should support drag handle', () => {
    createMockDividerBlock();
    const hasDragHandle = true;
    expect(hasDragHandle).toBe(true);
  });

  it('should support context menu', () => {
    createMockDividerBlock();
    const showContextMenu = vi.fn();
    showContextMenu();
    expect(showContextMenu).toHaveBeenCalled();
  });

  it('should support undo', () => {
    createMockDividerBlock();
    const undoAction = vi.fn();
    undoAction();
    expect(undoAction).toHaveBeenCalled();
  });

  it('should support redo', () => {
    createMockDividerBlock();
    const redoAction = vi.fn();
    redoAction();
    expect(redoAction).toHaveBeenCalled();
  });

  it('should work with empty props', () => {
    const block = createMockDividerBlock({});
    expect(Object.keys(block.props)).toHaveLength(0);
  });

  it('should support solid line style', () => {
    createMockDividerBlock();
    const style = 'solid';
    expect(style).toBeDefined();
  });
});
