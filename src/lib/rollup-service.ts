
export type AggregationType =
    | 'count'           // Toplam kayıt sayısı
    | 'count_values'    // Dolu hücre sayısı
    | 'count_unique'    // Unique değer sayısı
    | 'count_empty'     // Boş hücre sayısı
    | 'count_not_empty' // Dolu hücre sayısı
    | 'percent_empty'   // Boş yüzdesi
    | 'percent_not_empty' // Dolu yüzdesi
    | 'sum'             // Toplam (sayısal)
    | 'average'         // Ortalama (sayısal)
    | 'median'          // Medyan (sayısal)
    | 'min'             // Minimum
    | 'max'             // Maximum
    | 'range'           // Max - Min
    | 'show_original'   // Tüm değerleri listele
    | 'show_unique'     // Unique değerleri listele

export interface RollupConfig {
    relationPropertyId: string
    targetPropertyId: string
    aggregation: AggregationType
}

export function computeRollup(
    values: any[],
    aggregation: AggregationType
): any {
    const nonEmpty = values.filter(v => v !== null && v !== undefined && v !== '')
    const numbers = nonEmpty.map(v => Number(v)).filter(n => !isNaN(n))

    switch (aggregation) {
        case 'count':
            return values.length

        case 'count_values':
        case 'count_not_empty':
            return nonEmpty.length

        case 'count_empty':
            return values.length - nonEmpty.length

        case 'count_unique':
            return [...new Set(nonEmpty)].length

        case 'percent_empty':
            return values.length ? Math.round((values.length - nonEmpty.length) / values.length * 100) : 0

        case 'percent_not_empty':
            return values.length ? Math.round(nonEmpty.length / values.length * 100) : 0

        case 'sum':
            return numbers.reduce((a, b) => a + b, 0)

        case 'average':
            return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0

        case 'median':
            if (!numbers.length) return 0
            const sorted = [...numbers].sort((a, b) => a - b)
            const mid = Math.floor(sorted.length / 2)
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

        case 'min':
            return numbers.length ? Math.min(...numbers) : null

        case 'max':
            return numbers.length ? Math.max(...numbers) : null

        case 'range':
            if (!numbers.length) return null
            return Math.max(...numbers) - Math.min(...numbers)

        case 'show_original':
            return nonEmpty

        case 'show_unique':
            return [...new Set(nonEmpty)]

        default:
            return null
    }
}

// Aggregation type'a göre display format
export function formatRollupValue(value: any, aggregation: AggregationType): string {
    if (value === null || value === undefined) return '-'

    switch (aggregation) {
        case 'percent_empty':
        case 'percent_not_empty':
            return `${value}%`

        case 'average':
            return typeof value === 'number' ? value.toFixed(2) : String(value)

        case 'show_original':
        case 'show_unique':
            return Array.isArray(value) ? value.join(', ') : String(value)

        default:
            return String(value)
    }
}

// Aggregation options listesi (UI için)
export const aggregationOptions = [
    { value: 'count', label: 'Count all', group: 'Count' },
    { value: 'count_values', label: 'Count values', group: 'Count' },
    { value: 'count_unique', label: 'Count unique values', group: 'Count' },
    { value: 'count_empty', label: 'Count empty', group: 'Count' },
    { value: 'count_not_empty', label: 'Count not empty', group: 'Count' },
    { value: 'percent_empty', label: 'Percent empty', group: 'Percent' },
    { value: 'percent_not_empty', label: 'Percent not empty', group: 'Percent' },
    { value: 'sum', label: 'Sum', group: 'Number' },
    { value: 'average', label: 'Average', group: 'Number' },
    { value: 'median', label: 'Median', group: 'Number' },
    { value: 'min', label: 'Min', group: 'Number' },
    { value: 'max', label: 'Max', group: 'Number' },
    { value: 'range', label: 'Range', group: 'Number' },
    { value: 'show_original', label: 'Show original', group: 'Other' },
    { value: 'show_unique', label: 'Show unique', group: 'Other' },
]
