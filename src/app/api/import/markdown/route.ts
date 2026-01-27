import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

function parseMarkdownToBlocks(markdown: string) {
  const lines = markdown.split('\n');
  const blocks = [];

  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'codeBlock',
          props: { language: codeLanguage },
          content: [{ type: 'text', text: codeContent.trim(), styles: {} }],
        });
        inCodeBlock = false;
        codeContent = '';
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3);
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) {
      blocks.push({
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: trimmed.slice(2), styles: {} }],
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: trimmed.slice(3), styles: {} }],
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'heading',
        props: { level: 3 },
        content: [{ type: 'text', text: trimmed.slice(4), styles: {} }],
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        type: 'bulletListItem',
        content: [{ type: 'text', text: trimmed.slice(2), styles: {} }],
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({
        type: 'numberedListItem',
        content: [
          { type: 'text', text: trimmed.replace(/^\d+\.\s/, ''), styles: {} },
        ],
      });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({
        type: 'quote',
        content: [{ type: 'text', text: trimmed.slice(2), styles: {} }],
      });
    } else {
      blocks.push({
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed, styles: {} }],
      });
    }
  }

  return blocks;
}

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

    const text = await file.text();
    const title = file.name.replace(/\.md$/i, '');
    const blocks = parseMarkdownToBlocks(text);

    const page = await db.page.create({
      data: {
        title,
        content: JSON.stringify(blocks),
        userId: session.user.id,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Imported successfully',
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
