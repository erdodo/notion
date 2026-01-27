import fs from 'node:fs/promises';
import path from 'node:path';

import { db as database } from '../db';
import { importCsvAsDatabase } from '../import/csv-importer';
import {
  parseMarkdownToBlocks,
  Block,
  InlineContent,
} from '../import/markdown-parser';

export async function getTemplateBlocks(
  baseDir: string,
  relativeFilePath: string,
  pageId: string,
  userId: string
) {
  const fullPath = path.join(baseDir, relativeFilePath);
  const markdownContent = await fs.readFile(fullPath, 'utf8');
  const blocks = parseMarkdownToBlocks(markdownContent);
  const processedBlocks: Block[] = [];

  let lastHeading = '';

  if (
    blocks.length > 0 &&
    blocks[0].type === 'heading' &&
    blocks[0].props?.level === 1
  ) {
    blocks.shift();
  }

  for (const block of blocks) {
    if (
      block.type === 'heading' &&
      (block.content as InlineContent[])?.[0]?.text
    ) {
      lastHeading = (block.content as InlineContent[])[0].text || '';
    }

    if (
      block.type === 'image' &&
      (block.props as Record<string, unknown>)?.url
    ) {
      const url = (block.props as Record<string, unknown>).url as string;
      if (!url.startsWith('http')) {
        const parts = baseDir.split(path.sep);
        const templateRootName = parts.at(-1);

        const dirOfCurrentFile = path.dirname(relativeFilePath);
        const fullRelativePath = path.join(
          dirOfCurrentFile,
          decodeURIComponent(url)
        );

        const webPath = `/templates/${templateRootName}/${fullRelativePath}`
          .replaceAll('\\', '/')
          .replaceAll('//', '/');

        (block.props as Record<string, unknown>).url = webPath;
      }
    }

    if (block.content && Array.isArray(block.content)) {
      const newContent = [];
      for (const contentItem of block.content as InlineContent[]) {
        if (contentItem.type === 'text') {
          const text = contentItem.text ?? '';
          const linkRegex = /\[(.*?)\]\((.*?)\)/g;
          let match;
          let lastIndex = 0;

          while ((match = linkRegex.exec(text)) !== null) {
            const label = match[1];
            const linkPath = match[2];
            const EXT = path.extname(linkPath).toLowerCase();

            const finalLabel =
              label === 'Untitled' && lastHeading ? lastHeading : label;

            if (match.index > lastIndex) {
              newContent.push({
                type: 'text',
                text: text.substring(lastIndex, match.index),
                styles: {},
              });
            }

            if (EXT === '.csv') {
              try {
                const dirOfCurrentFile = path.dirname(relativeFilePath);
                const csvRelativePath = path.join(
                  dirOfCurrentFile,
                  decodeURIComponent(linkPath)
                );
                const fullCsvPath = path.join(baseDir, csvRelativePath);

                try {
                  await fs.access(fullCsvPath);
                } catch {
                  console.warn(
                    `Template Warning: Missing CSV file ${csvRelativePath}. Skipping.`
                  );
                  newContent.push({
                    type: 'text',
                    text: `[${label}]`,
                    styles: {},
                  });
                  continue;
                }

                const csvContent = await fs.readFile(fullCsvPath, 'utf8');

                const result = await importCsvAsDatabase(
                  csvContent,
                  finalLabel,
                  pageId,
                  userId
                );

                const linkedDatabase = await database.linkedDatabase.create({
                  data: {
                    pageId: pageId,
                    sourceDatabaseId: result.databaseId,
                    title: finalLabel,
                    viewConfig: {
                      filters: [],
                      sorts: [],
                      hiddenProperties: [],
                      view: 'table',
                    },
                  },
                });

                block.type = 'inlineDatabase';
                block.props = {
                  linkedDatabaseId: linkedDatabase.id,
                } as Record<string, unknown>;
              } catch (error) {
                console.error('CSV Import Failed', error);
                newContent.push({
                  type: 'text',
                  text: `[${label}]`,
                  styles: {},
                });
              }
            } else if (EXT === '.md') {
              try {
                const dirOfCurrentFile = path.dirname(relativeFilePath);
                const mdRelativePath = path.join(
                  dirOfCurrentFile,
                  decodeURIComponent(linkPath)
                );

                const subPage = await database.page.create({
                  data: {
                    title: finalLabel,
                    userId: userId,
                    parentId: pageId,
                    icon: '📄',
                  },
                });

                await processTemplatePage(
                  baseDir,
                  mdRelativePath,
                  subPage.id,
                  userId
                );

                newContent.push({
                  type: 'link',
                  href: `/documents/${subPage.id}`,
                  content: finalLabel,
                });
              } catch (error) {
                console.error('Sub-page Import Failed', error);
                newContent.push({
                  type: 'text',
                  text: `[${label}]`,
                  styles: {},
                });
              }
            } else {
              newContent.push({
                type: 'link',
                href: linkPath,
                content: label,
              });
            }

            lastIndex = linkRegex.lastIndex;
          }

          if (lastIndex < text.length) {
            newContent.push({
              type: 'text',
              text: text.slice(Math.max(0, lastIndex)),
              styles: {},
            });
          }
        } else {
          newContent.push(contentItem);
        }
      }
      block.content = newContent;
    }

    processedBlocks.push(block);
  }

  return processedBlocks;
}

export async function processTemplatePage(
  baseDir: string,
  relativeFilePath: string,
  pageId: string,
  userId: string
) {
  const processedBlocks = await getTemplateBlocks(
    baseDir,
    relativeFilePath,
    pageId,
    userId
  );

  await database.page.update({
    where: { id: pageId },
    data: {
      content: JSON.stringify(processedBlocks),
    },
  });
}
