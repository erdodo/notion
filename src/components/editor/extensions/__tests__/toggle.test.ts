import { describe, it, expect } from 'vitest';
import { Toggle, ToggleSummary, ToggleContent } from '../toggle';

describe('Toggle Extension', () => {
  it('should have correct name', () => {
    expect(Toggle.name).toBe('toggle');
  });

  it('should be a block node', () => {
    expect(Toggle.config.group).toBe('block');
  });

  it('should have toggleSummary and toggleContent as content', () => {
    expect(Toggle.config.content).toBe('toggleSummary toggleContent');
  });

  it('should parse details HTML tag', () => {
    const parseHTML = Toggle.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.[0].tag).toBe('details');
  });

  it('should have setToggle command', () => {
    expect(Toggle.config.addCommands).toBeDefined();
  });
});

describe('ToggleSummary Extension', () => {
  it('should have correct name', () => {
    expect(ToggleSummary.name).toBe('toggleSummary');
  });

  it('should allow inline content', () => {
    expect(ToggleSummary.config.content).toBe('inline*');
  });

  it('should parse summary HTML tag', () => {
    const parseHTML = ToggleSummary.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.[0].tag).toBe('summary');
  });
});

describe('ToggleContent Extension', () => {
  it('should have correct name', () => {
    expect(ToggleContent.name).toBe('toggleContent');
  });

  it('should allow block content', () => {
    expect(ToggleContent.config.content).toBe('block+');
  });

  it('should parse div with data-type attribute', () => {
    const parseHTML = ToggleContent.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.[0].tag).toBe('div[data-type="toggle-content"]');
  });
});
