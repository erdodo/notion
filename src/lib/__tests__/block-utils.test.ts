import { describe, it, expect, beforeEach } from 'vitest'
import {
    BLOCK_COLORS,
    BLOCK_COLORS_DARK,
    getAvailableConversions,
    convertBlockType,
    duplicateBlock,
    getBlockColorStyle,
    formatBlockTypeName,
    type BlockColor
} from '../block-utils'

describe('block-utils', () => {
  describe('BLOCK_COLORS', () => {
    it('should contain all required color properties', () => {
      expect(BLOCK_COLORS).toBeDefined()
      expect(BLOCK_COLORS.default).toBeDefined()
      expect(BLOCK_COLORS.gray).toBeDefined()
      expect(BLOCK_COLORS.blue).toBeDefined()
    })

    it('should have correct structure for each color', () => {
      Object.values(BLOCK_COLORS).forEach((color) => {
        expect(color).toHaveProperty('bg')
        expect(color).toHaveProperty('label')
        expect(typeof color.bg).toBe('string')
        expect(typeof color.label).toBe('string')
      })
    })
  })

  describe('BLOCK_COLORS_DARK', () => {
    it('should contain all required dark color properties', () => {
      expect(BLOCK_COLORS_DARK).toBeDefined()
      expect(BLOCK_COLORS_DARK.default).toBeDefined()
    })

    it('should have darker RGB values than light theme', () => {
      // Check that RGB values are darker (lower numbers)
      const lightGray = BLOCK_COLORS.gray.bg.match(/\d+/g)
      const darkGray = BLOCK_COLORS_DARK.gray.bg.match(/\d+/g)

      if (lightGray && darkGray) {
        expect(parseInt(darkGray[0])).toBeLessThan(parseInt(lightGray[0]))
      }
    })
  })

  describe('getAvailableConversions', () => {
    it('should return available conversions for paragraph', () => {
      const conversions = getAvailableConversions('paragraph')
      expect(Array.isArray(conversions)).toBe(true)
      expect(conversions).toContain('heading')
      expect(conversions).toContain('bulletListItem')
    })

    it('should return available conversions for heading', () => {
      const conversions = getAvailableConversions('heading')
      expect(conversions).toContain('paragraph')
    })

    it('should return empty array for unknown block type', () => {
      const conversions = getAvailableConversions('unknown-type')
      expect(conversions).toEqual([])
    })

    it('should have quote and callout conversions', () => {
      const quoteConversions = getAvailableConversions('quote')
      expect(quoteConversions).toContain('callout')
    })
  })

  describe('convertBlockType', () => {
    let mockBlock: any

    beforeEach(() => {
      mockBlock = {
        type: 'paragraph',
        props: { backgroundColor: 'default', textColor: 'default' },
        content: [{ type: 'text', text: 'Hello', styles: {} }],
        children: []
      }
    })

    it('should convert paragraph to heading', () => {
      const converted = convertBlockType(mockBlock, 'heading')
      expect(converted.type).toBe('heading')
      expect(converted.props.level).toBe(1)
      expect(converted.content).toEqual(mockBlock.content)
    })

    it('should preserve content when converting', () => {
      const converted = convertBlockType(mockBlock, 'bulletListItem')
      expect(converted.content).toEqual(mockBlock.content)
    })

    it('should set checked to false for checkbox conversion', () => {
      const converted = convertBlockType(mockBlock, 'checkListItem')
      expect(converted.type).toBe('checkListItem')
      expect(converted.props.checked).toBe(false)
    })

    it('should set emoji for callout conversion', () => {
      const converted = convertBlockType(mockBlock, 'callout')
      expect(converted.type).toBe('callout')
      expect(converted.props.emoji).toBe('💡')
      expect(converted.props.backgroundColor).toBe('default')
    })

    it('should preserve children during conversion', () => {
      mockBlock.children = [{ id: 'child-1' }]
      const converted = convertBlockType(mockBlock, 'heading')
      expect(converted.children).toEqual(mockBlock.children)
    })
  })

  describe('duplicateBlock', () => {
    let mockBlock: any

    beforeEach(() => {
      mockBlock = {
        type: 'paragraph',
        props: { backgroundColor: 'default' },
        content: [{ type: 'text', text: 'Hello' }],
        children: []
      }
    })

    it('should duplicate a simple block', () => {
      const duplicated = duplicateBlock(mockBlock)
      expect(duplicated.type).toBe(mockBlock.type)
      expect(duplicated.content).toEqual(mockBlock.content)
    })

    it('should create new props object', () => {
      const duplicated = duplicateBlock(mockBlock)
      expect(duplicated.props).toEqual(mockBlock.props)
      expect(duplicated.props).not.toBe(mockBlock.props)
    })

    it('should duplicate nested children', () => {
      mockBlock.children = [
        {
          type: 'paragraph',
          props: {},
          content: [{ type: 'text', text: 'Child' }],
          children: []
        }
      ]
      const duplicated = duplicateBlock(mockBlock)
      expect(duplicated.children).toHaveLength(1)
      expect(duplicated.children[0].content).toEqual(mockBlock.children[0].content)
    })

    it('should handle blocks with no children', () => {
      const duplicated = duplicateBlock(mockBlock)
      expect(duplicated.children).toEqual([])
    })
  })

  describe('getBlockColorStyle', () => {
    it('should return light color style by default', () => {
      const style = getBlockColorStyle('blue' as BlockColor)
      expect(style).toEqual(BLOCK_COLORS.blue.bg)
    })

    it('should return dark color style when isDark is true', () => {
      const style = getBlockColorStyle('blue' as BlockColor, true)
      expect(style).toEqual(BLOCK_COLORS_DARK.blue.bg)
    })

    it('should return default color for invalid color', () => {
      const style = getBlockColorStyle('invalid-color' as BlockColor)
      expect(style).toBe(BLOCK_COLORS.default.bg)
    })

    it('should handle all color types', () => {
      const colors: BlockColor[] = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red']
      colors.forEach(color => {
        const style = getBlockColorStyle(color)
        expect(style).toBeDefined()
        expect(typeof style).toBe('string')
      })
    })
  })

  describe('formatBlockTypeName', () => {
    it('should format paragraph as Text', () => {
      expect(formatBlockTypeName('paragraph')).toBe('Text')
    })

    it('should format heading as Heading', () => {
      expect(formatBlockTypeName('heading')).toBe('Heading')
    })

    it('should format bulletListItem as Bulleted list', () => {
      expect(formatBlockTypeName('bulletListItem')).toBe('Bulleted list')
    })

    it('should format numberedListItem as Numbered list', () => {
      expect(formatBlockTypeName('numberedListItem')).toBe('Numbered list')
    })

    it('should format checkListItem as To-do list', () => {
      expect(formatBlockTypeName('checkListItem')).toBe('To-do list')
    })

    it('should format quote as Quote', () => {
      expect(formatBlockTypeName('quote')).toBe('Quote')
    })

    it('should format callout as Callout', () => {
      expect(formatBlockTypeName('callout')).toBe('Callout')
    })

    it('should format codeBlock as Code', () => {
      expect(formatBlockTypeName('codeBlock')).toBe('Code')
    })

    it('should capitalize unknown types', () => {
      expect(formatBlockTypeName('customType')).toBe('CustomType')
    })
  })
})
