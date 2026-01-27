import { describe, it, expect } from 'vitest';

import { getOptionColors, NOTION_COLORS } from '../notion-colors';

describe('notion-colors', () => {
  describe('NOTION_COLORS', () => {
    it('should contain all required color properties', () => {
      expect(NOTION_COLORS).toBeDefined();
      expect(Array.isArray(NOTION_COLORS)).toBe(true);
      expect(NOTION_COLORS.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each color', () => {
      for (const color of NOTION_COLORS) {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('value');
        expect(color).toHaveProperty('bg');
        expect(color).toHaveProperty('text');
        expect(color).toHaveProperty('dot');
        expect(typeof color.name).toBe('string');
        expect(typeof color.value).toBe('string');
        expect(typeof color.bg).toBe('string');
        expect(typeof color.text).toBe('string');
        expect(typeof color.dot).toBe('string');
      }
    });

    it('should contain default color', () => {
      expect(NOTION_COLORS.some((c) => c.name === 'default')).toBe(true);
    });

    it('should contain all standard colors', () => {
      const colorNames = [
        'gray',
        'brown',
        'orange',
        'yellow',
        'green',
        'blue',
        'purple',
        'pink',
        'red',
      ];
      for (const name of colorNames) {
        expect(NOTION_COLORS.some((c) => c.name === name)).toBe(true);
      }
    });

    it('should have tailwind class names', () => {
      for (const color of NOTION_COLORS) {
        expect(color.bg).toMatch(/^bg-/);
        expect(color.text).toMatch(/^text-/);
        expect(color.dot).toMatch(/^bg-/);
      }
    });
  });

  describe('getOptionColors', () => {
    it('should return color object for valid color value', () => {
      const result = getOptionColors('blue');
      expect(result).toBeDefined();
      expect(result.value).toBe('blue');
    });

    it('should return default color for invalid value', () => {
      const result = getOptionColors('invalid-color');
      expect(result).toBeDefined();
      expect(result).toBe(NOTION_COLORS[0]);
    });

    it('should return default color for empty string', () => {
      const result = getOptionColors('');
      expect(result).toBe(NOTION_COLORS[0]);
    });

    it('should work with all available colors', () => {
      for (const color of NOTION_COLORS) {
        const result = getOptionColors(color.value);
        expect(result.value).toBe(color.value);
      }
    });

    it('should have proper color attributes', () => {
      const result = getOptionColors('green');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('bg');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('dot');
    });

    it('should return first element (default) when color not found', () => {
      const result = getOptionColors('nonexistent');
      expect(result).toEqual(NOTION_COLORS[0]);
    });
  });
});
