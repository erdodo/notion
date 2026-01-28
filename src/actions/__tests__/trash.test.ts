import { describe, it, expect } from 'vitest';

describe('Trash/Archive Functionality', () => {
  it('should have archivePage action', async () => {
    const { archivePage } = await import('@/actions/page');
    expect(archivePage).toBeDefined();
    expect(typeof archivePage).toBe('function');
  });

  it('should have restorePage action', async () => {
    const { restorePage } = await import('@/actions/page');
    expect(restorePage).toBeDefined();
    expect(typeof restorePage).toBe('function');
  });

  it('should have getArchivedPages action', async () => {
    const { getArchivedPages } = await import('@/actions/page');
    expect(getArchivedPages).toBeDefined();
    expect(typeof getArchivedPages).toBe('function');
  });

  it('should have deletePage action', async () => {
    const { deletePage } = await import('@/actions/page');
    expect(deletePage).toBeDefined();
    expect(typeof deletePage).toBe('function');
  });
});
