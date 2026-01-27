import { describe, it, expect } from 'vitest';

import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });

    it('should merge single class', () => {
      expect(cn('p-4')).toBe('p-4');
    });

    it('should merge multiple classes', () => {
      expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
    });

    it('should handle conditional classes with objects', () => {
      expect(cn('px-2', { 'py-4': true, 'py-8': false })).toBe('px-2 py-4');
    });

    it('should handle array of classes', () => {
      expect(cn(['px-2', 'py-4'])).toBe('px-2 py-4');
    });

    it('should remove conflicting tailwind classes', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('should handle bg conflicts', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should handle complex combinations', () => {
      const result = cn(
        'px-2 py-1',
        'rounded-md',
        { 'bg-blue-500': true, 'text-white': true },
        'p-3'
      );

      expect(result).toContain('rounded-md');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).toContain('p-3');
    });

    it('should filter out undefined and null values', () => {
      expect(cn('px-2', undefined, null, 'py-4')).toBe('px-2 py-4');
    });

    it('should handle false values in objects', () => {
      expect(cn('px-2', { 'py-4': false })).toBe('px-2');
    });

    it('should handle nested arrays', () => {
      expect(cn(['px-2', ['py-4']], 'rounded')).toBe('px-2 py-4 rounded');
    });
  });
});
