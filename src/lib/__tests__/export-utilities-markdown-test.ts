import { describe, it, expect } from 'vitest';

import { blocksToMarkdown } from '../export-utils';

describe('export-utils', () => {
  describe('blocksToMarkdown', () => {
    describe('Basic Conversion', () => {
      it('should handle empty array', () => {
        expect(blocksToMarkdown([])).toBe('');
      });

      it('should convert paragraph to markdown', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('Hello World');
      });

      it('should convert heading to markdown', () => {
        const blocks = [
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: 'Title', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('## Title');
      });
    });

    describe('Lists', () => {
      it('should convert bullet list item', () => {
        const blocks = [
          {
            type: 'bulletListItem',
            content: [{ type: 'text', text: 'Item 1', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('- Item 1');
      });

      it('should convert numbered list item', () => {
        const blocks = [
          {
            type: 'numberedListItem',
            content: [{ type: 'text', text: 'Item 1', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('1. Item 1');
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
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('- [x]');
        expect(result).toContain('Task');
      });

      it('should convert checkbox with unchecked state', () => {
        const blocks = [
          {
            type: 'checkListItem',
            props: { checked: false },
            content: [{ type: 'text', text: 'Task', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('- [ ]');
      });
    });

    describe('Block Types', () => {
      it('should convert code block', () => {
        const blocks = [
          {
            type: 'codeBlock',
            props: { language: 'javascript' },
            content: [{ type: 'text', text: 'const x = 1', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('```javascript');
        expect(result).toContain('const x = 1');
        expect(result).toContain('```');
      });

      it('should convert quote', () => {
        const blocks = [
          {
            type: 'quote',
            content: [{ type: 'text', text: 'Quote text', styles: {} }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('> Quote text');
      });

      it('should convert divider', () => {
        const blocks = [
          {
            type: 'divider',
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('---');
      });
    });

    describe('Inline Formatting', () => {
      it('should convert bold text', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'bold', styles: { bold: true } }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('**bold**');
      });

      it('should convert italic text', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'italic', styles: { italic: true } },
            ],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('*italic*');
      });

      it('should convert strikethrough text', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'strike', styles: { strike: true } },
            ],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('~~strike~~');
      });

      it('should convert code text', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'code', styles: { code: true } }],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('`code`');
      });

      it('should convert links', () => {
        const blocks = [
          {
            type: 'paragraph',
            content: [
              {
                type: 'link',
                href: 'https://example.com',
                content: [{ type: 'text', text: 'Link' }],
              },
            ],
            children: [],
          },
        ];
        const result = blocksToMarkdown(blocks);
        expect(result).toContain('[Link]');
        expect(result).toContain('(https://example.com)');
      });
    });
  });
});
