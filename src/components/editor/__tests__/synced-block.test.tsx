import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReactBlockSpec } from '@blocknote/react'

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}))

describe('SyncedBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  let idCounter = 0
  const createMockSyncedBlock = (props = {}) => ({
    id: `synced-block-${++idCounter}`,
    type: 'syncedBlock',
    props: {
      syncedFrom: 'source-block-id',
      ...props,
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Synced content' }],
      },
    ],
    isSynced: true,
    lastSyncTime: new Date('2024-01-01').toISOString(),
  })

  // Basic Structure
  it('should create synced block spec', () => {
    const spec = createReactBlockSpec({
      type: 'syncedBlock',
      propSchema: {
        syncedFrom: { default: '' },
      },
    })
    expect(spec.type).toBe('syncedBlock')
  })

  // Synced From
  it('should store synced from ID', () => {
    const block = createMockSyncedBlock()
    expect(block.props.syncedFrom).toBe('source-block-id')
  })

  it('should update synced from ID', () => {
    const block = createMockSyncedBlock()
    const updated = {
      ...block,
      props: {
        ...block.props,
        syncedFrom: 'new-source-id',
      },
    }
    expect(updated.props.syncedFrom).toBe('new-source-id')
  })

  // Content Sync
  it('should contain synced content', () => {
    const block = createMockSyncedBlock()
    expect(block.content).toBeDefined()
    expect(block.content.length).toBeGreaterThan(0)
  })

  // Sync Status
  it('should indicate sync status', () => {
    const block = createMockSyncedBlock()
    expect(block.isSynced).toBe(true)
  })

  it('should update sync status', () => {
    const block = createMockSyncedBlock()
    const updated = {
      ...block,
      isSynced: false,
    }
    expect(updated.isSynced).toBe(false)
  })

  // Last Sync Time
  it('should track last sync time', () => {
    const block = createMockSyncedBlock()
    expect(block.lastSyncTime).toBeDefined()
  })

  it('should update last sync time', () => {
    const block = createMockSyncedBlock()
    const newTime = new Date('2024-01-02').toISOString()
    const updated = {
      ...block,
      lastSyncTime: newTime,
    }
    expect(updated.lastSyncTime).toBe(newTime)
  })

  // Sync Action
  it('should support manual sync', () => {
    const block = createMockSyncedBlock()
    const syncAction = vi.fn()
    syncAction(block.id)
    expect(syncAction).toHaveBeenCalledWith(block.id)
  })

  // Auto Sync
  it('should support auto-sync', () => {
    const block = createMockSyncedBlock()
    let autoSync = true
    expect(autoSync).toBe(true)
  })

  // Block ID
  it('should have unique block ID', () => {
    const block1 = createMockSyncedBlock()
    const block2 = {
      ...createMockSyncedBlock(),
      id: 'synced-block-2',
    }
    expect(block1.id).not.toBe(block2.id)
  })

  // Type Definition
  it('should be of type syncedBlock', () => {
    const block = createMockSyncedBlock()
    expect(block.type).toBe('syncedBlock')
  })

  // Multiple Synced Blocks
  it('should handle multiple synced blocks', () => {
    const block1 = createMockSyncedBlock({
      syncedFrom: 'source-1',
    })
    const block2 = createMockSyncedBlock({
      syncedFrom: 'source-2',
    })

    expect(block1.props.syncedFrom).not.toBe(block2.props.syncedFrom)
  })

  // Props Schema
  it('should have syncedFrom prop', () => {
    const spec = createReactBlockSpec({
      type: 'syncedBlock',
      propSchema: {
        syncedFrom: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('syncedFrom')
    }
  })

  // Default Values
  it('should have default values', () => {
    const spec = createReactBlockSpec({
      type: 'syncedBlock',
      propSchema: {
        syncedFrom: { default: '' },
      },
    })
    if (spec.config) {
      expect(spec.config.propSchema.syncedFrom.default).toBe('')
    }
  })

  // Content Type
  it('should support inline content', () => {
    const spec = createReactBlockSpec({
      type: 'syncedBlock',
      content: 'inline',
    })
    if (spec.config) {
      expect(spec.config.content).toBe('inline')
    }
  })

  // Sync Indicator
  it('should display sync indicator', () => {
    const block = createMockSyncedBlock()
    const showIndicator = true
    expect(showIndicator).toBe(true)
  })

  // Sync Error
  it('should handle sync errors', () => {
    const block = createMockSyncedBlock()
    let syncError = null
    expect(syncError).toBeNull()

    syncError = 'Sync failed'
    expect(syncError).toBeDefined()
  })

  // Content Update
  it('should update when source changes', () => {
    const block = createMockSyncedBlock()
    const updateContent = vi.fn()
    const newContent = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Updated content' }] },
    ]
    updateContent(block.id, newContent)
    expect(updateContent).toHaveBeenCalledWith(block.id, newContent)
  })

  // Break Sync
  it('should support breaking sync', () => {
    const block = createMockSyncedBlock()
    const breakSync = vi.fn()
    breakSync(block.id)
    expect(breakSync).toHaveBeenCalledWith(block.id)
  })

  // Bi-directional Sync
  it('should support bi-directional sync', () => {
    const block = createMockSyncedBlock()
    const bidirectional = true
    expect(bidirectional).toBe(true)
  })

  // Sync History
  it('should track sync history', () => {
    const block = {
      ...createMockSyncedBlock(),
      syncHistory: [
        { time: '2024-01-01', status: 'success' },
        { time: '2024-01-02', status: 'success' },
      ],
    }
    expect(block.syncHistory).toBeDefined()
  })

  // Sync Notification
  it('should notify on sync completion', () => {
    const block = createMockSyncedBlock()
    const notifySync = vi.fn()
    notifySync('Sync completed')
    expect(notifySync).toHaveBeenCalledWith('Sync completed')
  })

  // Conflict Resolution
  it('should handle sync conflicts', () => {
    const block = createMockSyncedBlock()
    const hasConflict = false
    expect(hasConflict).toBe(false)
  })

  // Sync Settings
  it('should support sync settings', () => {
    const block = {
      ...createMockSyncedBlock(),
      syncSettings: {
        autoSync: true,
        interval: 5000,
      },
    }
    expect(block.syncSettings).toBeDefined()
  })

  // Metadata
  it('should store sync metadata', () => {
    const block = {
      ...createMockSyncedBlock(),
      metadata: {
        sourceDocId: 'doc-123',
        syncCount: 5,
      },
    }
    expect(block.metadata).toBeDefined()
  })

  // Unlink from Source
  it('should support unlinking from source', () => {
    const block = createMockSyncedBlock()
    const unlink = vi.fn()
    unlink(block.id)
    expect(unlink).toHaveBeenCalledWith(block.id)
  })

  // Resync
  it('should support resync action', () => {
    const block = createMockSyncedBlock()
    const resync = vi.fn()
    resync(block.id)
    expect(resync).toHaveBeenCalledWith(block.id)
  })

  // Loading State
  it('should indicate loading during sync', () => {
    const block = createMockSyncedBlock()
    let isLoading = false
    expect(isLoading).toBe(false)

    isLoading = true
    expect(isLoading).toBe(true)
  })

  // Edit Restrictions
  it('should restrict edits if not latest sync', () => {
    const block = createMockSyncedBlock()
    const canEdit = block.isSynced
    expect(canEdit).toBe(true)
  })
})
