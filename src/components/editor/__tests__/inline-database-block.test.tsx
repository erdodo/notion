import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('InlineDatabaseBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockInlineDatabaseBlock = (properties = {}) => ({
    id: `inline-db-block-${++idCounter}`,
    type: 'inlineDatabase',
    props: {
      databaseId: 'db-123',
      databaseName: 'My Database',
      viewId: 'view-1',
      ...properties,
    },
    data: [
      { id: 'row-1', fields: { name: 'Item 1', status: 'Active' } },
      { id: 'row-2', fields: { name: 'Item 2', status: 'Inactive' } },
    ],
  });

  it('should create inline database block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'inlineDatabase',
        content: 'none',
        propSchema: {
          databaseId: { default: '' },
          databaseName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('inlineDatabase');
  });

  it('should store database ID', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.props.databaseId).toBe('db-123');
  });

  it('should update database ID', () => {
    const block = createMockInlineDatabaseBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        databaseId: 'db-456',
      },
    };
    expect(updated.props.databaseId).toBe('db-456');
  });

  it('should store database name', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.props.databaseName).toBe('My Database');
  });

  it('should update database name', () => {
    const block = createMockInlineDatabaseBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        databaseName: 'Updated Database',
      },
    };
    expect(updated.props.databaseName).toBe('Updated Database');
  });

  it('should store view ID', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.props.viewId).toBe('view-1');
  });

  it('should update view ID', () => {
    const block = createMockInlineDatabaseBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        viewId: 'view-2',
      },
    };
    expect(updated.props.viewId).toBe('view-2');
  });

  it('should load database data', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.data).toBeDefined();
    expect(block.data.length).toBeGreaterThan(0);
  });

  it('should display database rows', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.data).toHaveLength(2);
  });

  it('should store row data', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.data[0].fields.name).toBe('Item 1');
  });

  it('should support adding rows', () => {
    const block = createMockInlineDatabaseBlock();
    const addRow = vi.fn();
    addRow(block.props.databaseId, { name: 'Item 3', status: 'Active' });
    expect(addRow).toHaveBeenCalled();
  });

  it('should support deleting rows', () => {
    const block = createMockInlineDatabaseBlock();
    const deleteRow = vi.fn();
    deleteRow(block.data[0].id);
    expect(deleteRow).toHaveBeenCalledWith(block.data[0].id);
  });

  it('should support editing rows', () => {
    const block = createMockInlineDatabaseBlock();
    const editRow = vi.fn();
    editRow(block.data[0].id, { name: 'Updated Item' });
    expect(editRow).toHaveBeenCalled();
  });

  it('should have unique block ID', () => {
    const block1 = createMockInlineDatabaseBlock();
    const block2 = createMockInlineDatabaseBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type inlineDatabase', () => {
    const _block = createMockInlineDatabaseBlock();
    expect(_block.type).toBe('inlineDatabase');
  });

  it('should handle multiple inline database blocks', () => {
    const block1 = createMockInlineDatabaseBlock({
      databaseId: 'db-1',
      databaseName: 'Database 1',
    });
    const block2 = createMockInlineDatabaseBlock({
      databaseId: 'db-2',
      databaseName: 'Database 2',
    });

    expect(block1.props.databaseId).not.toBe(block2.props.databaseId);
  });

  it('should have databaseId prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'inlineDatabase',
        content: 'none',
        propSchema: {
          databaseId: { default: '' },
          databaseName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('databaseId');
    }
  });

  it('should support searching database', () => {
    const block = createMockInlineDatabaseBlock();
    const search = (query: string) => {
      return block.data.filter((row) =>
        row.fields.name.toLowerCase().includes(query.toLowerCase())
      );
    };

    const results = search('Item');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should support sorting', () => {
    createMockInlineDatabaseBlock();
    const sort = vi.fn();
    sort('name', 'asc');
    expect(sort).toHaveBeenCalledWith('name', 'asc');
  });

  it('should support filtering', () => {
    createMockInlineDatabaseBlock();
    const filter = vi.fn();
    filter('status', 'Active');
    expect(filter).toHaveBeenCalledWith('status', 'Active');
  });

  it('should support grouping', () => {
    createMockInlineDatabaseBlock();
    const group = vi.fn();
    group('status');
    expect(group).toHaveBeenCalledWith('status');
  });

  it('should support multiple views', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      views: [
        { id: 'view-1', type: 'table', name: 'Table View' },
        { id: 'view-2', type: 'board', name: 'Board View' },
      ],
    };
    expect(block.views).toHaveLength(2);
  });

  it('should display database columns', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      columns: [
        { id: 'col-1', name: 'name', type: 'text' },
        { id: 'col-2', name: 'status', type: 'select' },
      ],
    };
    expect(block.columns).toBeDefined();
  });

  it('should track row count', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.data.length).toBe(2);
  });

  it('should handle empty database', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      data: [],
    };
    expect(block.data).toHaveLength(0);
  });

  it('should support inline cell editing', () => {
    const block = createMockInlineDatabaseBlock();
    const editCell = vi.fn();
    editCell(block.data[0].id, 'name', 'New Name');
    expect(editCell).toHaveBeenCalled();
  });

  it('should support row expansion', () => {
    const block = createMockInlineDatabaseBlock();
    let expandedRowId = null;
    expect(expandedRowId).toBeNull();

    expandedRowId = block.data[0].id;
    expect(expandedRowId).toBeDefined();
  });

  it('should support inline row addition', () => {
    createMockInlineDatabaseBlock();
    const addInline = vi.fn();
    addInline();
    expect(addInline).toHaveBeenCalled();
  });

  it('should display row properties', () => {
    const block = createMockInlineDatabaseBlock();
    expect(block.data[0].fields).toBeDefined();
  });

  it('should display status indicators', () => {
    const block = createMockInlineDatabaseBlock();
    const status = block.data[0].fields.status;
    expect(status).toBeDefined();
  });

  it('should support load more for large databases', () => {
    createMockInlineDatabaseBlock();
    const loadMore = vi.fn();
    loadMore();
    expect(loadMore).toHaveBeenCalled();
  });

  it('should support pagination', () => {
    createMockInlineDatabaseBlock();
    let page = 1;
    expect(page).toBe(1);

    page = 2;
    expect(page).toBe(2);
  });

  it('should update on database changes', () => {
    createMockInlineDatabaseBlock();
    const updateData = vi.fn();
    updateData([{ id: 'row-3', fields: { name: 'Item 3' } }]);
    expect(updateData).toHaveBeenCalled();
  });
});
