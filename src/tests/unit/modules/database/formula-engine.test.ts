import { describe, it, expect } from 'vitest'
import { evaluateFormula, validateFormula } from '@/lib/formula-engine'

describe('Formula Engine', () => {
    const mockContext: any = {
        props: {
            'prop-1': 10,
            'prop-2': 'Hello',
        },
        properties: [
            { id: 'prop-1', name: 'NumberProp' },
            { id: 'prop-2', name: 'TextProp' },
        ],
        row: {}
    }

    describe('Math Functions', () => {
        it('evaluates basic math', () => {
            const result = evaluateFormula('1 + 2', mockContext)
            expect(result.value).toBe(3)
            expect(result.error).toBeNull()
        })

        it('evaluates round function', () => {
            const result = evaluateFormula('roundTo(10.55, 1)', mockContext)
            expect(result.value).toBe(10.6)
        })
    })

    describe('String Functions', () => {
        it('evaluates concat', () => {
            const result = evaluateFormula('concat("Hello", " ", "World")', mockContext)
            expect(result.value).toBe('Hello World')
        })

        it('evaluates contains', () => {
            const result = evaluateFormula('contains("Hello World", "World")', mockContext)
            expect(result.value).toBe(true)
        })
    })

    describe('Logic Functions', () => {
        it('evaluates if condition', () => {
            const result = evaluateFormula('if(1 > 0, "Yes", "No")', mockContext)
            expect(result.value).toBe('Yes')
        })

        it('evaluates empty check', () => {
            const result = evaluateFormula('empty("")', mockContext)
            expect(result.value).toBe(true)
        })
    })

    describe('Property Access', () => {
        it('accesses property by name', () => {
            const result = evaluateFormula('prop("NumberProp")', mockContext)
            expect(result.value).toBe(10)
        })

        it('returns null for missing property', () => {
            const result = evaluateFormula('prop("Missing")', mockContext)
            expect(result.value).toBeNull()
        })
    })

    describe('Validation', () => {
        it('returns valid for correct formula', () => {
            const result = validateFormula('1 + 1')
            expect(result.valid).toBe(true)
        })

        it('returns invalid for syntax error', () => {
            const result = validateFormula('1 +') // Incomplete
            expect(result.valid).toBe(false)
            expect(result.error).toBeDefined()
        })
    })
})
