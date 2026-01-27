import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const parentId = formData.get('parentId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format' },
        { status: 400 }
      );
    }

    const rows = parseResult.data as Record<string, string>[];
    const headers = parseResult.meta.fields || [];

    if (headers.length === 0) {
      return NextResponse.json(
        { error: 'CSV has no headers' },
        { status: 400 }
      );
    }

    const title = file.name.replace(/\.csv$/i, '');

    const page = await db.page.create({
      data: {
        title,
        userId: session.user.id,
        parentId: parentId || null,
        isDatabase: true,
      },
    });

    const database = await db.database.create({
      data: {
        pageId: page.id,
        defaultView: 'table',
      },
    });

    const propertyIdMap = new Map<string, string>();

    for (const [index, header] of headers.entries()) {
      const type = index === 0 ? 'TITLE' : 'TEXT';

      const property = await db.property.create({
        data: {
          name: header,
          type,
          databaseId: database.id,
          order: index,
        },
      });
      propertyIdMap.set(header, property.id);
    }

    for (const [index, rowData] of rows.entries()) {
      const row = await db.databaseRow.create({
        data: {
          databaseId: database.id,
          order: index,
        },
      });

      for (const header of headers) {
        const value = rowData[header];
        const propertyId = propertyIdMap.get(header);

        if (propertyId && value !== undefined && value !== '') {
          if (headers.indexOf(header) === 0) {
            const rowPage = await db.page.create({
              data: {
                title: String(value),
                userId: session.user.id,
                parentId: page.id,
              },
            });

            await db.databaseRow.update({
              where: { id: row.id },
              data: { pageId: rowPage.id },
            });

            await db.cell.create({
              data: {
                rowId: row.id,
                propertyId: propertyId,
                value: String(value),
              },
            });
          } else {
            await db.cell.create({
              data: {
                rowId: row.id,
                propertyId: propertyId,
                value: String(value),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Imported CSV successfully',
      pageId: page.id,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
