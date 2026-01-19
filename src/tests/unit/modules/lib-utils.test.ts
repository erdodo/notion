import { describe, it, expect } from 'vitest'
import {
    getAvailableConversions,
    convertBlockType,
    duplicateBlock,
    getBlockColorStyle,
    formatBlockTypeName
} from '@/lib/block-utils'
import { computeRollup, formatRollupValue } from '@/lib/rollup-service'
import { getEmbedUrl, isEmbeddable, isVideoUrl } from '@/lib/embed-utils'
import { blocksToMarkdown, blocksToHTML, formatCellValueForCSV } from '@/lib/export-utils'
import { parseMarkdownToBlocks, parseCSVToDatabase } from '@/lib/import-utils'

describe('Block Utilities', () => {
    describe('getAvailableConversions', () => {
        it('returns correct conversions for paragraph', () => {
            const result = getAvailableConversions('paragraph')
            expect(result).toContain('heading')
            expect(result).toContain('bulletListItem')
        })

        it('returns empty array for unknown type', () => {
            const result = getAvailableConversions('unknown')
            expect(result).toEqual([])
        })
    })

    describe('convertBlockType', () => {
        const mockBlock: any = {
            id: '1',
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello', styles: {} }],
            children: []
        }

        it('converts to heading and adds level prop', () => {
            const result = convertBlockType(mockBlock, 'heading')
            expect(result.type).toBe('heading')
            expect(result.props).toEqual({ level: 1 })
            expect(result.content).toEqual(mockBlock.content)
        })

        it('converts to checkListItem and adds checked prop', () => {
            const result = convertBlockType(mockBlock, 'checkListItem')
            expect(result.type).toBe('checkListItem')
            expect(result.props).toEqual({ checked: false })
        })

        it('converts to callout and adds emoji/bg props', () => {
            const result = convertBlockType(mockBlock, 'callout')
            expect(result.type).toBe('callout')
            expect(result.props).toMatchObject({ emoji: '💡', backgroundColor: 'default' })
        })
    })

    describe('duplicateBlock', () => {
        it('duplicates a block and its children', () => {
            const mockBlock: any = {
                type: 'bulletListItem',
                props: { textColor: 'default' },
                content: [{ type: 'text', text: 'Parent', styles: {} }],
                children: [
                    {
                        type: 'paragraph',
                        props: {},
                        content: [{ type: 'text', text: 'Child', styles: {} }],
                        children: []
                    }
                ]
            }
            const result = duplicateBlock(mockBlock)
            expect(result.type).toBe(mockBlock.type)
            expect(result.content).toEqual(mockBlock.content)
            expect(result.children).toHaveLength(1)
            expect(result.children[0].content).toEqual(mockBlock.children[0].content)
        })
    })

    describe('getBlockColorStyle', () => {
        it('returns light mode background color', () => {
            const result = getBlockColorStyle('blue', false)
            expect(result).toBe('rgb(231, 243, 248)')
        })

        it('returns dark mode background color', () => {
            const result = getBlockColorStyle('blue', true)
            expect(result).toBe('rgb(45, 66, 86)')
        })

        it('returns default color for unknown color', () => {
            const result = getBlockColorStyle('unknown' as any, false)
            expect(result).toBe('transparent')
        })
    })

    describe('formatBlockTypeName', () => {
        it('formats known types correctly', () => {
            expect(formatBlockTypeName('paragraph')).toBe('Text')
            expect(formatBlockTypeName('bulletListItem')).toBe('Bulleted list')
        })

        it('capitalizes unknown types', () => {
            expect(formatBlockTypeName('newType')).toBe('NewType')
        })
    })
})

describe('Rollup Service', () => {
    const values = [10, 20, 30, '', null, 20]

    describe('computeRollup', () => {
        it('computes count', () => {
            expect(computeRollup(values, 'count')).toBe(6)
        })

        it('computes count_values', () => {
            expect(computeRollup(values, 'count_values')).toBe(4)
        })

        it('computes count_unique', () => {
            expect(computeRollup(values, 'count_unique')).toBe(3) // 10, 20, 30
        })

        it('computes sum', () => {
            expect(computeRollup(values, 'sum')).toBe(80)
        })

        it('computes average', () => {
            expect(computeRollup(values, 'average')).toBe(20)
        })

        it('computes median', () => {
            expect(computeRollup([10, 30, 20], 'median')).toBe(20)
            expect(computeRollup([10, 20, 30, 40], 'median')).toBe(25)
        })

        it('computes min and max', () => {
            expect(computeRollup(values, 'min')).toBe(10)
            expect(computeRollup(values, 'max')).toBe(30)
        })

        it('computes range', () => {
            expect(computeRollup(values, 'range')).toBe(20)
        })

        it('computes percent_empty', () => {
            expect(computeRollup([1, '', null, 2], 'percent_empty')).toBe(50)
        })

        it('computes percent_not_empty', () => {
            expect(computeRollup([1, '', null, 2], 'percent_not_empty')).toBe(50)
        })

        it('shows original and unique', () => {
            expect(computeRollup([1, 2, 1], 'show_original')).toEqual([1, 2, 1])
            expect(computeRollup([1, 2, 1], 'show_unique')).toEqual([1, 2])
        })
    })

    describe('formatRollupValue', () => {
        it('formats percentages', () => {
            expect(formatRollupValue(50, 'percent_empty')).toBe('50%')
        })

        it('formats average with precision', () => {
            expect(formatRollupValue(10.556, 'average')).toBe('10.56')
        })

        it('formats lists', () => {
            expect(formatRollupValue([1, 2, 3], 'show_original')).toBe('1, 2, 3')
        })

        it('returns dash for null/undefined', () => {
            expect(formatRollupValue(null, 'sum')).toBe('-')
        })
    })
})

describe('Embed Utilities', () => {
    describe('getEmbedUrl', () => {
        it('converts youtube links', () => {
            expect(getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toContain('youtube.com/embed/')
            expect(getEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toContain('youtube.com/embed/')
        })

        it('converts vimeo links', () => {
            expect(getEmbedUrl('https://vimeo.com/123456')).toContain('player.vimeo.com/video/123456')
        })

        it('returns null for non-embeddable links', () => {
            expect(getEmbedUrl('https://google.com')).toBeNull()
        })
    })

    describe('isEmbeddable', () => {
        it('returns true for supported domains', () => {
            expect(isEmbeddable('https://youtube.com/watch?v=123')).toBe(true)
            expect(isEmbeddable('https://figma.com/file/123')).toBe(true)
        })
    })

    describe('isVideoUrl', () => {
        it('returns true for video services', () => {
            expect(isVideoUrl('https://youtube.com/watch?v=123')).toBe(true)
            expect(isVideoUrl('https://vimeo.com/123')).toBe(true)
        })

        it('returns false for non-video services', () => {
            expect(isVideoUrl('https://figma.com/file/123')).toBe(false)
        })
    })
})

describe('Export Utilities', () => {
    const mockBlocks: any[] = [
        { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Title', styles: {} }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello World', styles: {} }] },
        { type: 'checkListItem', props: { checked: true }, content: [{ type: 'text', text: 'Done', styles: {} }] }
    ]

    it('exports to markdown correctly', () => {
        const result = blocksToMarkdown(mockBlocks)
        expect(result).toContain('# Title')
        expect(result).toContain('Hello World')
        expect(result).toContain('- [x] Done')
    })

    it('exports to HTML correctly', () => {
        const result = blocksToHTML(mockBlocks, 'Test Page')
        expect(result).toContain('<h1>Test Page</h1>')
        expect(result).toContain('<h1>Title</h1>')
        expect(result).toContain('<p>Hello World</p>')
        expect(result).toContain('type="checkbox" class="checkbox" checked')
    })

    it('formats CSV cells correctly', () => {
        expect(formatCellValueForCSV('Text', 'TEXT')).toBe('Text')
        expect(formatCellValueForCSV(true, 'CHECKBOX')).toBe('Yes')
        expect(formatCellValueForCSV(['A', 'B'], 'MULTI_SELECT')).toBe('A, B')
    })
})

describe('Import Utilities', () => {
    it('parses markdown to blocks', () => {
        const md = '# Title\n\n- [ ] Todo\n\nHello'
        const blocks = parseMarkdownToBlocks(md)
        expect(blocks).toHaveLength(3)
        expect(blocks[0].type).toBe('heading')
        expect(blocks[1].type).toBe('checkListItem')
        expect(blocks[2].type).toBe('paragraph')
    })

    it('parses CSV to database', () => {
        const csv = 'Name,Age\nJohn,30\nJane,25'
        const result = parseCSVToDatabase(csv)
        expect(result.headers).toEqual(['Name', 'Age'])
        expect(result.rows).toHaveLength(2)
        expect(result.rows[0]).toEqual({ Name: 'John', Age: '30' })
    })
})
