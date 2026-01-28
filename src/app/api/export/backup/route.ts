import type { Database, DatabaseRow, Page, Property } from '@prisma/client';
import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  blocksToMarkdown,
  blocksToHTML,
  formatCellValueForCSV,
} from '@/lib/export-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';

    const pages = await db.page.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        database: {
          include: {
            properties: { orderBy: { order: 'asc' } },
            rows: {
              include: { cells: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const zip = new JSZip();

    const metadata = {
      exportedAt: new Date().toISOString(),
      userId: session.user.id,
      pageCount: pages.length,
      format,
    };
    zip.file('_metadata.json', JSON.stringify(metadata, null, 2));

    const structure = buildPageStructure(pages);
    zip.file('_structure.json', JSON.stringify(structure, null, 2));

    for (const p of pages) {
      const page = p as Page & {
        database: (Database & {
          properties: Property[];
          rows: (DatabaseRow & { cells: { id: string; propertyId: string; value: unknown }[] })[];
        }) | null;
        content: string | null;
        coverImage: string | null;
      };
      const folderPath = getPagePath(page, pages);
      const filename = sanitizeFilename(page.title || 'Untitled');

      let content = '';
      let extension = '';

      if (page.isDatabase && page.database) {
        const csv = databaseToCSV(page.database);
        content = csv;
        extension = 'csv';
      } else {
        const blocks = page.content ? JSON.parse(page.content) : [];

        switch (format) {
          case 'html': {
            content = blocksToHTML(blocks, page.title);
            extension = 'html';
            break;
          }
          case 'json': {
            content = JSON.stringify(
              {
                title: page.title,
                icon: page.icon,
                cover: page.coverImage,
                content: blocks,
              },
              null,
              2
            );
            extension = 'json';
            break;
          }
          default: {
            content = `# ${page.title}\n\n` + blocksToMarkdown(blocks);
            extension = 'md';
          }
        }
      }

      const fullPath = folderPath
        ? `${folderPath}/${filename}.${extension}`
        : `${filename}.${extension}`;
      zip.file(fullPath, content);
    }

    const zipBuffer = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const timestamp = new Date().toISOString().split('T')[0];

    return new Response(zipBuffer.buffer as ArrayBuffer, {
      headers: new Headers({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="notion-backup-${timestamp}.zip"`,
      }),
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}

function buildPageStructure(
  pages: (Page & { parentId: string | null })[]
): Array<{
  id: string;
  title: string | null;
  icon: string | null;
  isDatabase: boolean;
  children: unknown[];
}> {
  const map = new Map<string, {
    id: string;
    title: string | null;
    icon: string | null;
    isDatabase: boolean;
    children: unknown[];
  }>();
  const roots: Array<{
    id: string;
    title: string | null;
    icon: string | null;
    isDatabase: boolean;
    children: unknown[];
  }> = [];

  for (const page of pages) {
    map.set(page.id, {
      id: page.id,
      title: page.title,
      icon: page.icon,
      isDatabase: page.isDatabase,
      children: [],
    });
  }

  for (const page of pages) {
    const node = map.get(page.id);
    if (node && page.parentId && map.has(page.parentId)) {
      const parentNode = map.get(page.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else if (node) {
      roots.push(node);
    }
  }

  return roots;
}

function getPagePath(
  page: Page & { parentId: string | null },
  allPages: (Page & { parentId: string | null })[]
): string {
  const path: string[] = [];
  let current: (Page & { parentId: string | null }) | undefined = page;

  const visited = new Set();

  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = allPages.find((p) => p.id === current?.parentId);
    if (parent) {
      path.unshift(sanitizeFilename(parent.title || 'Untitled'));
      current = parent;
    } else {
      break;
    }
  }

  return path.join('/');
}

function databaseToCSV(database: Database & {
  properties: Property[];
  rows: (DatabaseRow & { cells: { propertyId: string; value: unknown }[] })[];
}): string {
  const headers = database.properties.map((p) => p.name);
  const data = database.rows.map((row) => {
    const rowData: Record<string, string> = {};
    database.properties.forEach((property) => {
      const cell = row.cells.find((c) => c.propertyId === property.id);
      rowData[property.name] = formatCellValueForCSV(
        cell?.value,
        property.type
      );
    });
    return rowData;
  });

  return Papa.unparse(data, { columns: headers, header: true });
}

function sanitizeFilename(name: string): string {
  return (
    name
      .replaceAll(/[<>:"/\\|?*]/g, '_')
      .replaceAll(/\s+/g, '_')
      .slice(0, 100) || 'untitled'
  );
}
