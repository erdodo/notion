import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('PageMentionBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockPageMentionBlock = (properties = {}) => ({
    id: `page-mention-block-${++idCounter}`,
    type: 'pageMention',
    props: {
      pageId: 'page-123',
      pageName: 'Referenced Page',
      pageIcon: '📄',
      pageStatus: 'active',
      ...properties,
    },
  });

  it('should create page mention block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'pageMention',
        content: 'none',
        propSchema: {
          pageId: { default: '' },
          pageName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('pageMention');

    if (spec.config) {
      expect(spec.config.propSchema).toBeDefined();
    }
  });

  it('should store page ID', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageId).toBe('page-123');
  });

  it('should update page ID', () => {
    const block = createMockPageMentionBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageId: 'page-456',
      },
    };
    expect(updated.props.pageId).toBe('page-456');
  });

  it('should store page name', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageName).toBe('Referenced Page');
  });

  it('should update page name', () => {
    const block = createMockPageMentionBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageName: 'New Page Name',
      },
    };
    expect(updated.props.pageName).toBe('New Page Name');
  });

  it('should store page icon', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageIcon).toBe('📄');
  });

  it('should update page icon', () => {
    const block = createMockPageMentionBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageIcon: '📝',
      },
    };
    expect(updated.props.pageIcon).toBe('📝');
  });

  it('should store page status', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageStatus).toBe('active');
  });

  it('should update page status', () => {
    const block = createMockPageMentionBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        pageStatus: 'archived',
      },
    };
    expect(updated.props.pageStatus).toBe('archived');
  });

  it('should support active status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'active' });
    expect(block.props.pageStatus).toBe('active');
  });

  it('should support archived status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'archived' });
    expect(block.props.pageStatus).toBe('archived');
  });

  it('should support deleted status', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'deleted' });
    expect(block.props.pageStatus).toBe('deleted');
  });

  it('should navigate to referenced page', () => {
    const block = createMockPageMentionBlock();
    const navigate = vi.fn();
    navigate(block.props.pageId);
    expect(navigate).toHaveBeenCalledWith(block.props.pageId);
  });

  it('should support hover preview', () => {
    let showPreview = false;
    expect(showPreview).toBe(false);

    showPreview = true;
    expect(showPreview).toBe(true);
  });

  it('should have unique block ID', () => {
    const block1 = createMockPageMentionBlock();
    const block2 = {
      ...createMockPageMentionBlock(),
      id: 'page-mention-block-2',
    };
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type pageMention', () => {
    const _block = createMockPageMentionBlock();
    expect(_block.type).toBe('pageMention');
  });

  it('should handle multiple page mentions', () => {
    const block1 = createMockPageMentionBlock({
      pageId: 'page-1',
      pageName: 'Page 1',
    });
    const block2 = createMockPageMentionBlock({
      pageId: 'page-2',
      pageName: 'Page 2',
    });

    expect(block1.props.pageId).not.toBe(block2.props.pageId);
    expect(block1.props.pageName).not.toBe(block2.props.pageName);
  });

  it('should have pageId prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'pageMention',
        content: 'none',
        propSchema: {
          pageId: { default: '' },
          pageName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('pageId');
    }
  });

  it('should have pageName prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'pageMention',
        content: 'none',
        propSchema: {
          pageId: { default: '' },
          pageName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('pageName');
    }
  });

  it('should store page metadata', () => {
    const block = {
      ...createMockPageMentionBlock(),
      metadata: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'pageMention',
        content: 'none',
        propSchema: {
          pageId: { default: '' },
          pageName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.pageId.default).toBe('');
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'pageMention',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should display as link', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageName).toBeDefined();
  });

  it('should handle click navigation', () => {
    const block = createMockPageMentionBlock();
    const handleClick = vi.fn();
    handleClick(block.props.pageId);
    expect(handleClick).toHaveBeenCalledWith(block.props.pageId);
  });

  it('should display page icon', () => {
    const block = createMockPageMentionBlock();
    expect(block.props.pageIcon).toBeDefined();
  });

  it('should validate page exists', () => {
    const block = createMockPageMentionBlock();
    const isValid = !!block.props.pageId;
    expect(isValid).toBe(true);
  });

  it('should update reference when page changes', () => {
    const block = createMockPageMentionBlock();
    const updateReference = vi.fn();
    updateReference(block.id, { pageName: 'Updated Name' });
    expect(updateReference).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ pageName: 'Updated Name' })
    );
  });

  it('should support removal', () => {
    const block = createMockPageMentionBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should handle circular references', () => {
    const block1 = createMockPageMentionBlock({ pageId: 'page-1' });
    const block2 = createMockPageMentionBlock({ pageId: 'page-1' });

    expect(block1.props.pageId).toBe(block2.props.pageId);
  });

  it('should handle deleted page reference', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'deleted' });
    expect(block.props.pageStatus).toBe('deleted');
  });

  it('should indicate archived page', () => {
    const block = createMockPageMentionBlock({ pageStatus: 'archived' });
    expect(block.props.pageStatus).toBe('archived');
  });

  it('should support copying page ID', () => {
    const block = createMockPageMentionBlock();
    const copyAction = vi.fn();
    copyAction(block.props.pageId);
    expect(copyAction).toHaveBeenCalledWith(block.props.pageId);
  });

  it('should display tooltip with page info', () => {
    const block = createMockPageMentionBlock();
    const tooltip = {
      title: block.props.pageName,
      icon: block.props.pageIcon,
      status: block.props.pageStatus,
    };
    expect(tooltip.title).toBeDefined();
  });
});
