import { describe, it, expect } from 'vitest';
import { Divider } from '../divider';

describe('Divider Extension', () => {
  it('should be defined', () => {
    expect(Divider).toBeDefined();
  });

  it('should have correct name', () => {
    expect(Divider.name).toBe('horizontalRule');
  });

  it('should parse hr HTML tag', () => {
    const parseHTML = Divider.config.parseHTML?.();
    expect(parseHTML).toBeDefined();
    expect(parseHTML?.some((rule: any) => rule.tag === 'hr')).toBe(true);
  });

  it('should have setHorizontalRule command', () => {
    expect(Divider.config.addCommands).toBeDefined();
  });
});
