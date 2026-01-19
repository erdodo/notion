import { describe, it, expect } from 'vitest'
import { blocksToMarkdown, blocksToHTML, formatCellValueForCSV } from '@/lib/export-utils'
import { parseMarkdownToBlocks, parseCSVToDatabase } from '@/lib/import-utils'

describe('Export Utils', () => {
    describe('blocksToMarkdown', () => {
        it('converts heading block', () => {
            const blocks: any = [{ type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Hello' }] }]
            const md = blocksToMarkdown(blocks)
            expect(md).toBe('# Hello')
        })

        it('converts paragraph block', () => {
            const blocks: any = [{ type: 'paragraph', content: [{ type: 'text', text: 'World' }] }]
            const md = blocksToMarkdown(blocks)
            expect(md).toBe('World')
        })
    })

    describe('blocksToHTML', () => {
        it('converts basic blocks to HTML', () => {
            const blocks: any = [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
            const html = blocksToHTML(blocks, 'Title')
            expect(html).toContain('<h1>Title</h1>')
            expect(html).toContain('<p>Hello</p>')
        })
    })

    describe('formatCellValueForCSV', () => {
        it('formats string correctly', () => {
            expect(formatCellValueForCSV('test', 'TEXT')).toBe('test')
        })

        it('formats array correctly for multi-select', () => {
            expect(formatCellValueForCSV(['a', 'b'], 'MULTI_SELECT')).toBe('a, b')
        })
    })
})

describe('Import Utils', () => {
    describe('parseMarkdownToBlocks', () => {
        it('parses heading', () => {
            const blocks = parseMarkdownToBlocks('# Hello')
            expect(blocks[0].type).toBe('heading')
            // @ts-ignore
            expect(blocks[0].props.level).toBe(1)
        })
    })

    describe('parseCSVToDatabase', () => {
        it('parses basic CSV', () => {
            const csv = 'Name,Age\nJohn,30\nJane,25'
            const { headers, rows } = parseCSVToDatabase(csv)
            expect(headers).toEqual(['Name', 'Age'])
            expect(rows).toHaveLength(2)
            expect(rows[0]['Name']).toBe('John')
            expect(rows[0]['Age']).toBe('30')
        })
    })
})
