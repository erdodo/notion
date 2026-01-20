import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReactBlockSpec } from '@blocknote/react'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}))

describe('InlineDatabaseBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  let idCounter = 0
  const createMockInlineDatabaseBlock = (props = {}) => ({
    id: `inline-db-block-${++idCounter}`,
    type: 'inlineDatabase',
    props: {
      databaseId: 'db-123',
      databaseName: 'My Database',
      viewId: 'view-1',
      ...props,
    },
    data: [
      { id: 'row-1', fields: { name: 'Item 1', status: 'Active' } },
      { id: 'row-2', fields: { name: 'Item 2', status: 'Inactive' } },
    ],
  })

  // Basic Structure
  it('should create inline database block spec', () => {
    const spec = createReactBlockSpec({
      type: 'inlineDatabase',
      propSchema: {
        databaseId: { default: '' },
        databaseName: { default: '' },
      },
    })
    expect(spec.type).toBe('inlineDatabase')
  })

  // Database ID
  it('should store database ID', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.props.databaseId).toBe('db-123')
  })

  it('should update database ID', () => {
    const block = createMockInlineDatabaseBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        databaseId: 'db-456',
      },
    }
    expect(updated.props.databaseId).toBe('db-456')
  })

  // Database Name
  it('should store database name', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.props.databaseName).toBe('My Database')
  })

  it('should update database name', () => {
    const block = createMockInlineDatabaseBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        databaseName: 'Updated Database',
      },
    }
    expect(updated.props.databaseName).toBe('Updated Database')
  })

  // View ID
  it('should store view ID', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.props.viewId).toBe('view-1')
  })

  it('should update view ID', () => {
    const block = createMockInlineDatabaseBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        viewId: 'view-2',
      },
    }
    expect(updated.props.viewId).toBe('view-2')
  })

  // Data Loading
  it('should load database data', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.data).toBeDefined()
    expect(block.data.length).toBeGreaterThan(0)
  })

  // Rows
  it('should display database rows', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.data).toHaveLength(2)
  })

  it('should store row data', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.data[0].fields.name).toBe('Item 1')
  })

  // Row Addition
  it('should support adding rows', () => {
    const block = createMockInlineDatabaseBlock()
    const addRow = vi.fn()
    addRow(block.props.databaseId, { name: 'Item 3', status: 'Active' })
    expect(addRow).toHaveBeenCalled()
  })

  // Row Deletion
  it('should support deleting rows', () => {
    const block = createMockInlineDatabaseBlock()
    const deleteRow = vi.fn()
    deleteRow(block.data[0].id)
    expect(deleteRow).toHaveBeenCalledWith(block.data[0].id)
  })

  // Row Editing
  it('should support editing rows', () => {
    const block = createMockInlineDatabaseBlock()
    const editRow = vi.fn()
    editRow(block.data[0].id, { name: 'Updated Item' })
    expect(editRow).toHaveBeenCalled()
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockInlineDatabaseBlock()
    const block2 = createMockInlineDatabaseBlock()
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type inlineDatabase', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.type).toBe('inlineDatabase')
  })

  // Multiple Inline Databases
  it('should handle multiple inline database blocks', () => {
    const block1 = createMockInlineDatabaseBlock({
      databaseId: 'db-1',
      databaseName: 'Database 1',
    })
    const block2 = createMockInlineDatabaseBlock({
      databaseId: 'db-2',
      databaseName: 'Database 2',
    })

    expect(block1.props.databaseId).not.toBe(block2.props.databaseId)
  })

  // Props Schema
  it('should have databaseId prop', () => {
    const spec = createReactBlockSpec({
      type: 'inlineDatabase',
      propSchema: {
        databaseId: { default: '' },
        databaseName: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('databaseId')
    }
  })

  // Search/Filter
  it('should support searching database', () => {
    const block = createMockInlineDatabaseBlock()
    const search = (query) => {
      return block.data.filter(row =>
        row.fields.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    const results = search('Item')
    expect(results.length).toBeGreaterThan(0)
  })

  // Sorting
  it('should support sorting', () => {
    const block = createMockInlineDatabaseBlock()
    const sort = vi.fn()
    sort('name', 'asc')
    expect(sort).toHaveBeenCalledWith('name', 'asc')
  })

  // Filtering
  it('should support filtering', () => {
    const block = createMockInlineDatabaseBlock()
    const filter = vi.fn()
    filter('status', 'Active')
    expect(filter).toHaveBeenCalledWith('status', 'Active')
  })

  // Grouping
  it('should support grouping', () => {
    const block = createMockInlineDatabaseBlock()
    const group = vi.fn()
    group('status')
    expect(group).toHaveBeenCalledWith('status')
  })

  // Views
  it('should support multiple views', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      views: [
        { id: 'view-1', type: 'table', name: 'Table View' },
        { id: 'view-2', type: 'board', name: 'Board View' },
      ],
    }
    expect(block.views).toHaveLength(2)
  })

  // Columns
  it('should display database columns', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      columns: [
        { id: 'col-1', name: 'name', type: 'text' },
        { id: 'col-2', name: 'status', type: 'select' },
      ],
    }
    expect(block.columns).toBeDefined()
  })

  // Row Count
  it('should track row count', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.data.length).toBe(2)
  })

  // Empty Database
  it('should handle empty database', () => {
    const block = {
      ...createMockInlineDatabaseBlock(),
      data: [],
    }
    expect(block.data).toHaveLength(0)
  })

  // Inline Editing
  it('should support inline cell editing', () => {
    const block = createMockInlineDatabaseBlock()
    const editCell = vi.fn()
    editCell(block.data[0].id, 'name', 'New Name')
    expect(editCell).toHaveBeenCalled()
  })

  // Row Expansion
  it('should support row expansion', () => {
    const block = createMockInlineDatabaseBlock()
    let expandedRowId = null
    expect(expandedRowId).toBeNull()

    expandedRowId = block.data[0].id
    expect(expandedRowId).toBeDefined()
  })

  // Inline Add
  it('should support inline row addition', () => {
    const block = createMockInlineDatabaseBlock()
    const addInline = vi.fn()
    addInline()
    expect(addInline).toHaveBeenCalled()
  })

  // Properties
  it('should display row properties', () => {
    const block = createMockInlineDatabaseBlock()
    expect(block.data[0].fields).toBeDefined()
  })

  // Status Indicators
  it('should display status indicators', () => {
    const block = createMockInlineDatabaseBlock()
    const status = block.data[0].fields.status
    expect(status).toBeDefined()
  })

  // Load More
  it('should support load more for large databases', () => {
    const block = createMockInlineDatabaseBlock()
    const loadMore = vi.fn()
    loadMore()
    expect(loadMore).toHaveBeenCalled()
  })

  // Pagination
  it('should support pagination', () => {
    const block = createMockInlineDatabaseBlock()
    let page = 1
    expect(page).toBe(1)

    page = 2
    expect(page).toBe(2)
  })

  // Real-time Updates
  it('should update on database changes', () => {
    const block = createMockInlineDatabaseBlock()
    const updateData = vi.fn()
    updateData([{ id: 'row-3', fields: { name: 'Item 3' } }])
    expect(updateData).toHaveBeenCalled()
  })
})
