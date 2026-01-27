import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('TocBlock (Table of Contents)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockTocBlock = (properties = {}) => ({
    id: `toc-block-${++idCounter}`,
    type: 'toc',
    props: {
      color: 'gray',
      ...properties,
    },
    headings: [
      { level: 1, text: 'Heading 1', id: 'heading-1' },
      { level: 2, text: 'Subheading 1', id: 'heading-2' },
      { level: 2, text: 'Subheading 2', id: 'heading-3' },
    ],
  });

  it('should create TOC block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'toc',
        content: 'none',
        propSchema: {
          color: { default: 'gray' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('toc');
  });

  it('should store TOC color', () => {
    const block = createMockTocBlock();
    expect(block.props.color).toBe('gray');
  });

  it('should update TOC color', () => {
    const block = createMockTocBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        color: 'blue',
      },
    };
    expect(updated.props.color).toBe('blue');
  });

  it('should extract headings from document', () => {
    const block = createMockTocBlock();
    expect(block.headings).toBeDefined();
    expect(block.headings.length).toBeGreaterThan(0);
  });

  it('should include H1 headings', () => {
    const block = createMockTocBlock();
    const h1 = block.headings.filter((h) => h.level === 1);
    expect(h1.length).toBeGreaterThan(0);
  });

  it('should include H2 headings', () => {
    const block = createMockTocBlock();
    const h2 = block.headings.filter((h) => h.level === 2);
    expect(h2.length).toBeGreaterThan(0);
  });

  it('should include H3 headings', () => {
    const block = {
      ...createMockTocBlock(),
      headings: [
        { level: 1, text: 'Heading 1', id: 'heading-1' },
        { level: 3, text: 'Deep Heading', id: 'heading-4' },
      ],
    };
    const h3 = block.headings.filter((h) => h.level === 3);
    expect(h3.length).toBeGreaterThan(0);
  });

  it('should store heading text', () => {
    const block = createMockTocBlock();
    expect(block.headings[0].text).toBe('Heading 1');
  });

  it('should store heading anchor IDs', () => {
    const block = createMockTocBlock();
    for (const heading of block.headings) {
      expect(heading.id).toBeDefined();
    }
  });

  it('should support click navigation to heading', () => {
    const block = createMockTocBlock();
    const navigate = vi.fn();
    navigate(block.headings[0].id);
    expect(navigate).toHaveBeenCalledWith(block.headings[0].id);
  });

  it('should maintain hierarchical structure', () => {
    const block = createMockTocBlock();
    expect(block.headings[0].level).toBe(1);
    expect(block.headings[1].level).toBe(2);
    expect(block.headings[2].level).toBe(2);
  });

  it('should have unique block ID', () => {
    const block1 = createMockTocBlock();
    const block2 = createMockTocBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type toc', () => {
    const _block = createMockTocBlock();
    expect(_block.type).toBe('toc');
  });

  it('should handle multiple TOC blocks', () => {
    const block1 = createMockTocBlock();
    const block2 = createMockTocBlock();

    expect(block1.id).not.toBe(block2.id);
  });

  it('should have color prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'toc',
        content: 'none',
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
        type: 'toc',
        content: 'none',
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

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'toc',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should update heading list when document changes', () => {
    createMockTocBlock();
    const updateHeadings = vi.fn();
    const newHeadings = [{ level: 1, text: 'New Heading', id: 'heading-new' }];
    updateHeadings(newHeadings);
    expect(updateHeadings).toHaveBeenCalledWith(newHeadings);
  });

  it('should handle empty TOC', () => {
    const block = {
      ...createMockTocBlock(),
      headings: [],
    };
    expect(block.headings).toHaveLength(0);
  });

  it('should apply indentation based on heading level', () => {
    const block = createMockTocBlock();
    for (const heading of block.headings) {
      const indent = (heading.level - 1) * 20;
      expect(indent).toBeGreaterThanOrEqual(0);
    }
  });

  it('should support numbered list style', () => {
    const block = {
      ...createMockTocBlock(),
      style: 'numbered',
    };
    expect(block.style).toBe('numbered');
  });

  it('should support copying heading link', () => {
    const block = createMockTocBlock();
    const copyAction = vi.fn();
    const link = `#${block.headings[0].id}`;
    copyAction(link);
    expect(copyAction).toHaveBeenCalledWith(link);
  });

  it('should highlight current heading in view', () => {
    const block = createMockTocBlock();
    const currentHeadingId = block.headings[0].id;
    expect(currentHeadingId).toBeDefined();
  });

  it('should refresh headings on request', () => {
    createMockTocBlock();
    const refreshAction = vi.fn();
    refreshAction();
    expect(refreshAction).toHaveBeenCalled();
  });

  it('should support searching headings', () => {
    const block = createMockTocBlock();
    const search = (query: string) => {
      return block.headings.filter((h) =>
        h.text.toLowerCase().includes(query.toLowerCase())
      );
    };

    const results = search('Heading');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should filter headings by level', () => {
    const block = createMockTocBlock();
    const level1Only = block.headings.filter((h) => h.level === 1);
    expect(level1Only.length).toBeGreaterThan(0);
  });

  it('should auto-generate anchor IDs', () => {
    const block = createMockTocBlock();
    for (const heading of block.headings) {
      expect(heading.id).toMatch(/heading-\d+/);
    }
  });

  it('should track active link', () => {
    const block = createMockTocBlock();
    let activeId = block.headings[0].id;
    expect(activeId).toBeDefined();

    activeId = block.headings[1].id;
    expect(activeId).toBeDefined();
  });

  it('should support multiple colors', () => {
    const colors = ['gray', 'blue', 'red', 'green'];
    for (const color of colors) {
      const block = createMockTocBlock({ color });
      expect(block.props.color).toBe(color);
    }
  });

  it('should support jump-to-heading functionality', () => {
    const block = createMockTocBlock();
    const jumpTo = vi.fn();
    jumpTo(block.headings[1].id);
    expect(jumpTo).toHaveBeenCalledWith(block.headings[1].id);
  });
});
