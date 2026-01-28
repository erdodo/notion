import { describe, it, expect } from 'vitest';
import { Columns, Column } from '../columns';

describe('Columns Extension', () => {
  it('should have correct name', () => {
    expect(Columns.name).toBe('columns');
  });

  it('should be a block node', () => {
    expect(Columns.config.group).toBe('block');
  });

  it('should contain column+ content', () => {
    expect(Columns.config.content).toBe('column+');
  });

  it('should have columnCount attribute with default 2', () => {
    const attrs = Columns.config.addAttributes?.();
    expect(attrs?.columnCount).toBeDefined();
    expect(attrs?.columnCount.default).toBe(2);
  });

  it('should parse div with data-type="columns"', () => {
    const parseHTML = Columns.config.parseHTML?.();
    expect(parseHTML?.[0].tag).toBe('div[data-type="columns"]');
  });
});

describe('Column Extension', () => {
  it('should have correct name', () => {
    expect(Column.name).toBe('column');
  });

  it('should allow block content', () => {
    expect(Column.config.content).toBe('block+');
  });

  it('should have width attribute', () => {
    const attrs = Column.config.addAttributes?.();
    expect(attrs?.width).toBeDefined();
    expect(attrs?.width.default).toBeNull();
  });

  it('should parse div with data-type="column"', () => {
    const parseHTML = Column.config.parseHTML?.();
    expect(parseHTML?.[0].tag).toBe('div[data-type="column"]');
  });
});
