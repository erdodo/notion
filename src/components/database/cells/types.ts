import { Property } from '@prisma/client';
import { Column, Row, Table, Cell } from '@tanstack/react-table';

export interface CustomCellMeta {
  property: Property;
  getPageId: (rowId: string) => string | null;
}

export interface CellProperties {
  getValue: () => unknown;
  rowId: string;
  propertyId: string;
  table: Table<unknown>;
  column: Column<unknown, unknown> & { columnDef: { meta?: CustomCellMeta } };
  cell: Cell<unknown, unknown>;
  isEditing: boolean;
  startEditing: () => void;
  stopEditing: () => void;
  updateValue: (value: unknown) => void;
  row?: Row<unknown>;
  onPropertyUpdate?: (propertyId: string, data: Partial<Property>) => void;
}
