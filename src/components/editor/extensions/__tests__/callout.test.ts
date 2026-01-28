import { describe, it, expect } from 'vitest';
import { Callout } from '../callout';

describe('Callout Extension', () => {
  it('should have correct name', () => {
    expect(Callout.name).toBe('callout');
  });

  it('should be a block node', () => {
    expect(Callout.config.group).toBe('block');
  });

  it('should allow block content', () => {
    expect(Callout.config.content).toBe('block+');
  });

  it('should have emoji attribute with default value', () => {
    const attrs = Callout.config.addAttributes?.();
    expect(attrs).toBeDefined();
    expect(attrs?.emoji).toBeDefined();
    expect(attrs?.emoji.default).toBe('💡');
  });

  it('should have backgroundColor attribute', () => {
    const attrs = Callout.config.addAttributes?.();
    expect(attrs?.backgroundColor).toBeDefined();
    expect(attrs?.backgroundColor.default).toBe('gray');
  });

  it('should parse div with data-type="callout"', () => {
    const parseHTML = Callout.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.[0].tag).toBe('div[data-type="callout"]');
  });

  it('should have setCallout command', () => {
    expect(Callout.config.addCommands).toBeDefined();
  });

  it('should support custom emoji attribute', () => {
    const attrs = Callout.config.addAttributes?.();
    expect(attrs?.emoji.parseHTML).toBeDefined();
    expect(attrs?.emoji.renderHTML).toBeDefined();
  });

  it('should support custom backgroundColor attribute', () => {
    const attrs = Callout.config.addAttributes?.();
    expect(attrs?.backgroundColor.parseHTML).toBeDefined();
    expect(attrs?.backgroundColor.renderHTML).toBeDefined();
  });
});
