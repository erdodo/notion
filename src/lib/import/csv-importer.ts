import { PropertyType } from '@prisma/client';
import Papa from 'papaparse';

import { db as database_ } from '../db';

interface CsvImportResult {
  databaseId: string;
  rowCount: number;
}

export async function importCsvAsDatabase(
  csvContent: string,
  databaseName: string,
  parentId: string,
  userId: string
): Promise<CsvImportResult> {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error('CSV Parse Errors:', parsed.errors);
    throw new Error('Failed to parse CSV');
  }

  const rows = parsed.data as Record<string, unknown>[];
  if (rows.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = parsed.meta.fields || Object.keys(rows[0]);

  const page = await database_.page.create({
    data: {
      title: databaseName,
      userId: userId,
      parentId: parentId,
      isDatabase: true,
      isFullWidth: true,
    },
  });

  const database = await database_.database.create({
    data: {
      pageId: page.id,
      defaultView: 'table',
    },
  });

  await database_.databaseView.create({
    data: {
      databaseId: database.id,
      name: 'Table View',
      type: 'table',
      isDefault: true,
    },
  });

  const propertyMap = new Map<string, string>();

  for (const [index, header] of headers.entries()) {
    let type: PropertyType = PropertyType.TEXT;

    if (index === 0) {
      type = PropertyType.TITLE;
    } else if (
      header.toLowerCase().includes('date') ||
      header.toLowerCase().includes('time')
    ) {
      type = PropertyType.DATE;
    } else if (
      header.toLowerCase().includes('price') ||
      header.toLowerCase().includes('amount') ||
      header.toLowerCase().includes('cost')
    ) {
      type = PropertyType.NUMBER;
    } else if (header.toLowerCase().includes('status')) {
      type = PropertyType.STATUS;
    } else if (
      header.toLowerCase().includes('category') ||
      header.toLowerCase().includes('tag')
    ) {
      type = PropertyType.MULTI_SELECT;
    }

    const property = await database_.property.create({
      data: {
        databaseId: database.id,
        name: header,
        type: type,
        order: index,
      },
    });
    propertyMap.set(header, property.id);
  }

  for (const [index, rowData] of rows.entries()) {
    const titleValue = rowData[headers[0]] || 'Untitled';

    const rowPage = await database_.page.create({
      data: {
        title: String(titleValue),
        userId: userId,
        parentId: page.id,
        databaseRow: {
          create: {
            databaseId: database.id,
            order: index,
          },
        },
      },
      include: {
        databaseRow: true,
      },
    });

    const rowId = rowPage.databaseRow!.id;

    for (const header of headers) {
      const propertyId = propertyMap.get(header);
      if (!propertyId) continue;

      const value = rowData[header];
      if (value === undefined || value === null || value === '') continue;

      await database_.cell.create({
        data: {
          propertyId: propertyId,
          rowId: rowId,
          value: value as never,
        },
      });
    }
  }

  return {
    databaseId: database.id,
    rowCount: rows.length,
  };
}
