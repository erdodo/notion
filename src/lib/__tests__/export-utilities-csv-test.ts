import { describe, it, expect } from 'vitest';

import { formatCellValueForCSV } from '../export-utils';

describe('export-utils', () => {
  describe('formatCellValueForCSV', () => {
    describe('Edge Cases', () => {
      it('should return empty string for null', () => {
        expect(formatCellValueForCSV(null, 'TEXT')).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(formatCellValueForCSV(undefined, 'TEXT')).toBe('');
      });
    });

    describe('Simple Types', () => {
      it('should format TEXT type', () => {
        expect(formatCellValueForCSV('Hello', 'TEXT')).toBe('Hello');
      });

      it('should format TITLE type', () => {
        expect(formatCellValueForCSV('Title', 'TITLE')).toBe('Title');
      });

      it('should format NUMBER type', () => {
        expect(formatCellValueForCSV(42, 'NUMBER')).toBe('42');
      });

      it('should format CHECKBOX true', () => {
        expect(formatCellValueForCSV(true, 'CHECKBOX')).toBe('Yes');
      });

      it('should format CHECKBOX false', () => {
        expect(formatCellValueForCSV(false, 'CHECKBOX')).toBe('No');
      });
    });

    describe('Complex Types', () => {
      it('should format DATE', () => {
        const date = new Date('2024-01-15');
        const result = formatCellValueForCSV(date.toISOString(), 'DATE');
        expect(result).toBeDefined();
        expect(result).not.toBe('');
      });

      it('should format SELECT', () => {
        expect(formatCellValueForCSV('Option1', 'SELECT')).toBe('Option1');
      });

      it('should format MULTI_SELECT with array', () => {
        const result = formatCellValueForCSV(
          ['Option1', 'Option2'],
          'MULTI_SELECT'
        );
        expect(result).toBe('Option1, Option2');
      });

      it('should format MULTI_SELECT with string', () => {
        expect(formatCellValueForCSV('Option1', 'MULTI_SELECT')).toBe(
          'Option1'
        );
      });
    });

    describe('Metadata and Relations', () => {
      it('should format CREATED_TIME', () => {
        const date = new Date().toISOString();
        const result = formatCellValueForCSV(date, 'CREATED_TIME');
        expect(result).toBeDefined();
      });

      it('should format UPDATED_TIME', () => {
        const date = new Date().toISOString();
        const result = formatCellValueForCSV(date, 'UPDATED_TIME');
        expect(result).toBeDefined();
      });

      it('should format RELATION with linkedRowIds', () => {
        const result = formatCellValueForCSV(
          { linkedRowIds: ['id1', 'id2'] },
          'RELATION'
        );
        expect(result).toBe('id1, id2');
      });

      it('should format ROLLUP array', () => {
        const result = formatCellValueForCSV([1, 2, 3], 'ROLLUP');
        expect(result).toBe('1, 2, 3');
      });

      it('should format FORMULA', () => {
        expect(formatCellValueForCSV('Result', 'FORMULA')).toBe('Result');
      });

      it('should handle value property', () => {
        expect(formatCellValueForCSV({ value: 'test' }, 'TEXT')).toBe('test');
      });

      it('should format unknown type as string', () => {
        expect(formatCellValueForCSV('Unknown', 'UNKNOWN_TYPE')).toBe(
          'Unknown'
        );
      });
    });
  });
});
