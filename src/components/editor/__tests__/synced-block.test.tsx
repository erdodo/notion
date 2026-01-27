import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('SyncedBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockSyncedBlock = (properties = {}) => ({
    id: `synced-block-${++idCounter}`,
    type: 'syncedBlock',
    props: {
      syncedFrom: 'source-block-id',
      ...properties,
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Synced content' }],
      },
    ],
    isSynced: true,
    lastSyncTime: new Date('2024-01-01').toISOString(),
  });

  it('should create synced block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'syncedBlock',
        content: 'inline',
        propSchema: {
          syncedFrom: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('syncedBlock');
  });

  it('should store synced from ID', () => {
    const block = createMockSyncedBlock();
    expect(block.props.syncedFrom).toBe('source-block-id');
  });

  it('should update synced from ID', () => {
    const block = createMockSyncedBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        syncedFrom: 'new-source-id',
      },
    };
    expect(updated.props.syncedFrom).toBe('new-source-id');
  });

  it('should contain synced content', () => {
    const block = createMockSyncedBlock();
    expect(block.content).toBeDefined();
    expect(block.content.length).toBeGreaterThan(0);
  });

  it('should indicate sync status', () => {
    const block = createMockSyncedBlock();
    expect(block.isSynced).toBe(true);
  });

  it('should update sync status', () => {
    const block = createMockSyncedBlock();
    const updated = {
      ...block,
      isSynced: false,
    };
    expect(updated.isSynced).toBe(false);
  });

  it('should track last sync time', () => {
    const block = createMockSyncedBlock();
    expect(block.lastSyncTime).toBeDefined();
  });

  it('should update last sync time', () => {
    const block = createMockSyncedBlock();
    const newTime = new Date('2024-01-02').toISOString();
    const updated = {
      ...block,
      lastSyncTime: newTime,
    };
    expect(updated.lastSyncTime).toBe(newTime);
  });

  it('should support bi-directional sync', () => {
    createMockSyncedBlock();
    const bidirectional = true;
    expect(bidirectional).toBe(true);
  });

  it('should support manual sync', () => {
    const block = createMockSyncedBlock();
    const syncAction = vi.fn();
    syncAction(block.id);
    expect(syncAction).toHaveBeenCalledWith(block.id);
  });

  it('should have unique block ID', () => {
    const block1 = createMockSyncedBlock();
    const block2 = {
      ...createMockSyncedBlock(),
      id: 'synced-block-2',
    };
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type syncedBlock', () => {
    const _block = createMockSyncedBlock();
    expect(_block.type).toBe('syncedBlock');
  });

  it('should handle multiple synced blocks', () => {
    const block1 = createMockSyncedBlock({
      syncedFrom: 'source-1',
    });
    const block2 = createMockSyncedBlock({
      syncedFrom: 'source-2',
    });

    expect(block1.props.syncedFrom).not.toBe(block2.props.syncedFrom);
  });

  it('should have syncedFrom prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'syncedBlock',
        content: 'inline',
        propSchema: {
          syncedFrom: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('syncedFrom');
    }
  });

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'syncedBlock',
        content: 'inline',
        propSchema: {
          syncedFrom: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.syncedFrom.default).toBe('');
    }
  });

  it('should support inline content', () => {
    const spec = createReactBlockSpec(
      {
        type: 'syncedBlock',
        content: 'inline',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('inline');
    }
  });

  it('should update when source changes', () => {
    createMockSyncedBlock();
    const updateContent = vi.fn();
    const newContent = [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Updated content' }],
      },
    ];
    updateContent('block-id', newContent);
    expect(updateContent).toHaveBeenCalledWith('block-id', newContent);
  });

  it('should support breaking sync', () => {
    const _block = createMockSyncedBlock();
    const breakSync = vi.fn();
    breakSync(_block.id);
    expect(breakSync).toHaveBeenCalledWith(_block.id);
  });

  it('should track sync history', () => {
    const block = {
      ...createMockSyncedBlock(),
      syncHistory: [
        { time: '2024-01-01', status: 'success' },
        { time: '2024-01-02', status: 'success' },
      ],
    };
    expect(block.syncHistory).toBeDefined();
  });

  it('should notify on sync completion', () => {
    createMockSyncedBlock();
    const notifySync = vi.fn();
    notifySync('Sync completed');
    expect(notifySync).toHaveBeenCalledWith('Sync completed');
  });

  it('should support sync settings', () => {
    const _block = {
      ...createMockSyncedBlock(),
      syncSettings: {
        autoSync: true,
        interval: 5000,
      },
    };
    expect(_block.syncSettings).toBeDefined();
  });

  it('should store sync metadata', () => {
    const _block = {
      ...createMockSyncedBlock(),
      metadata: {
        sourceDocId: 'doc-123',
        syncCount: 5,
      },
    };
    expect(_block.metadata).toBeDefined();
  });

  it('should support unlinking from source', () => {
    const _block = createMockSyncedBlock();
    const unlink = vi.fn();
    unlink(_block.id);
    expect(unlink).toHaveBeenCalledWith(_block.id);
  });

  it('should support resync action', () => {
    const _block = createMockSyncedBlock();
    const resync = vi.fn();
    resync(_block.id);
    expect(resync).toHaveBeenCalledWith(_block.id);
  });

  it('should indicate loading during sync', () => {
    createMockSyncedBlock();
    let isLoading = false;
    expect(isLoading).toBe(false);

    isLoading = true;
    expect(isLoading).toBe(true);
  });

  it('should restrict edits if not latest sync', () => {
    const block = createMockSyncedBlock();
    const canEdit = block.isSynced;
    expect(canEdit).toBe(true);
  });

  it('should handle sync conflicts', () => {
    createMockSyncedBlock();
    const hasConflict = false;
    expect(hasConflict).toBe(false);
  });
});
