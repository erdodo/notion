import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface Node {
  title: string;
  icon?: string;
  id: string;
  children: Node[];
  isDatabase?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'merge';

    if (!file) {
      return NextResponse.json(
        { error: 'ZIP file is required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const metadataFile = zip.file('_metadata.json');
    if (!metadataFile) {
      return NextResponse.json(
        { error: 'Invalid backup file' },
        { status: 400 }
      );
    }

    const structureFile = zip.file('_structure.json');
    const structure: Node[] = structureFile
      ? JSON.parse(await structureFile.async('string'))
      : [];

    if (mode === 'replace') {
      await db.page.deleteMany({
        where: { userId: userId },
      });
    }

    const idMap = new Map<string, string>();
    let importedCount = 0;

    async function importPage(node: Node, parentId: string | null) {
      const possiblePaths = [
        `${node.title}.md`,
        `${node.title}.html`,
        `${node.title}.json`,
        `${node.title}.csv`,
      ];

      let content: string | null = null;
      let isDatabase = node.isDatabase || false;

      for (const path of possiblePaths) {
        const file = zip.file(
          new RegExp(
            path.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) + '$'
          )
        );
        if (file && file.length > 0) {
          content = await file[0].async('string');
          if (path.endsWith('.csv')) isDatabase = true;
          break;
        }
      }

      const newPage = await db.page.create({
        data: {
          title: node.title,
          icon: node.icon,
          content: content && !isDatabase ? content : null,
          userId: userId,
          parentId,
          isDatabase,
        },
      });

      idMap.set(node.id, newPage.id);
      importedCount++;

      if (node.children?.length > 0) {
        for (const child of node.children) {
          await importPage(child, newPage.id);
        }
      }
    }

    for (const rootNode of structure) {
      await importPage(rootNode, null);
    }

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} pages`,
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
