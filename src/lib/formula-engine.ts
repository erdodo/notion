import { Parser } from 'expr-eval'
import { DatabaseRow, Property } from '@prisma/client'

// Parser instance
const parser = new Parser()

// Custom functions ekle
parser.functions.prop = function (name: string) {
    // Context'ten property value al
    return this.props?.[name] ?? null
}

// String functions
parser.functions.concat = (...args: any[]) => args.map(String).join('')
parser.functions.contains = (str: string, search: string) =>
    String(str).toLowerCase().includes(String(search).toLowerCase())
parser.functions.replace = (str: string, find: string, replace: string) =>
    String(str).replace(new RegExp(find, 'g'), replace)
parser.functions.lower = (str: string) => String(str).toLowerCase()
parser.functions.upper = (str: string) => String(str).toUpperCase()
parser.functions.trim = (str: string) => String(str).trim()
parser.functions.length = (str: string) => String(str).length
parser.functions.slice = (str: string, start: number, end?: number) =>
    String(str).slice(start, end)
parser.functions.split = (str: string, delimiter: string) =>
    String(str).split(delimiter)
parser.functions.join = (arr: any[], delimiter: string) =>
    arr.join(delimiter)

// Math functions (ek olarak)
parser.functions.roundTo = (num: number, decimals = 0) =>
    Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
parser.functions.toNumber = (val: any) => Number(val) || 0

// Date functions
parser.functions.now = () => new Date().toISOString()
parser.functions.today = () => new Date().toISOString().split('T')[0]
parser.functions.year = (date: string) => new Date(date).getFullYear()
parser.functions.month = (date: string) => new Date(date).getMonth() + 1
parser.functions.day = (date: string) => new Date(date).getDate()
parser.functions.dateAdd = (date: string, amount: number, unit: string) => {
    const d = new Date(date)
    switch (unit) {
        case 'days': d.setDate(d.getDate() + amount); break
        case 'weeks': d.setDate(d.getDate() + amount * 7); break
        case 'months': d.setMonth(d.getMonth() + amount); break
        case 'years': d.setFullYear(d.getFullYear() + amount); break
    }
    return d.toISOString()
}
parser.functions.dateBetween = (date1: string, date2: string, unit: string) => {
    const d1 = new Date(date1).getTime()
    const d2 = new Date(date2).getTime()
    const diff = Math.abs(d2 - d1)
    switch (unit) {
        case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24))
        case 'weeks': return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
        case 'months': return Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
        case 'years': return Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
        default: return diff
    }
}
parser.functions.formatDate = (date: string, format: string) => {
    // Basit format desteği: YYYY, MM, DD
    const d = new Date(date)
    return format
        .replace('YYYY', String(d.getFullYear()))
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(d.getDate()).padStart(2, '0'))
}

// Logic functions
parser.functions.if = (condition: any, trueVal: any, falseVal: any) =>
    condition ? trueVal : falseVal
parser.functions.empty = (val: any) =>
    val === null || val === undefined || val === '' ||
    (Array.isArray(val) && val.length === 0)
parser.functions.not = (val: any) => !val

// Types
export interface FormulaContext {
    props: Record<string, any>      // Property name -> value mapping
    row: DatabaseRow
    properties: Property[]
}

export interface FormulaResult {
    value: any
    error: string | null
}

// Ana evaluation fonksiyonu
export function evaluateFormula(
    expression: string,
    context: FormulaContext
): FormulaResult {
    try {
        // prop() fonksiyonu için context'i bind et
        const boundParser = new Parser()

        // Tüm custom functions'ı kopyala
        Object.keys(parser.functions).forEach(key => {
            boundParser.functions[key] = parser.functions[key]
        })

        // prop fonksiyonunu context ile bind et
        boundParser.functions.prop = (name: string) => {
            const property = context.properties.find(p => p.name === name)
            if (!property) return null
            return context.props[property.id] ?? null
        }

        const expr = boundParser.parse(expression)
        const value = expr.evaluate(context.props)

        return { value, error: null }
    } catch (e) {
        return { value: null, error: (e as Error).message }
    }
}

// Formula validation
export function validateFormula(expression: string): { valid: boolean, error?: string } {
    try {
        parser.parse(expression)
        return { valid: true }
    } catch (e) {
        return { valid: false, error: (e as Error).message }
    }
}

// Kullanılabilir fonksiyonlar listesi (autocomplete için)
export const availableFunctions = [
    // Property
    { name: 'prop', syntax: 'prop("Name")', description: 'Get property value by name' },

    // Math
    { name: 'add', syntax: 'add(a, b)', description: 'Add two numbers' },
    { name: 'subtract', syntax: 'subtract(a, b)', description: 'Subtract b from a' },
    { name: 'multiply', syntax: 'multiply(a, b)', description: 'Multiply two numbers' },
    { name: 'divide', syntax: 'divide(a, b)', description: 'Divide a by b' },
    { name: 'roundTo', syntax: 'roundTo(n, decimals)', description: 'Round number' },
    { name: 'abs', syntax: 'abs(n)', description: 'Absolute value' },
    { name: 'min', syntax: 'min(a, b, ...)', description: 'Minimum value' },
    { name: 'max', syntax: 'max(a, b, ...)', description: 'Maximum value' },

    // String
    { name: 'concat', syntax: 'concat(a, b, ...)', description: 'Concatenate strings' },
    { name: 'contains', syntax: 'contains(str, search)', description: 'Check if contains' },
    { name: 'replace', syntax: 'replace(str, find, replace)', description: 'Replace text' },
    { name: 'lower', syntax: 'lower(str)', description: 'Lowercase' },
    { name: 'upper', syntax: 'upper(str)', description: 'Uppercase' },
    { name: 'length', syntax: 'length(str)', description: 'String length' },
    { name: 'slice', syntax: 'slice(str, start, end)', description: 'Substring' },

    // Date
    { name: 'now', syntax: 'now()', description: 'Current date and time' },
    { name: 'today', syntax: 'today()', description: 'Current date' },
    { name: 'year', syntax: 'year(date)', description: 'Get year' },
    { name: 'month', syntax: 'month(date)', description: 'Get month' },
    { name: 'day', syntax: 'day(date)', description: 'Get day' },
    { name: 'dateAdd', syntax: 'dateAdd(date, n, unit)', description: 'Add to date' },
    { name: 'dateBetween', syntax: 'dateBetween(d1, d2, unit)', description: 'Difference between dates' },

    // Logic
    { name: 'if', syntax: 'if(cond, trueVal, falseVal)', description: 'Conditional' },
    { name: 'empty', syntax: 'empty(val)', description: 'Check if empty' },
    { name: 'not', syntax: 'not(val)', description: 'Negate boolean' },
]
