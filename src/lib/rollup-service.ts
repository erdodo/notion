export type AggregationType =
  | 'count'
  | 'count_values'
  | 'count_unique'
  | 'count_empty'
  | 'count_not_empty'
  | 'percent_empty'
  | 'percent_not_empty'
  | 'sum'
  | 'average'
  | 'median'
  | 'min'
  | 'max'
  | 'range'
  | 'show_original'
  | 'show_unique';

export interface RollupConfig {
  relationPropertyId: string;
  targetPropertyId: string;
  aggregation: AggregationType;
  dateFormat?: string;
}

export function computeRollup(
  values: unknown[],
  aggregation: AggregationType
): unknown {
  const nonEmpty = values.filter(
    (v) => v !== null && v !== undefined && v !== ''
  );
  const numbers = nonEmpty.map(Number).filter((n) => !isNaN(n));

  switch (aggregation) {
    case 'count': {
      return values.length;
    }

    case 'count_values':
    case 'count_not_empty': {
      return nonEmpty.length;
    }

    case 'count_empty': {
      return values.length - nonEmpty.length;
    }

    case 'count_unique': {
      return new Set(nonEmpty).size;
    }

    case 'percent_empty': {
      return values.length > 0
        ? Math.round(((values.length - nonEmpty.length) / values.length) * 100)
        : 0;
    }

    case 'percent_not_empty': {
      return values.length > 0
        ? Math.round((nonEmpty.length / values.length) * 100)
        : 0;
    }

    case 'sum': {
      return numbers.reduce((a, b) => a + b, 0);
    }

    case 'average': {
      return numbers.length > 0
        ? numbers.reduce((a, b) => a + b, 0) / numbers.length
        : 0;
    }

    case 'median': {
      if (numbers.length === 0) return 0;
      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    case 'min': {
      return numbers.length > 0 ? Math.min(...numbers) : null;
    }

    case 'max': {
      return numbers.length > 0 ? Math.max(...numbers) : null;
    }

    case 'range': {
      if (numbers.length === 0) return null;
      return Math.max(...numbers) - Math.min(...numbers);
    }

    case 'show_original': {
      return nonEmpty;
    }

    case 'show_unique': {
      return [...new Set(nonEmpty)];
    }

    default: {
      return null;
    }
  }
}

export function formatRollupValue(
  value: unknown,
  aggregation: AggregationType,
  dateFormat?: string
): string {
  if (value === null || value === undefined) return '-';

  switch (aggregation) {
    case 'percent_empty':
    case 'percent_not_empty': {
      return `${value}%`;
    }

    case 'average': {
      return typeof value === 'number' ? value.toFixed(2) : String(value);
    }

    case 'show_original':
    case 'show_unique': {
      if (Array.isArray(value)) {
        if (dateFormat) {
          const formatDate = (v: unknown) => {
            const d = new Date(v as string | number | Date);
            if (isNaN(d.getTime())) return String(v);

            if (dateFormat === 'relative') {
              const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
              if (Math.abs(diff) < 1) return 'Today';
              if (Math.abs(diff) < 2)
                return diff > 0 ? 'Yesterday' : 'Tomorrow';
              return d.toLocaleDateString();
            }
            if (dateFormat === 'US') return d.toLocaleDateString('en-US');
            if (dateFormat === 'ISO') return d.toISOString().split('T')[0];
            return d.toLocaleDateString();
          };
          return value.map(formatDate).join(', ');
        }
        return value.join(', ');
      }
      return String(value);
    }

    default: {
      return String(value);
    }
  }
}

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
];
