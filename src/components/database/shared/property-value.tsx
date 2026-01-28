'use client';

import { Property } from '@prisma/client';
import { format } from 'date-fns';
import { Check, Link as LinkIcon, Calendar } from 'lucide-react';
import React from 'react';

import { FormulaCell } from '@/components/database/cells/formula-cell';
import { RelationCell } from '@/components/database/cells/relation-cell';
import { RollupCell } from '@/components/database/cells/rollup-cell';
import { Badge } from '@/components/ui/badge';
import { getOptionColors } from '@/lib/notion-colors';
import { RelationConfig } from '@/lib/relation-service';
import { RollupConfig } from '@/lib/rollup-service';
import { cn } from '@/lib/utils';

interface PropertyValueProperties {
  property: Property;
  value: PropertyValueType;
  compact?: boolean;
  rowId?: string;
}

type SimpleValue = string | number | boolean | null | undefined;
type ObjectValue = { value?: SimpleValue; name?: string; id?: string };
type PropertyValueType =
  | SimpleValue
  | ObjectValue
  | (string | ObjectValue)[]
  | { linkedRowIds: string[] }
  | null;

function getEmptyValue(): React.JSX.Element {
  return <span className="text-muted-foreground/50 text-xs">Empty</span>;
}

function getTextValue(value: PropertyValueType): string {
  if (typeof value === 'object' && value !== null) {
    const objValue = value as ObjectValue;
    if (typeof objValue.value === 'string') {
      return objValue.value;
    }
    if (typeof objValue.name === 'string') {
      return objValue.name;
    }
    return JSON.stringify(value);
  }
  return String(value || '');
}

function getSelectValue(
  property: Property,
  value: PropertyValueType
): React.JSX.Element | null {
  const selectId =
    typeof value === 'object' && value !== null
      ? (value as ObjectValue).value || value
      : value;
  if (!selectId) return null;

  const selectOption = (
    property.options as { id: string; name: string; color: string }[]
  )?.find((o: { id: string }) => o.id === selectId);

  if (selectOption) {
    const colors = getOptionColors(selectOption.color);
    return (
      <Badge
        variant="secondary"
        className={cn('font-normal px-2 py-0.5', colors.bg, colors.text)}
      >
        {selectOption.name}
      </Badge>
    );
  }
  return <span>{String(selectId)}</span>;
}

function getMultiSelectValue(
  property: Property,
  value: PropertyValueType
): React.JSX.Element | null {
  if (!Array.isArray(value)) return null;
  const multiOptions =
    (property.options as { id: string; name: string; color: string }[]) || [];
  return (
    <div className="flex gap-1 flex-wrap">
      {value.map((v: string | ObjectValue, index: number) => {
        const id = typeof v === 'object' ? v.id || v.value : v;
        const option = multiOptions.find((o) => o.id === id);
        const colors = option
          ? getOptionColors(option.color)
          : { bg: '', text: '' };

        return (
          <Badge
            key={index}
            variant="secondary"
            className={cn('font-normal px-2 py-0.5', colors.bg, colors.text)}
          >
            {option?.name || String(id)}
          </Badge>
        );
      })}
    </div>
  );
}

function getDateValue(
  value: PropertyValueType,
  compact?: boolean
): React.JSX.Element | null {
  if (!value) return null;
  const dateValue =
    typeof value === 'object' && value !== null && 'value' in value
      ? (value as ObjectValue).value
      : value;
  if (!dateValue) return null;
  return (
    <span className="flex items-center gap-1.5">
      {!compact && <Calendar className="h-3 w-3 text-muted-foreground" />}
      {format(new Date(dateValue as string), 'MMM d, yyyy')}
    </span>
  );
}

function getCheckboxValue(value: PropertyValueType): React.JSX.Element {
  const checked =
    value === true ||
    value === 'true' ||
    (typeof value === 'object' && (value as ObjectValue)?.value === true);
  return checked ? (
    <Check className="h-4 w-4 text-primary" />
  ) : (
    <div className="h-4 w-4 border rounded-sm border-muted" />
  );
}

function getUrlValue(
  value: PropertyValueType,
  compact?: boolean
): React.JSX.Element | null {
  const urlValue =
    typeof value === 'object' && value !== null
      ? (value as ObjectValue).value
      : value;
  const urlString = String(urlValue || '');
  if (!urlString) return null;
  return (
    <a
      href={urlString}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline flex items-center gap-1"
    >
      {!compact && <LinkIcon className="h-3 w-3" />}
      <span className="truncate max-w-[150px]">{urlString}</span>
    </a>
  );
}

function getSimpleTextValue(value: PropertyValueType): string {
  if (typeof value === 'object' && value !== null) {
    const objValue = value as ObjectValue;
    if (typeof objValue.value === 'string') {
      return objValue.value;
    }
    return '';
  }
  return String(value || '');
}

function getStatusValue(
  property: Property,
  value: PropertyValueType
): React.JSX.Element | null {
  const statusId =
    typeof value === 'object' && value !== null
      ? (value as ObjectValue).value || value
      : value;
  if (!statusId) return null;

  const statusOptions =
    (property.options as { id: string; name: string; color: string }[]) || [];
  const statusOption = statusOptions.find((o) => o.id === statusId);

  if (statusOption) {
    const colors = getOptionColors(statusOption.color);
    return (
      <Badge
        variant="secondary"
        className={cn('font-normal px-2 py-0.5', colors.bg, colors.text)}
      >
        {statusOption.name}
      </Badge>
    );
  }
  return <span>{String(statusId)}</span>;
}

function getRelationValue(
  property: Property,
  value: PropertyValueType,
  rowId?: string,
  compact?: boolean
): React.JSX.Element | null {
  if (!rowId)
    return <span className="text-xs text-muted-foreground">No context</span>;
  return (
    <RelationCell
      propertyId={property.id}
      rowId={rowId}
      value={value as { linkedRowIds: string[] } | null}
      config={property.relationConfig as unknown as RelationConfig}
      editable={!compact}
    />
  );
}

function getRollupValue(
  property: Property,
  value: PropertyValueType,
  rowId?: string
): React.JSX.Element | null {
  if (!rowId)
    return <span className="text-xs text-muted-foreground">No context</span>;
  return (
    <RollupCell
      propertyId={property.id}
      rowId={rowId}
      config={property.rollupConfig as unknown as RollupConfig}
    />
  );
}

function getFormulaValue(
  property: Property,
  value: PropertyValueType,
  rowId?: string
): React.JSX.Element | null {
  if (!rowId)
    return <span className="text-xs text-muted-foreground">No context</span>;
  return (
    <FormulaCell
      propertyId={property.id}
      rowId={rowId}
      config={
        property.formulaConfig as {
          expression: string;
          resultType: 'string' | 'number' | 'boolean' | 'date';
        }
      }
    />
  );
}

export function PropertyValue({
  property,
  value,
  compact,
  rowId,
}: PropertyValueProperties) {
  const isEmptyValue =
    (value === null || value === undefined) &&
    [
      'TEXT',
      'NUMBER',
      'SELECT',
      'MULTI_SELECT',
      'DATE',
      'URL',
      'EMAIL',
      'PHONE',
    ].includes(property.type);

  if (isEmptyValue) {
    return getEmptyValue();
  }

  switch (property.type) {
    case 'TITLE':
    case 'TEXT':
      return <span className="truncate">{getTextValue(value)}</span>;

    case 'NUMBER':
      const numberValue =
        typeof value === 'object' && value !== null
          ? (value as ObjectValue).value
          : value;
      return <span>{String(numberValue)}</span>;

    case 'SELECT':
      return getSelectValue(property, value);

    case 'MULTI_SELECT':
      return getMultiSelectValue(property, value);

    case 'DATE':
      return getDateValue(value, compact);

    case 'CHECKBOX':
      return getCheckboxValue(value);

    case 'URL':
      return getUrlValue(value, compact);

    case 'EMAIL':
    case 'PHONE':
      return <span className="truncate">{getSimpleTextValue(value)}</span>;

    case 'STATUS':
      return getStatusValue(property, value);

    case 'RELATION':
      return getRelationValue(property, value, rowId, compact);

    case 'ROLLUP':
      return getRollupValue(property, value, rowId);

    case 'FORMULA':
      return getFormulaValue(property, value, rowId);

    default:
      return <span className="truncate">{JSON.stringify(value)}</span>;
  }
}
