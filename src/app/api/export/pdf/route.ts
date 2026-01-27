import { PartialBlock } from '@blocknote/core';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { blocksToHTML } from '@/lib/export-utils';

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
      where: { id: pageId, userId: session.user.id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    let blocks: PartialBlock[] = [];
    if (page.content) {
      try {
        blocks = JSON.parse(page.content);
      } catch {
        blocks = [];
      }
    }

    const html = generatePDFHTML(
      blocks,
      page.title,
      page.icon,
      page.coverImage
    );

    return NextResponse.json({
      html,
      title: page.title,
      filename: sanitizeFilename(page.title),
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generatePDFHTML(
  blocks: PartialBlock[],
  title: string,
  icon?: string | null,
  cover?: string | null
): string {
  const fullHtml = blocksToHTML(blocks, title);

  let content = fullHtml;
  if (cover || icon) {
    const coverHtml = cover
      ? `<img src="${cover}" style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 20px; border-radius: 4px;">`
      : '';
    const iconHtml = icon
      ? `<span style="font-size: 1.2em; margin-right: 8px;">${icon}</span>`
      : '';

    content = content.replace(
      /<h1>(.*?)<\/h1>/,
      `<h1>${iconHtml}$1</h1>${coverHtml}`
    );
  }

  return content;
}

function sanitizeFilename(name: string): string {
  return (
    name
      .replaceAll(/[<>:"/\\|?*]/g, '_')
      .replaceAll(/\s+/g, '_')
      .slice(0, 100) || 'document'
  );
}
