import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatCellValueForCSV } from '@/lib/export-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    const page = await db.page.findUnique({
      where: { id: pageId },
      include: {
        database: {
          include: {
            properties: { orderBy: { order: 'asc' } },
            rows: {
              include: {
                cells: true,
                page: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const hasAccess = page.userId === session.user.id;
    if (!hasAccess) {
      const share = await db.pageShare.findFirst({
        where: {
          pageId,
          OR: [
            { userId: session.user.id },
            { email: session.user.email ?? '' },
          ],
        },
      });
      if (!share) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (!page.database) {
      return NextResponse.json(
        {
          error:
            'This page is not a database. CSV export is only supported for databases.',
        },
        { status: 400 }
      );
    }

    const properties = page.database.properties;
    const rows = page.database.rows;

    const headers = properties.map((p) => p.name);

    const csvData = rows.map((row) => {
      const rowObject: Record<string, string> = {};

      for (const property of properties) {
        const cell = row.cells.find((c) => c.propertyId === property.id);

        let value = '';
        value =
          property.type === 'TITLE' && row.page
            ? row.page.title
            : formatCellValueForCSV(cell?.value, property.type);

        rowObject[property.name] = value;
      }
      return rowObject;
    });

    const csv = Papa.unparse({
      fields: headers,
      data: csvData,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(page.title)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function sanitizeFilename(name: string): string {
  return (
    name
      .replaceAll(/[<>:"/\\|?*]/g, '_')
      .replaceAll(/\s+/g, '_')
      .slice(0, 100) || 'database'
  );
}
