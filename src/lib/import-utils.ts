import { Block } from '@blocknote/core';

type InlineContent =
  | { type: 'text'; text: string; styles: Record<string, boolean | string> }
  | {
      type: 'link';
      content: {
        type: 'text';
        text: string;
        styles: Record<string, boolean | string>;
      }[];
      href: string;
    };

export function parseMarkdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'heading',
        props: {
          level: headingMatch[1].length,
          backgroundColor: 'default',
          textColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: headingMatch[2], styles: {} }],
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'divider',
        props: {
          backgroundColor: 'default',
        },
        content: [],
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index++;
      }
      blocks.push({
        id: crypto.randomUUID(),
        type: 'codeBlock',
        props: {
          language: lang || 'plain',
          backgroundColor: 'default',
          textColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: codeLines.join('\n'), styles: {} }],
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteText = line.slice(2);

      const emojiMatch = /^(\p{Emoji})\s+(.+)$/u.exec(quoteText);
      if (emojiMatch) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'callout',
          props: {
            icon: emojiMatch[1],
            color: 'gray',
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: emojiMatch[2], styles: {} }],
          children: [],
        } as unknown as Block);
      } else {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'quote',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left',
          },
          content: [{ type: 'text', text: quoteText, styles: {} }],
          children: [],
        } as unknown as Block);
      }
      index++;
      continue;
    }

    const checkboxMatch = /^-\s+\[([ x])\]\s+(.+)$/.exec(line);
    if (checkboxMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'checkListItem',
        props: {
          checked: checkboxMatch[1] === 'x',
          backgroundColor: 'default',
          textColor: 'default',
          textAlignment: 'left',
        },
        content: parseInlineContent(checkboxMatch[2]),
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'bulletListItem',
        props: {
          backgroundColor: 'default',
          textColor: 'default',
          textAlignment: 'left',
        },
        content: parseInlineContent(line.replace(/^[-*]\s+/, '')),
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line);
    if (imageMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'image',
        props: {
          url: imageMatch[2],
          caption: imageMatch[1],
          width: 512,
          textAlignment: 'center',
        },
        content: [],
        children: [],
      } as unknown as Block);
      index++;
      continue;
    }

    blocks.push({
      id: crypto.randomUUID(),
      type: 'paragraph',
      props: {
        backgroundColor: 'default',
        textColor: 'default',
        textAlignment: 'left',
      },
      content: parseInlineContent(line),
      children: [],
    } as unknown as Block);
    index++;
  }

  return blocks;
}

function parseInlineContent(text: string): InlineContent[] {
  const content: InlineContent[] = [];

  const _patterns = [
    { regex: /\*\*(.+?)\*\*/g, style: 'bold' },
    { regex: /\*(.+?)\*/g, style: 'italic' },
    { regex: /~~(.+?)~~/g, style: 'strike' },
    { regex: /`(.+?)`/g, style: 'code' },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
  ];

  content.push({
    type: 'text',
    text: text
      .replaceAll(/\*\*(.+?)\*\*/g, '$1')
      .replaceAll(/\*(.+?)\*/g, '$1')
      .replaceAll(/~~(.+?)~~/g, '$1')
      .replaceAll(/`(.+?)`/g, '$1')
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
    styles: {},
  });

  return content;
}

export function parseCSVToDatabase(csv: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = csv.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    for (const [index, h] of headers.entries()) {
      row[h] = values[index] || '';
    }
    return row;
  });

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}
