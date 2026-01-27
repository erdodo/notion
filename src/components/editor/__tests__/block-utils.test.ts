import { describe, it, expect } from 'vitest';

import {
  getAvailableConversions,
  convertBlockType,
  duplicateBlock,
  getBlockColorStyle,
  formatBlockTypeName,
} from '@/lib/block-utils';

describe('Block Utils', () => {
  describe('getAvailableConversions', () => {
    it('returns conversions for paragraph', () => {
      const conversions = getAvailableConversions('paragraph');
      expect(conversions).toContain('heading');
      expect(conversions).toContain('bulletListItem');
    });

    it('returns empty array for unknown type', () => {
      expect(getAvailableConversions('unknown')).toEqual([]);
    });
  });

  describe('convertBlockType', () => {
    it('converts to heading with level 1', () => {
      const block: any = { type: 'paragraph', content: [], children: [] };
      const result = convertBlockType(block, 'heading');
      expect(result.type).toBe('heading');
      expect(result.props).toEqual({ level: 1 });
    });

    it('converts to checkListItem with checked false', () => {
      const block: any = { type: 'paragraph', content: [], children: [] };
      const result = convertBlockType(block, 'checkListItem');
      expect(result.type).toBe('checkListItem');
      expect(result.props).toEqual({ checked: false });
    });
  });

  describe('duplicateBlock', () => {
    it('duplicates block content and props', () => {
      const block: any = {
        type: 'paragraph',
        props: { color: 'red' },
        content: [{ type: 'text', text: 'hello', styles: {} }],
        children: [],
      };
      const result = duplicateBlock(block);
      expect(result.type).toBe('paragraph');
      expect(result.props).toEqual({ color: 'red' });
      expect(result.content).toEqual(block.content);
      expect(result).not.toBe(block);
    });
  });

  describe('getBlockColorStyle', () => {
    it('returns correct color for light mode', () => {
      expect(getBlockColorStyle('red', false)).toBe('rgb(253, 235, 236)');
    });

    it('returns correct color for dark mode', () => {
      expect(getBlockColorStyle('red', true)).toBe('rgb(89, 65, 65)');
    });

    it('returns transparent for default', () => {
      expect(getBlockColorStyle('default')).toBe('transparent');
    });
  });

  describe('formatBlockTypeName', () => {
    it('formats paragraph as Text', () => {
      expect(formatBlockTypeName('paragraph')).toBe('Text');
    });

    it('formats unknown type by maximizing first letter', () => {
      expect(formatBlockTypeName('custom')).toBe('Custom');
    });
  });
});
