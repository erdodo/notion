import { DatabaseRow, Property } from '@prisma/client';
import { Parser } from 'expr-eval';

const parser = new Parser();

parser.functions.prop = function (name: string) {
  return this.props?.[name] ?? null;
};

parser.functions.concat = (...arguments_: unknown[]) =>
  arguments_.map(String).join('');
parser.functions.contains = (string_: string, search: string) =>
  String(string_).toLowerCase().includes(String(search).toLowerCase());
parser.functions.replace = (string_: string, find: string, replace: string) =>
  String(string_).replaceAll(new RegExp(find, 'g'), replace);
parser.functions.lower = (string_: string) => String(string_).toLowerCase();
parser.functions.upper = (string_: string) => String(string_).toUpperCase();
parser.functions.trim = (string_: string) => String(string_).trim();
parser.functions.length = (string_: string) => String(string_).length;
parser.functions.slice = (string_: string, start: number, end?: number) =>
  String(string_).slice(start, end);
parser.functions.split = (string_: string, delimiter: string) =>
  String(string_).split(delimiter);
parser.functions.join = (array: unknown[], delimiter: string) =>
  array.join(delimiter);

parser.functions.roundTo = (number_: number, decimals = 0) =>
  Math.round(number_ * Math.pow(10, decimals)) / Math.pow(10, decimals);
parser.functions.toNumber = (value: unknown) => Number(value) || 0;

parser.functions.now = () => new Date().toISOString();
parser.functions.today = () => new Date().toISOString().split('T')[0];
parser.functions.year = (date: string) => new Date(date).getFullYear();
parser.functions.month = (date: string) => new Date(date).getMonth() + 1;
parser.functions.day = (date: string) => new Date(date).getDate();
parser.functions.dateAdd = (date: string, amount: number, unit: string) => {
  const d = new Date(date);
  switch (unit) {
    case 'days': {
      d.setDate(d.getDate() + amount);
      break;
    }
    case 'weeks': {
      d.setDate(d.getDate() + amount * 7);
      break;
    }
    case 'months': {
      d.setMonth(d.getMonth() + amount);
      break;
    }
    case 'years': {
      d.setFullYear(d.getFullYear() + amount);
      break;
    }
  }
  return d.toISOString();
};
parser.functions.dateBetween = (date1: string, date2: string, unit: string) => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diff = Math.abs(d2 - d1);
  switch (unit) {
    case 'days': {
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    case 'weeks': {
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    }
    case 'months': {
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    }
    case 'years': {
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    }
    default: {
      return diff;
    }
  }
};
parser.functions.formatDate = (date: string, format: string) => {
  const d = new Date(date);
  return format
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'));
};

parser.functions.if = (
  condition: unknown,
  trueValue: unknown,
  falseValue: unknown
) => (condition ? trueValue : falseValue);
parser.functions.empty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);
parser.functions.not = (value: unknown) => !value;

export interface FormulaContext {
  props: Record<string, unknown>;
  row: DatabaseRow | null;
  properties: Property[];
}

export interface FormulaResult {
  value: unknown;
  error: string | null;
}

export function evaluateFormula(
  expression: string,
  context: FormulaContext
): FormulaResult {
  try {
    const boundParser = new Parser();

    for (const key of Object.keys(parser.functions)) {
      boundParser.functions[key] = parser.functions[key];
    }

    boundParser.functions.prop = (name: string) => {
      const property = context.properties.find((p) => p.name === name);
      if (!property) return null;
      return context.props[property.id] ?? null;
    };

    const expr = boundParser.parse(expression);
    const value = expr.evaluate(context.props as any);

    return { value, error: null };
  } catch (error) {
    return { value: null, error: (error as Error).message };
  }
}

export function validateFormula(expression: string): {
  valid: boolean;
  error?: string;
} {
  try {
    parser.parse(expression);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

export const availableFunctions = [
  {
    name: 'prop',
    syntax: 'prop("Name")',
    description: 'Get property value by name',
  },

  { name: 'add', syntax: 'add(a, b)', description: 'Add two numbers' },
  {
    name: 'subtract',
    syntax: 'subtract(a, b)',
    description: 'Subtract b from a',
  },
  {
    name: 'multiply',
    syntax: 'multiply(a, b)',
    description: 'Multiply two numbers',
  },
  { name: 'divide', syntax: 'divide(a, b)', description: 'Divide a by b' },
  {
    name: 'roundTo',
    syntax: 'roundTo(n, decimals)',
    description: 'Round number',
  },
  { name: 'abs', syntax: 'abs(n)', description: 'Absolute value' },
  { name: 'min', syntax: 'min(a, b, ...)', description: 'Minimum value' },
  { name: 'max', syntax: 'max(a, b, ...)', description: 'Maximum value' },

  {
    name: 'concat',
    syntax: 'concat(a, b, ...)',
    description: 'Concatenate strings',
  },
  {
    name: 'contains',
    syntax: 'contains(str, search)',
    description: 'Check if contains',
  },
  {
    name: 'replace',
    syntax: 'replace(str, find, replace)',
    description: 'Replace text',
  },
  { name: 'lower', syntax: 'lower(str)', description: 'Lowercase' },
  { name: 'upper', syntax: 'upper(str)', description: 'Uppercase' },
  { name: 'length', syntax: 'length(str)', description: 'String length' },
  { name: 'slice', syntax: 'slice(str, start, end)', description: 'Substring' },

  { name: 'now', syntax: 'now()', description: 'Current date and time' },
  { name: 'today', syntax: 'today()', description: 'Current date' },
  { name: 'year', syntax: 'year(date)', description: 'Get year' },
  { name: 'month', syntax: 'month(date)', description: 'Get month' },
  { name: 'day', syntax: 'day(date)', description: 'Get day' },
  {
    name: 'dateAdd',
    syntax: 'dateAdd(date, n, unit)',
    description: 'Add to date',
  },
  {
    name: 'dateBetween',
    syntax: 'dateBetween(d1, d2, unit)',
    description: 'Difference between dates',
  },

  {
    name: 'if',
    syntax: 'if(cond, trueVal, falseVal)',
    description: 'Conditional',
  },
  { name: 'empty', syntax: 'empty(val)', description: 'Check if empty' },
  { name: 'not', syntax: 'not(val)', description: 'Negate boolean' },
];
