import { describe, it, expect } from 'vitest';

import { parseMarkdownToBlocks, parseCSVToDatabase } from '../import-utils';

describe('import-utils', () => {
  describe('parseMarkdownToBlocks', () => {
    it('should parse headings correctly', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('heading');
      expect(blocks[0].props).toEqual(expect.objectContaining({ level: 1 }));
      expect(blocks[0].content).toEqual([
        { type: 'text', text: 'Heading 1', styles: {} },
      ]);

      expect(blocks[1].props).toEqual(expect.objectContaining({ level: 2 }));
      expect(blocks[2].props).toEqual(expect.objectContaining({ level: 3 }));
    });

    it('should parse lists correctly', () => {
      const markdown = '- Item 1\n* Item 2';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('bulletListItem');
      expect(blocks[0].content).toEqual([
        { type: 'text', text: 'Item 1', styles: {} },
      ]);
      expect(blocks[1].type).toBe('bulletListItem');
    });

    it('should parse checklists correctly', () => {
      const markdown = '- [ ] Unchecked\n- [x] Checked';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('checkListItem');
      expect(blocks[0].props).toEqual(
        expect.objectContaining({ checked: false })
      );

      expect(blocks[1].type).toBe('checkListItem');
      expect(blocks[1].props).toEqual(
        expect.objectContaining({ checked: true })
      );
    });

    it('should parse code blocks correctly', () => {
      const markdown = '```typescript\nconst a = 1;\n```';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('codeBlock');
      expect(blocks[0].props).toEqual(
        expect.objectContaining({ language: 'typescript' })
      );

      const text = (blocks[0].content as any[])[0].text;
      expect(text).toBe('const a = 1;');
    });

    it('should parse blockquotes and callouts', () => {
      const markdown = '> Normal quote\n> 💡 Callout idea';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('quote');
      expect(blocks[0].content).toEqual([
        { type: 'text', text: 'Normal quote', styles: {} },
      ]);

      expect(blocks[1].type).toBe('callout');
      expect(blocks[1].props).toEqual(expect.objectContaining({ icon: '💡' }));
      expect(blocks[1].content).toEqual([
        { type: 'text', text: 'Callout idea', styles: {} },
      ]);
    });

    it('should parse images', () => {
      const markdown = '![Alt text](https://example.com/image.png)';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('image');
      expect(blocks[0].props).toEqual(
        expect.objectContaining({
          url: 'https://example.com/image.png',
          caption: 'Alt text',
        })
      );
    });

    it('should parse dividers', () => {
      const markdown = '---\n***\n___';
      const blocks = parseMarkdownToBlocks(markdown);

      expect(blocks).toHaveLength(3);
      for (const b of blocks) expect(b.type).toBe('divider');
    });

    it('should handle empty lines', () => {
      const markdown = 'Line 1\n\nLine 2';
      const blocks = parseMarkdownToBlocks(markdown);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('paragraph');
    });

    it('should parse inline styles', () => {
      const markdown = '**Bold** *Italic* ~~Strike~~ `Code` [Link](url)';

      const blocks = parseMarkdownToBlocks(markdown);
      const content = blocks[0].content as any[];

      expect(content[0].text).toBe('Bold Italic Strike Code Link');
    });
  });

  describe('parseCSVToDatabase', () => {
    it('should parse simple CSV', () => {
      const csv = 'Name,Age\nJohn,30\nJane,25';
      const result = parseCSVToDatabase(csv);

      expect(result.headers).toEqual(['Name', 'Age']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ Name: 'John', Age: '30' });
      expect(result.rows[1]).toEqual({ Name: 'Jane', Age: '25' });
    });

    it('should handle quoted values with commas', () => {
      const csv = 'Name,"City, Country"\n"Doe, John","New York, USA"';
      const result = parseCSVToDatabase(csv);

      expect(result.headers).toEqual(['Name', 'City, Country']);
      expect(result.rows[0]).toEqual({
        Name: 'Doe, John',
        'City, Country': 'New York, USA',
      });
    });

    it('should handle empty csv', () => {
      const result = parseCSVToDatabase('');
      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([]);
    });

    it('should handle missing values', () => {
      const csv = 'A,B\n1';
      const result = parseCSVToDatabase(csv);
      expect(result.rows[0]).toEqual({ A: '1', B: '' });
    });
  });
});
