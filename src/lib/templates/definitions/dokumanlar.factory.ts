import fs from 'node:fs/promises';
import path from 'node:path';

import { db as database } from '../../db';
import { Block } from '../../import/markdown-parser';
import { Template, TemplateContext } from '../types';

const _TEMPLATE_ROOT_NAME = 'Dökümanlar';

export const dokumanlarTemplate: Template = {
  id: 'dokumanlar-template',
  label: 'Dökümanlar',
  icon: '📚',
  description: 'HTML export tabanlı dökümanlar şablonu.',
  factory: async (context: TemplateContext): Promise<string> => {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const entries = await fs.readdir(templatesDir);

    const targetDirName = entries.find(
      (e) => e.normalize('NFC') === 'Dökümanlar'
    );

    if (!targetDirName) {
      throw new Error('Dökümanlar template folder not found');
    }

    const baseDir = path.join(templatesDir, targetDirName);

    const files = await fs.readdir(baseDir);
    const mainFile = files.find(
      (f) => f.endsWith('.html') && f.includes('Dökümanlar Sitesi')
    );

    if (!mainFile) {
      throw new Error('Main HTML file for Dökümanlar template not found');
    }

    let pageId = context.targetPageId;
    const pageTitle = 'Dökümanlar Sitesi';

    if (pageId) {
      await database.page.update({
        where: { id: pageId },
        data: {
          title: pageTitle,
          icon: '📚',
          coverImage: null,
        },
      });
    } else {
      const page = await database.page.create({
        data: {
          title: pageTitle,
          icon: '📚',
          userId: context.userId,
          parentId: context.parentId || null,
        },
      });
      pageId = page.id;
    }

    await processHtmlPage(baseDir, mainFile, pageId, context.userId);

    return pageId;
  },
};

async function processHtmlPage(
  baseDir: string,
  relativeFilePath: string,
  pageId: string,
  userId: string
) {
  const fullPath = path.join(baseDir, relativeFilePath);
  let content = '';
  try {
    content = await fs.readFile(fullPath, 'utf8');
  } catch {
    console.warn(`Could not read file: ${fullPath}`);
    return;
  }

  const blocks = await parseHtmlToBlocks(
    content,
    baseDir,
    relativeFilePath,
    pageId,
    userId
  );

  await database.page.update({
    where: { id: pageId },
    data: {
      content: JSON.stringify(blocks),
    },
  });
}

function decodeHtml(html: string) {
  return html
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#x27;', "'");
}

async function parseHtmlToBlocks(
  html: string,
  baseDir: string,
  currentFileRelative: string,
  currentPageId: string,
  userId: string
): Promise<Block[]> {
  const blocks: Block[] = [];

  const bodyStartTag = '<div class="page-body">';
  const bodyStart = html.indexOf(bodyStartTag);
  if (bodyStart === -1) {
    console.warn('Could not find .page-body in HTML. Using fallback.');
    return [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Error: Template format not recognized.',
            styles: { color: 'red' },
          },
        ],
      },
    ];
  }

  const contentStart = bodyStart + bodyStartTag.length;
  const bodyContent = html.slice(Math.max(0, contentStart));

  const chunks = extractTopLevelDivs(bodyContent);

  console.log(
    `[Dökümanlar Template] Parsed ${chunks.length} chunks from ${currentFileRelative}`
  );

  for (const chunk of chunks) {
    const innerContentMatch = /<div[^>]*>(.*)<\/div>/s.exec(chunk);
    if (!innerContentMatch) continue;

    const inner = innerContentMatch[1].trim();

    const hMatch = /^<h([1-3])\b[^>]*>(.*?)<\/h\1>/s.exec(inner);
    if (hMatch) {
      const level = Number.parseInt(hMatch[1]);
      const text = stripTags(hMatch[2]);
      blocks.push({
        type: 'heading',
        props: { level: level as number },
        content: [{ type: 'text', text: decodeHtml(text), styles: {} }],
      });
      continue;
    }

    if (inner.includes('class="link-to-page"')) {
      const aMatch = /<a href="(.*?)"[^>]*>(.*?)<\/a>/s.exec(inner);
      if (aMatch) {
        const href = aMatch[1];
        const text = stripTags(aMatch[2]);

        if (href.endsWith('.html')) {
          const dirOfCurrent = path.dirname(currentFileRelative);
          const subPageRelative = path.join(
            dirOfCurrent,
            decodeURIComponent(href)
          );

          const subPage = await database.page.create({
            data: {
              title: decodeHtml(text),
              userId: userId,
              parentId: currentPageId,
              icon: '📄',
            },
          });

          await processHtmlPage(baseDir, subPageRelative, subPage.id, userId);

          blocks.push({
            type: 'paragraph',
            content: [
              {
                type: 'link',
                href: `/documents/${subPage.id}`,
                content: [{ type: 'text', text: decodeHtml(text), styles: {} }],
              },
            ],
          });
        }
        continue;
      }
    }

    if (inner.includes('class="toggle"')) {
      const summaryMatch = /<summary[^>]*>(.*?)<\/summary>/s.exec(inner);
      const summaryText = summaryMatch ? stripTags(summaryMatch[1]) : 'Toggle';

      const children: Block[] = [];
      if (inner.includes('<code')) {
        const codeBlock = extractCodeBlock(inner);
        if (codeBlock) children.push(codeBlock);
      }

      blocks.push({
        type: 'paragraph',
        content: [{ type: 'text', text: decodeHtml(summaryText), styles: {} }],
        children: children,
      });
      continue;
    }

    const codeB = extractCodeBlock(inner);
    if (codeB) {
      blocks.push(codeB);
      continue;
    }

    const text = stripTags(inner);
    if (text.trim()) {
      blocks.push({
        type: 'paragraph',
        content: [{ type: 'text', text: decodeHtml(text), styles: {} }],
      });
    }
  }

  if (blocks.length === 0) {
    console.warn(
      `[Dökümanlar Template] No valid blocks found in ${currentFileRelative}. Using fallback.`
    );
    blocks.push({
      type: 'paragraph',
      content: [{ type: 'text', text: ' ', styles: {} }],
    });
  }

  return blocks;
}

function extractCodeBlock(html: string) {
  if (html.includes('<code')) {
    const match = /<code class="language-(.*?)"[^>]*>(.*?)<\/code>/s.exec(html);
    if (match) {
      const lang = match[1];
      const code = decodeHtml(match[2]);
      return {
        type: 'codeBlock',
        props: { language: lang.toLowerCase() },
        content: [{ type: 'text', text: code, styles: {} }],
      };
    }
  }
  return null;
}

function stripTags(html: string) {
  return html
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function extractTopLevelDivs(html: string): string[] {
  const chunks: string[] = [];
  let depth = 0;
  let start = -1;
  let index = 0;

  while (index < html.length) {
    if (html.slice(Math.max(0, index)).startsWith('<div')) {
      const isTarget = html
        .slice(Math.max(0, index))
        .startsWith('<div style="display:contents"');

      if (depth === 0 && isTarget) {
        start = index;
      }
      depth++;

      index += 4;
    } else if (html.slice(Math.max(0, index)).startsWith('</div>')) {
      depth--;
      if (depth === 0 && start !== -1) {
        const end = index + 6;
        chunks.push(html.substring(start, end));
        start = -1;
      }
      index += 6;
    } else {
      index++;
    }
  }

  return chunks;
}
