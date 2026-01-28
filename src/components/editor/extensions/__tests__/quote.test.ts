import { describe, it, expect } from 'vitest';
import { Quote } from '../quote';

describe('Quote Extension', () => {
  it('should be defined', () => {
    expect(Quote).toBeDefined();
  });

  it('should have correct name', () => {
    expect(Quote.name).toBe('blockquote');
  });

  it('should parse blockquote HTML tag', () => {
    const parseHTML = Quote.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.some((rule: any) => rule.tag === 'blockquote')).toBe(true);
  });

  it('should have setBlockquote command', () => {
    expect(Quote.config.addCommands).toBeDefined();
  });
});
