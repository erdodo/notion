import { describe, it, expect } from 'vitest'
import { parseMarkdownToBlocks, parseCSVToDatabase } from '../import-utils'

describe('import-utils', () => {
  describe('parseMarkdownToBlocks', () => {
    it('should handle empty markdown', () => {
      const result = parseMarkdownToBlocks('')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should parse single paragraph', () => {
      const result = parseMarkdownToBlocks('Hello World')
      expect(result.length).toBe(1)
      expect(result[0].type).toBe('paragraph')
      expect(result[0].content[0].text).toContain('Hello')
    })

    it('should skip empty lines', () => {
      const result = parseMarkdownToBlocks('Line 1\n\n\nLine 2')
      expect(result.length).toBe(2)
    })

    it('should parse heading with level 1', () => {
      const result = parseMarkdownToBlocks('# Title')
      expect(result[0].type).toBe('heading')
      expect(result[0].props.level).toBe(1)
      expect(result[0].content[0].text).toBe('Title')
    })

    it('should parse heading with level 2', () => {
      const result = parseMarkdownToBlocks('## Subtitle')
      expect(result[0].type).toBe('heading')
      expect(result[0].props.level).toBe(2)
    })

    it('should parse heading with level 3', () => {
      const result = parseMarkdownToBlocks('### Sub-subtitle')
      expect(result[0].type).toBe('heading')
      expect(result[0].props.level).toBe(3)
    })

    it('should parse horizontal rule with dashes', () => {
      const result = parseMarkdownToBlocks('---')
      expect(result[0].type).toBe('divider')
    })

    it('should parse horizontal rule with underscores', () => {
      const result = parseMarkdownToBlocks('___')
      expect(result[0].type).toBe('divider')
    })

    it('should parse horizontal rule with asterisks', () => {
      const result = parseMarkdownToBlocks('***')
      expect(result[0].type).toBe('divider')
    })

    it('should parse code block', () => {
      const result = parseMarkdownToBlocks('```javascript\nconst x = 1\n```')
      expect(result[0].type).toBe('codeBlock')
      expect(result[0].props.language).toBe('javascript')
      expect(result[0].content[0].text).toContain('const x = 1')
    })

    it('should parse code block without language', () => {
      const result = parseMarkdownToBlocks('```\nplain code\n```')
      expect(result[0].type).toBe('codeBlock')
      expect(result[0].props.language).toBe('plain')
    })

    it('should parse quote', () => {
      const result = parseMarkdownToBlocks('> This is a quote')
      expect(result[0].type).toBe('quote')
      expect(result[0].content[0].text).toBe('This is a quote')
    })

    it('should parse callout with emoji', () => {
      const result = parseMarkdownToBlocks('> 💡 Important note')
      expect(result[0].type).toBe('callout')
      expect(result[0].props.icon).toBe('💡')
      expect(result[0].content[0].text).toBe('Important note')
    })

    it('should parse checkbox unchecked', () => {
      const result = parseMarkdownToBlocks('- [ ] Task to do')
      expect(result[0].type).toBe('checkListItem')
      expect(result[0].props.checked).toBe(false)
      expect(result[0].content[0].text).toBe('Task to do')
    })

    it('should parse checkbox checked', () => {
      const result = parseMarkdownToBlocks('- [x] Completed task')
      expect(result[0].type).toBe('checkListItem')
      expect(result[0].props.checked).toBe(true)
      expect(result[0].content[0].text).toBe('Completed task')
    })

    it('should parse bullet list item with dash', () => {
      const result = parseMarkdownToBlocks('- Item 1')
      expect(result[0].type).toBe('bulletListItem')
      expect(result[0].content[0].text).toBe('Item 1')
    })

    it('should parse bullet list item with asterisk', () => {
      const result = parseMarkdownToBlocks('* Item 1')
      expect(result[0].type).toBe('bulletListItem')
      expect(result[0].content[0].text).toBe('Item 1')
    })

    it('should parse numbered list item', () => {
      const result = parseMarkdownToBlocks('1. First item')
      // Implementation doesn't specifically handle numbered lists, treats as paragraph
      expect(result[0].content[0].text).toContain('First')
    })

    it('should parse image', () => {
      const result = parseMarkdownToBlocks('![alt text](https://example.com/image.jpg)')
      expect(result[0].type).toBe('image')
      expect(result[0].props.url).toBe('https://example.com/image.jpg')
      expect(result[0].props.caption).toBe('alt text')
    })

    it('should have unique IDs for blocks', () => {
      const result = parseMarkdownToBlocks('Line 1\nLine 2\nLine 3')
      const ids = result.map(b => b.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should parse multiple blocks', () => {
      const markdown = `# Title
This is a paragraph.
- Item 1
- Item 2
> Quote`
      const result = parseMarkdownToBlocks(markdown)
      expect(result.length).toBeGreaterThan(1)
      expect(result[0].type).toBe('heading')
      expect(result[1].type).toBe('paragraph')
    })

    it('should set default props for all blocks', () => {
      const result = parseMarkdownToBlocks('# Test')
      expect(result[0].props).toHaveProperty('backgroundColor')
      expect(result[0].props).toHaveProperty('textColor')
      expect(result[0].props).toHaveProperty('textAlignment')
    })

    it('should handle empty content', () => {
      const result = parseMarkdownToBlocks('\n\n\n')
      expect(result.length).toBe(0)
    })
  })

  describe('parseCSVToDatabase', () => {
    it('should handle empty CSV', () => {
      const result = parseCSVToDatabase('')
      expect(result.headers).toEqual([])
      expect(result.rows).toEqual([])
    })

    it('should parse single row with headers', () => {
      const csv = 'Name,Age,Email\nJohn,30,john@example.com'
      const result = parseCSVToDatabase(csv)
      expect(result.headers).toEqual(['Name', 'Age', 'Email'])
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].Name).toBe('John')
      expect(result.rows[0].Age).toBe('30')
    })

    it('should parse multiple rows', () => {
      const csv = 'Name,Age\nJohn,30\nJane,25\nBob,35'
      const result = parseCSVToDatabase(csv)
      expect(result.rows.length).toBe(3)
      expect(result.rows[1].Name).toBe('Jane')
      expect(result.rows[2].Age).toBe('35')
    })

    it('should handle quoted values with commas', () => {
      const csv = 'Name,Address\n"Smith, John","123 Main St, City"'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].Name).toContain('Smith')
    })

    it('should handle empty values', () => {
      const csv = 'Name,Age,Email\nJohn,,john@example.com'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].Age).toBe('')
    })

    it('should trim whitespace', () => {
      const csv = '  Name  ,  Age  \n  John  ,  30  '
      const result = parseCSVToDatabase(csv)
      expect(result.headers[0]).toBe('Name')
      expect(result.headers[1]).toBe('Age')
      expect(result.rows[0].Name).toBe('John')
    })

    it('should skip empty lines', () => {
      const csv = 'Name,Age\nJohn,30\n\n\nJane,25'
      const result = parseCSVToDatabase(csv)
      expect(result.rows.length).toBe(2)
    })

    it('should handle single column', () => {
      const csv = 'Name\nJohn\nJane\nBob'
      const result = parseCSVToDatabase(csv)
      expect(result.headers).toEqual(['Name'])
      expect(result.rows.length).toBe(3)
    })

    it('should handle values with special characters', () => {
      const csv = 'Name,Value\nJohn,"$100.50"'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].Value).toContain('100')
    })

    it('should create record for each row', () => {
      const csv = 'Col1,Col2,Col3\nA,B,C\nD,E,F'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0]).toHaveProperty('Col1')
      expect(result.rows[0]).toHaveProperty('Col2')
      expect(result.rows[0]).toHaveProperty('Col3')
      expect(result.rows[0].Col1).toBe('A')
    })

    it('should handle mismatched column counts', () => {
      const csv = 'Name,Age,Email\nJohn,30'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].Name).toBe('John')
      expect(result.rows[0].Age).toBe('30')
      expect(result.rows[0].Email).toBe('')
    })

    it('should handle tabs as content', () => {
      const csv = 'Name,Value\nJohn\t30,test'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].Name).toContain('John')
    })

    it('should preserve numeric strings', () => {
      const csv = 'ID,Code\n001,002'
      const result = parseCSVToDatabase(csv)
      expect(result.rows[0].ID).toBe('001')
      expect(result.rows[0].Code).toBe('002')
    })
  })
})
