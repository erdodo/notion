import { DatabaseRow } from '@prisma/client';

export interface RelationConfig {
  targetDatabaseId: string;
  bidirectional: boolean;
  reversePropertyId?: string;
  limitType: 'none' | 'one';
}

export interface RelationCellValue {
  linkedRowIds: string[];
}

export async function getLinkedRows(
  _targetDatabaseId: string,
  _linkedRowIds: string[]
): Promise<DatabaseRow[]> {
  return [];
}

export async function linkRows(
  _propertyId: string,
  _sourceRowId: string,
  _targetRowIds: string[],
  _bidirectional: boolean,
  _reversePropertyId?: string
): Promise<void> {}

export async function unlinkRow(
  _propertyId: string,
  _sourceRowId: string,
  _targetRowId: string,
  _bidirectional: boolean,
  _reversePropertyId?: string
): Promise<void> {}
