import { describe, it, expect } from 'vitest';

import {
  convertBlockType,
  duplicateBlock,
  getAvailableConversions,
  formatBlockTypeName,
  getBlockColorStyle,
} from '../block-utils';

describe('block-utils', () => {
  describe('convertBlockType', () => {
    it('should convert paragraph to heading', () => {
      const block: any = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello', styles: {} }],
        children: [],
      };

      const converted = convertBlockType(block, 'heading');
      expect(converted.type).toBe('heading');
      expect(converted.props).toEqual({ level: 1 });
      expect(converted.content).toBe(block.content);
    });

    it('should convert to checkListItem with default props', () => {
      const block: any = { type: 'paragraph', content: [], children: [] };
      const converted = convertBlockType(block, 'checkListItem');

      expect(converted.type).toBe('checkListItem');
      expect(converted.props).toEqual({ checked: false });
    });

    it('should convert to callout with default emoji', () => {
      const block: any = { type: 'paragraph', content: [], children: [] };
      const converted = convertBlockType(block, 'callout');

      expect(converted.type).toBe('callout');
      expect(converted.props).toEqual({
        emoji: '💡',
        backgroundColor: 'default',
      });
    });
  });

  describe('duplicateBlock', () => {
    it('should deep copy block structure', () => {
      const block: any = {
        type: 'paragraph',
        props: { color: 'red' },
        content: [{ text: 'Deep' }],
        children: [{ type: 'text', content: 'Child' }],
      };

      const duplicate = duplicateBlock(block);

      expect(duplicate).not.toBe(block);
      expect(duplicate.props).not.toBe(block.props);
      expect(duplicate.props).toEqual(block.props);

      expect(duplicate.children).toHaveLength(1);
      expect(duplicate.children![0]).not.toBe(block.children[0]);
    });
  });

  describe('getAvailableConversions', () => {
    it('should return valid conversions for paragraph', () => {
      const updates = getAvailableConversions('paragraph');
      expect(updates).toContain('heading');
      expect(updates).toContain('bulletListItem');
    });

    it('should return empty array for unknown type', () => {
      const updates = getAvailableConversions('unknown');
      expect(updates).toEqual([]);
    });
  });

  describe('formatBlockTypeName', () => {
    it('should return human readable names', () => {
      expect(formatBlockTypeName('checkListItem')).toBe('To-do list');
      expect(formatBlockTypeName('heading')).toBe('Heading');
    });

    it('should fallback to capitalized type', () => {
      expect(formatBlockTypeName('unknownBlock')).toBe('UnknownBlock');
    });
  });

  describe('getBlockColorStyle', () => {
    it('should return correct color values', () => {
      expect(getBlockColorStyle('red')).toBe('rgb(253, 235, 236)');
    });

    it('should return dark mode colors', () => {
      expect(getBlockColorStyle('red', true)).toBe('rgb(89, 65, 65)');
    });

    it('should fallback to default if color not found', () => {
      expect(getBlockColorStyle('nonexistent')).toBe('transparent');
    });
  });
});
