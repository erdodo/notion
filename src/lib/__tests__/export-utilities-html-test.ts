import { describe, it, expect } from 'vitest';

import { blocksToHTML } from '../export-utils';

describe('export-utils', () => {
  describe('blocksToHTML', () => {
    it('should generate valid HTML document', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test', styles: {} }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'My Document');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>My Document</title>');
      expect(result).toContain('</html>');
    });

    it('should include title in HTML body', () => {
      const blocks: any[] = [];
      const result = blocksToHTML(blocks, 'Test Title');
      expect(result).toContain('<h1>Test Title</h1>');
    });

    it('should escape HTML special characters in title', () => {
      const blocks: any[] = [];
      const result = blocksToHTML(blocks, '<script>alert("xss")</script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should convert paragraph to HTML', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello', styles: {} }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('<p>Hello</p>');
    });

    it('should convert heading to HTML', () => {
      const blocks = [
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: 'Heading', styles: {} }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('<h2>Heading</h2>');
    });

    it('should convert checkbox with checked state', () => {
      const blocks = [
        {
          type: 'checkListItem',
          props: { checked: true },
          content: [{ type: 'text', text: 'Task', styles: {} }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('checked');
      expect(result).toContain('disabled');
    });

    it('should convert bold text to strong', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'bold', styles: { bold: true } }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should convert italic text to em', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'italic', styles: { italic: true } }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('<em>italic</em>');
    });

    it('should escape HTML in content', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '<script>', styles: {} }],
          children: [],
        },
      ];
      const result = blocksToHTML(blocks, 'Test');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });
  });
});
