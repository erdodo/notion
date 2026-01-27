'use server';

import {
  PropertyType,
  Database,
  DatabaseRow,
  LinkedDatabase,
  DatabaseTemplate,
  Prisma,
} from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { checkAndRunAutomations } from '@/lib/automation-service';
import { db } from '@/lib/db';
import { FormulaResult, evaluateFormula } from '@/lib/formula-engine';
import { RelationCellValue } from '@/lib/relation-service';
import { RollupConfig, computeRollup } from '@/lib/rollup-service';

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    return user;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function createDatabase(parentId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const page = await db.page.create({
    data: {
      title: 'Untitled Database',
      userId: user.id,
      parentId: parentId,
      isDatabase: true,
    },
  });

  const database = await db.database.create({
    data: {
      pageId: page.id,
      properties: {
        create: {
          name: 'Name',
          type: 'TITLE',
          order: 0,
        },
      },
      views: {
        create: {
          name: 'Table',
          type: 'table',
          order: 0,
          isDefault: true,
        },
      },
    },
  });

  await addRow(database.id);

  revalidatePath('/documents');
  return { page, database };
}

export async function getDatabase(pageId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const database = await db.database.findUnique({
    where: { pageId },
    include: {
      properties: {
        orderBy: { order: 'asc' },
      },
      views: {
        orderBy: { order: 'asc' },
      },
      rows: {
        orderBy: { order: 'asc' },
        include: {
          cells: true,
          page: true,
        },
      },
    },
  });

  return database;
}

export async function getPublicDatabase(pageId: string) {
  const session = await auth();

  const database = await db.database.findUnique({
    where: { pageId },
    include: {
      properties: {
        orderBy: { order: 'asc' },
      },
      views: {
        orderBy: { order: 'asc' },
      },
      rows: {
        orderBy: { order: 'asc' },
        include: {
          cells: true,
          page: true,
        },
      },
      page: true,
    },
  });

  if (!database) return null;

  const isOwner = session?.user?.id === database.page.userId;
  const isPublished = database.page.isPublished;

  if (!isPublished && !isOwner) {
    return null;
  }

  return database;
}

export async function deleteDatabase(databaseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const database = await db.database.findUnique({
    where: { id: databaseId },
  });

  if (!database) throw new Error('Database not found');

  await db.page.delete({
    where: { id: database.pageId },
  });

  revalidatePath('/documents');
}

export async function addProperty(
  databaseId: string,
  data: { name: string; type: PropertyType; options?: unknown }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const count = await db.property.count({
    where: { databaseId },
  });

  const property = await db.property.create({
    data: {
      databaseId,
      name: data.name,
      type: data.type,
      options:
        (data.options as Prisma.InputJsonValue) ??
        (data.type === 'STATUS'
          ? ([
              { id: '1', name: 'Not Started', color: 'gray', group: 'todo' },
              {
                id: '2',
                name: 'In Progress',
                color: 'blue',
                group: 'inprogress',
              },
              { id: '3', name: 'Done', color: 'green', group: 'complete' },
            ] as Prisma.InputJsonValue)
          : (undefined as unknown as Prisma.InputJsonValue)),
      order: count,
    },
  });

  revalidatePath(`/documents`);

  return property;
}

export async function updateProperty(
  propertyId: string,
  data: {
    name?: string;
    type?: PropertyType;
    options?: Prisma.InputJsonValue;
    width?: number;
    isVisible?: boolean;
    relationConfig?: Prisma.InputJsonValue;
    rollupConfig?: Prisma.InputJsonValue;
    formulaConfig?: Prisma.InputJsonValue;
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const property = await db.property.update({
    where: { id: propertyId },
    data,
  });

  return property;
}

export async function deleteProperty(propertyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    await db.property.delete({
      where: { id: propertyId },
    });
    revalidatePath('/documents');
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return;
    }
    throw error;
  }
}

export async function reorderProperties(
  databaseId: string,
  orderedIds: string[]
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const transaction = orderedIds.map((id, index) =>
    db.property.update({
      where: { id },
      data: { order: index },
    })
  );

  await db.$transaction(transaction);
}

export async function addRow(databaseId: string, parentRowId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const database = await db.database.findUnique({
    where: { id: databaseId },
  });
  if (!database) throw new Error('Database not found');

  const page = await db.page.create({
    data: {
      title: '',
      userId: user.id,
      parentId: database.pageId,
    },
  });

  const count = await db.databaseRow.count({
    where: { databaseId },
  });

  const row = await db.databaseRow.create({
    data: {
      databaseId,
      pageId: page.id,
      order: count,
      parentRowId,
    },
  });

  return row;
}

export async function deleteRow(rowId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const row = await db.databaseRow.findUnique({
    where: { id: rowId },
  });

  if (!row) return;

  await (row.pageId
    ? db.page.delete({
        where: { id: row.pageId },
      })
    : db.databaseRow.delete({
        where: { id: rowId },
      }));
}

export async function duplicateRow(_rowId: string) {}

export async function reorderRows(databaseId: string, orderedIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const transaction = orderedIds.map((id, index) =>
    db.databaseRow.update({
      where: { id },
      data: { order: index },
    })
  );

  await db.$transaction(transaction);
}

export async function updateCell(cellId: string, value: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const cell = await db.cell.update({
    where: { id: cellId },
    data: { value: value as Prisma.InputJsonValue },
  });

  const cellWithProperty = await db.cell.findUnique({
    where: { id: cellId },
    include: { property: true, row: true },
  });

  if (
    cellWithProperty?.property.type === 'TITLE' &&
    cellWithProperty.row.pageId
  ) {
    const title =
      typeof (value as Record<string, unknown>)?.value === 'string'
        ? (value as Record<string, unknown>).value
        : 'Untitled';
    await db.page.update({
      where: { id: cellWithProperty.row.pageId },
      data: { title: title as string },
    });
  }

  try {
    if (cellWithProperty && cellWithProperty.row) {
      await checkAndRunAutomations(
        cellWithProperty.row.databaseId,
        cellWithProperty.row.id,
        {
          propertyId: cellWithProperty.propertyId,
          newValue: value,
          oldValue: cellWithProperty.value,
        }
      );
    }
  } catch (error) {
    console.error('Automation error:', error);
  }

  return cell;
}

export async function updateCellByPosition(
  propertyId: string,
  rowId: string,
  value: unknown
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const existingCell = await db.cell.findUnique({
    where: {
      propertyId_rowId: {
        propertyId,
        rowId,
      },
    },
  });

  const rowExists = await db.databaseRow.findUnique({
    where: { id: rowId },
    select: { id: true },
  });

  if (!rowExists) {
    return null;
  }

  const cell = await db.cell.upsert({
    where: {
      propertyId_rowId: {
        propertyId,
        rowId,
      },
    },
    update: { value: value as Prisma.InputJsonValue },
    create: {
      propertyId,
      rowId,
      value: value as Prisma.InputJsonValue,
    },
    include: { property: true },
  });

  if (cell.property.type === 'TITLE') {
    const row = await db.databaseRow.findUnique({ where: { id: rowId } });
    if (row?.pageId) {
      const title =
        typeof value === 'string'
          ? value
          : ((value as Record<string, unknown>)?.value as string) || 'Untitled';
      await db.page.update({
        where: { id: row.pageId },
        data: { title: title },
      });
    }
  }

  try {
    const row = await db.databaseRow.findUnique({ where: { id: rowId } });
    if (row) {
      await checkAndRunAutomations(row.databaseId, row.id, {
        propertyId,
        newValue: value,
        oldValue: existingCell?.value,
      });
    }
  } catch (error) {
    console.error('Automation error:', error);
  }

  return cell;
}

export async function moveRowToGroup(
  rowId: string,
  propertyId: string,
  groupId: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  await updateCellByPosition(propertyId, rowId, groupId);
}

export async function updateDatabaseDefaultView(
  databaseId: string,
  view: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  await db.database.update({
    where: { id: databaseId },
    data: { defaultView: view },
  });

  revalidatePath(`/documents`);
}

export async function getAllDatabases(): Promise<Database[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const databases = await db.database.findMany({
    where: {
      page: {
        userId: session.user.id,
        isArchived: false,
      },
    },
    include: {
      page: { select: { title: true, icon: true } },
      properties: { orderBy: { order: 'asc' } },
    },
  });

  return databases;
}

export async function getLinkedRows(
  targetDatabaseId: string,
  linkedRowIds: string[]
): Promise<DatabaseRow[]> {
  const rows = await db.databaseRow.findMany({
    where: {
      databaseId: targetDatabaseId,
      id: { in: linkedRowIds },
    },
    include: {
      cells: true,
      page: { select: { title: true, icon: true } },
    },
  });

  return rows;
}

export async function linkRows(
  cellId: string,
  targetRowIds: string[]
): Promise<void> {
  await db.cell.update({
    where: { id: cellId },
    data: {
      value: { linkedRowIds: targetRowIds },
    },
  });

  revalidatePath('/documents');
}

export async function unlinkRow(
  cellId: string,
  rowIdToRemove: string
): Promise<void> {
  const cell = await db.cell.findUnique({ where: { id: cellId } });
  if (!cell?.value) return;

  const currentValue = cell.value as unknown as RelationCellValue;
  const updatedIds = currentValue.linkedRowIds.filter(
    (id) => id !== rowIdToRemove
  );

  await db.cell.update({
    where: { id: cellId },
    data: {
      value: { linkedRowIds: updatedIds },
    },
  });

  revalidatePath('/documents');
}

export async function computeRollupValue(
  rowId: string,
  rollupPropertyId: string
): Promise<unknown> {
  const property = await db.property.findUnique({
    where: { id: rollupPropertyId },
    include: { database: true },
  });

  if (!property?.rollupConfig) return null;

  const config = property.rollupConfig as unknown as RollupConfig;

  const relationCell = await db.cell.findFirst({
    where: {
      rowId,
      propertyId: config.relationPropertyId,
    },
  });

  if (!relationCell?.value) return null;

  const linkedRowIds = (relationCell.value as unknown as RelationCellValue)
    .linkedRowIds;
  if (linkedRowIds.length === 0) return null;

  const targetCells = await db.cell.findMany({
    where: {
      rowId: { in: linkedRowIds },
      propertyId: config.targetPropertyId,
    },
  });

  const values = targetCells.map(
    (c) => (c.value as Record<string, unknown>)?.value ?? c.value
  );

  return computeRollup(values, config.aggregation);
}

interface FormulaConfig {
  expression: string;
  resultType: 'string' | 'number' | 'boolean' | 'date';
}

export async function computeFormulaValue(
  rowId: string,
  formulaPropertyId: string
): Promise<FormulaResult> {
  const property = await db.property.findUnique({
    where: { id: formulaPropertyId },
    include: {
      database: {
        include: { properties: true },
      },
    },
  });

  if (!property?.formulaConfig)
    return { value: null, error: 'No formula configured' };

  const config = property.formulaConfig as unknown as FormulaConfig;

  const cells = await db.cell.findMany({
    where: { rowId },
  });

  const properties: Record<string, unknown> = {};
  for (const p of property.database.properties) {
    const cell = cells.find((c) => c.propertyId === p.id);
    properties[p.name] =
      (cell?.value as Record<string, unknown>)?.value ?? cell?.value ?? null;
  }

  return evaluateFormula(config.expression, {
    props: properties,
    row: null,
    properties: property.database.properties,
  });
}

export async function createLinkedDatabase(
  pageId: string,
  sourceDatabaseId: string,
  title?: string
): Promise<LinkedDatabase> {
  const linkedDatabase = await db.linkedDatabase.create({
    data: {
      pageId,
      sourceDatabaseId,
      title,
      viewConfig: {
        filters: [],
        sorts: [],
        hiddenProperties: [],
        view: 'table',
      },
    },
  });

  revalidatePath(`/documents/${pageId}`);
  return linkedDatabase;
}

export async function deleteLinkedDatabase(
  linkedDatabaseId: string
): Promise<void> {
  await db.linkedDatabase.delete({
    where: { id: linkedDatabaseId },
  });

  revalidatePath('/documents');
}

export async function updateLinkedDatabaseConfig(
  linkedDatabaseId: string,
  viewConfig: Record<string, unknown>
): Promise<void> {
  await db.linkedDatabase.update({
    where: { id: linkedDatabaseId },
    data: { viewConfig: viewConfig as Prisma.InputJsonValue },
  });

  revalidatePath('/documents');
}

export async function getLinkedDatabase(linkedDatabaseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const linkedDatabase = await db.linkedDatabase.findUnique({
    where: {
      id: linkedDatabaseId,
    },
    include: {
      page: true,
      sourceDatabase: {
        include: {
          page: true,
          properties: {
            orderBy: { order: 'asc' },
          },
          views: {
            orderBy: { order: 'asc' },
          },
          rows: {
            orderBy: { order: 'asc' },
            include: {
              cells: true,
              page: true,
            },
          },
        },
      },
    },
  });

  if (linkedDatabase?.page?.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  return linkedDatabase;
}

export async function createTemplate(
  databaseId: string,
  data: {
    name: string;
    icon?: string;
    content?: string;
    defaultCells?: Record<string, unknown>;
  }
): Promise<DatabaseTemplate> {
  const template = await db.databaseTemplate.create({
    data: {
      databaseId,
      name: data.name,
      icon: data.icon,
      content: data.content,
      defaultCells: data.defaultCells as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/documents');
  return template;
}

export async function createTemplateFromRow(
  rowId: string,
  name: string
): Promise<DatabaseTemplate> {
  const row = await db.databaseRow.findUnique({
    where: { id: rowId },
    include: {
      cells: true,
      page: true,
      database: true,
    },
  });

  if (!row) throw new Error('Row not found');

  const defaultCells: Record<string, unknown> = {};
  for (const cell of row.cells) {
    defaultCells[cell.propertyId] = cell.value;
  }

  const template = await db.databaseTemplate.create({
    data: {
      databaseId: row.databaseId,
      name,
      icon: row.page?.icon,
      content: row.page?.content,
      defaultCells: defaultCells as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/documents');
  return template;
}

export async function getTemplates(
  databaseId: string
): Promise<DatabaseTemplate[]> {
  return db.databaseTemplate.findMany({
    where: { databaseId },
    orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
  });
}

export async function updateTemplate(
  templateId: string,
  data: Partial<DatabaseTemplate>
): Promise<void> {
  const { databaseId, id, createdAt, updatedAt, ...updateData } = data;
  const _databaseId = databaseId;
  const _id = id;
  const _createdAt = createdAt;
  const _updatedAt = updatedAt;

  await db.databaseTemplate.update({
    where: { id: templateId },
    data: updateData as never,
  });

  revalidatePath('/documents');
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await db.databaseTemplate.delete({
    where: { id: templateId },
  });

  revalidatePath('/documents');
}

export async function createRowFromTemplate(
  databaseId: string,
  templateId: string
): Promise<DatabaseRow> {
  const template = await db.databaseTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) throw new Error('Template not found');

  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const page = await db.page.create({
    data: {
      title: 'Untitled',
      icon: template.icon,
      content: template.content,
      userId: user.id,
      parentId: databaseId,
    },
  });

  const row = await db.databaseRow.create({
    data: {
      databaseId,
      pageId: page.id,
    },
    include: { page: true },
  });

  if (template.defaultCells) {
    const defaultCells = template.defaultCells as Prisma.JsonObject;
    const cellsToCreate = Object.entries(defaultCells).map(
      ([propertyId, value]) => ({
        propertyId,
        rowId: row.id,
        value: value as Prisma.InputJsonValue,
      })
    );

    await db.cell.createMany({ data: cellsToCreate });
  }

  revalidatePath('/documents');
  return row;
}

export async function getRowDetails(rowId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const rowWithPage = await db.databaseRow.findUnique({
    where: { id: rowId },
    include: {
      cells: true,
      database: {
        include: {
          properties: {
            orderBy: { order: 'asc' },
          },
          page: true,
        },
      },
    },
  });

  if (!rowWithPage) return null;

  return rowWithPage;
}
