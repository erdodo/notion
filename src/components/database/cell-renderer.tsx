import { CheckboxCell } from './cells/checkbox-cell';
import { DateCell } from './cells/date-cell';
import { FormulaCell } from './cells/formula-cell';
import { MultiSelectCell } from './cells/multi-select-cell';
import { NumberCell } from './cells/number-cell';
import { RelationCell } from './cells/relation-cell';
import { RollupCell } from './cells/rollup-cell';
import { SelectCell } from './cells/select-cell';
import { StatusCell } from './cells/status-cell';
import { TextCell } from './cells/text-cell';
import { CreatedTimeCell, UpdatedTimeCell } from './cells/time-cells';
import { TitleCell } from './cells/title-cell';
import { CellProps as CellProperties } from './cells/types';
import { UrlCell } from './cells/url-cell';

import { RelationConfig } from '@/lib/relation-service';
import { RollupConfig } from '@/lib/rollup-service';

export interface FormulaConfig {
  expression: string;
}

const PlaceholderCell = TextCell;

export function CellRenderer(properties: CellProperties) {
  const type = properties.column.columnDef.meta?.property?.type;

  switch (type) {
    case 'TITLE': {
      return <TitleCell {...properties} />;
    }
    case 'TEXT': {
      return <TextCell {...properties} />;
    }
    case 'NUMBER': {
      return <NumberCell {...properties} />;
    }
    case 'SELECT': {
      return <SelectCell {...properties} />;
    }
    case 'MULTI_SELECT': {
      return <MultiSelectCell {...properties} />;
    }
    case 'STATUS': {
      return <StatusCell {...properties} />;
    }
    case 'DATE': {
      return <DateCell {...properties} />;
    }
    case 'CHECKBOX': {
      return <CheckboxCell {...properties} />;
    }
    case 'URL': {
      return <UrlCell {...properties} />;
    }
    case 'EMAIL': {
      return <PlaceholderCell {...properties} />;
    }
    case 'PHONE': {
      return <PlaceholderCell {...properties} />;
    }
    case 'CREATED_TIME': {
      return <CreatedTimeCell {...properties} />;
    }
    case 'UPDATED_TIME': {
      return <UpdatedTimeCell {...properties} />;
    }
    case 'RELATION': {
      return (
        <RelationCell
          propertyId={properties.propertyId}
          rowId={properties.rowId}
          value={properties.cell?.value}
          config={
            properties.column.columnDef.meta?.property
              ?.relationConfig as unknown as RelationConfig
          }
        />
      );
    }
    case 'ROLLUP': {
      return (
        <RollupCell
          propertyId={properties.propertyId}
          rowId={properties.rowId}
          config={
            properties.column.columnDef.meta?.property
              ?.rollupConfig as unknown as RollupConfig
          }
        />
      );
    }
    case 'FORMULA': {
      return (
        <FormulaCell
          propertyId={properties.propertyId}
          rowId={properties.rowId}
          config={
            properties.column.columnDef.meta?.property
              ?.formulaConfig as unknown as FormulaConfig
          }
        />
      );
    }
    default: {
      return <TextCell {...properties} />;
    }
  }
}
