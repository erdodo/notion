import { describe, it, expect } from 'vitest';
import { PageLink } from '../page-link';

describe('PageLink Extension', () => {
  it('should have correct name', () => {
    expect(PageLink.name).toBe('pageLink');
  });

  it('should extend Link extension', () => {
    expect(PageLink.parent).toBeDefined();
  });

  it('should have data-page-id attribute', () => {
    const attrs = PageLink.config.addAttributes?.();
    expect(attrs).toBeDefined();
    expect(attrs?.['data-page-id']).toBeDefined();
  });

  it('should parse data-page-id from HTML', () => {
    const attrs = PageLink.config.addAttributes?.();
    expect(attrs?.['data-page-id'].parseHTML).toBeDefined();
  });

  it('should render data-page-id to HTML', () => {
    const attrs = PageLink.config.addAttributes?.();
    expect(attrs?.['data-page-id'].renderHTML).toBeDefined();
  });

  it('should have default null for data-page-id', () => {
    const attrs = PageLink.config.addAttributes?.();
    expect(attrs?.['data-page-id'].default).toBeNull();
  });
});
