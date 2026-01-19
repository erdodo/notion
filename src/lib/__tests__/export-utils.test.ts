import { describe, it, expect } from 'vitest'
import {
    blocksToMarkdown,
    blocksToHTML,
    formatCellValueForCSV
} from '../export-utils'

describe('export-utils', () => {
  describe('blocksToMarkdown', () => {
    it('should handle empty array', () => {
      expect(blocksToMarkdown([])).toBe('')
    })

    it('should convert paragraph to markdown', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello World', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('Hello World')
    })

    it('should convert heading to markdown', () => {
      const blocks = [{
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: 'Title', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('## Title')
    })

    it('should convert bullet list item', () => {
      const blocks = [{
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Item 1', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('- Item 1')
    })

    it('should convert numbered list item', () => {
      const blocks = [{
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'Item 1', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('1. Item 1')
    })

    it('should convert checkbox with checked state', () => {
      const blocks = [{
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Task', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('- [x]')
      expect(result).toContain('Task')
    })

    it('should convert checkbox with unchecked state', () => {
      const blocks = [{
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Task', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('- [ ]')
    })

    it('should convert code block', () => {
      const blocks = [{
        type: 'codeBlock',
        props: { language: 'javascript' },
        content: [{ type: 'text', text: 'const x = 1', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('```javascript')
      expect(result).toContain('const x = 1')
      expect(result).toContain('```')
    })

    it('should convert quote', () => {
      const blocks = [{
        type: 'quote',
        content: [{ type: 'text', text: 'Quote text', styles: {} }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('> Quote text')
    })

    it('should convert divider', () => {
      const blocks = [{
        type: 'divider',
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('---')
    })

    it('should convert bold text', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'bold', styles: { bold: true } }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('**bold**')
    })

    it('should convert italic text', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'italic', styles: { italic: true } }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('*italic*')
    })

    it('should convert strikethrough text', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'strike', styles: { strike: true } }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('~~strike~~')
    })

    it('should convert code text', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'code', styles: { code: true } }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('`code`')
    })

    it('should convert links', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'link', href: 'https://example.com', content: [{ type: 'text', text: 'Link' }] }],
        children: []
      }]
      const result = blocksToMarkdown(blocks)
      expect(result).toContain('[Link]')
      expect(result).toContain('(https://example.com)')
    })
  })

  describe('blocksToHTML', () => {
    it('should generate valid HTML document', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Test', styles: {} }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'My Document')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('<title>My Document</title>')
      expect(result).toContain('</html>')
    })

    it('should include title in HTML body', () => {
      const blocks = []
      const result = blocksToHTML(blocks, 'Test Title')
      expect(result).toContain('<h1>Test Title</h1>')
    })

    it('should escape HTML special characters in title', () => {
      const blocks = []
      const result = blocksToHTML(blocks, '<script>alert("xss")</script>')
      expect(result).toContain('&lt;script&gt;')
      expect(result).not.toContain('<script>')
    })

    it('should convert paragraph to HTML', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello', styles: {} }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('<p>Hello</p>')
    })

    it('should convert heading to HTML', () => {
      const blocks = [{
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: 'Heading', styles: {} }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('<h2>Heading</h2>')
    })

    it('should convert checkbox with checked state', () => {
      const blocks = [{
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Task', styles: {} }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('checked')
      expect(result).toContain('disabled')
    })

    it('should convert bold text to strong', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'bold', styles: { bold: true } }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('<strong>bold</strong>')
    })

    it('should convert italic text to em', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'italic', styles: { italic: true } }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('<em>italic</em>')
    })

    it('should escape HTML in content', () => {
      const blocks = [{
        type: 'paragraph',
        content: [{ type: 'text', text: '<script>', styles: {} }],
        children: []
      }]
      const result = blocksToHTML(blocks, 'Test')
      expect(result).toContain('&lt;script&gt;')
      expect(result).not.toContain('<script>')
    })
  })

  describe('formatCellValueForCSV', () => {
    it('should return empty string for null', () => {
      expect(formatCellValueForCSV(null, 'TEXT')).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatCellValueForCSV(undefined, 'TEXT')).toBe('')
    })

    it('should format TEXT type', () => {
      expect(formatCellValueForCSV('Hello', 'TEXT')).toBe('Hello')
    })

    it('should format TITLE type', () => {
      expect(formatCellValueForCSV('Title', 'TITLE')).toBe('Title')
    })

    it('should format NUMBER type', () => {
      expect(formatCellValueForCSV(42, 'NUMBER')).toBe('42')
    })

    it('should format CHECKBOX true', () => {
      expect(formatCellValueForCSV(true, 'CHECKBOX')).toBe('Yes')
    })

    it('should format CHECKBOX false', () => {
      expect(formatCellValueForCSV(false, 'CHECKBOX')).toBe('No')
    })

    it('should format DATE', () => {
      const date = new Date('2024-01-15')
      const result = formatCellValueForCSV(date.toISOString(), 'DATE')
      expect(result).toBeDefined()
      expect(result).not.toBe('')
    })

    it('should format SELECT', () => {
      expect(formatCellValueForCSV('Option1', 'SELECT')).toBe('Option1')
    })

    it('should format MULTI_SELECT with array', () => {
      const result = formatCellValueForCSV(['Option1', 'Option2'], 'MULTI_SELECT')
      expect(result).toBe('Option1, Option2')
    })

    it('should format MULTI_SELECT with string', () => {
      expect(formatCellValueForCSV('Option1', 'MULTI_SELECT')).toBe('Option1')
    })

    it('should format CREATED_TIME', () => {
      const date = new Date().toISOString()
      const result = formatCellValueForCSV(date, 'CREATED_TIME')
      expect(result).toBeDefined()
    })

    it('should format UPDATED_TIME', () => {
      const date = new Date().toISOString()
      const result = formatCellValueForCSV(date, 'UPDATED_TIME')
      expect(result).toBeDefined()
    })

    it('should format RELATION with linkedRowIds', () => {
      const result = formatCellValueForCSV(
        { linkedRowIds: ['id1', 'id2'] },
        'RELATION'
      )
      expect(result).toBe('id1, id2')
    })

    it('should format ROLLUP array', () => {
      const result = formatCellValueForCSV([1, 2, 3], 'ROLLUP')
      expect(result).toBe('1, 2, 3')
    })

    it('should format FORMULA', () => {
      expect(formatCellValueForCSV('Result', 'FORMULA')).toBe('Result')
    })

    it('should handle value property', () => {
      expect(formatCellValueForCSV({ value: 'test' }, 'TEXT')).toBe('test')
    })

    it('should format unknown type as string', () => {
      expect(formatCellValueForCSV('Unknown', 'UNKNOWN_TYPE')).toBe('Unknown')
    })
  })
})
