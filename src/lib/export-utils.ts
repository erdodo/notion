interface Block {
  type: string;
  props?: Record<string, string | number | boolean | undefined>;
  content?: unknown;
  children?: Block[];
}

type InlineContentItem =
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

interface CustomTableBlock {
  type: 'table';
  content: {
    rows: { cells: unknown[] }[];
  };
}

export function blocksToMarkdown(blocks: Block[]): string {
  let markdown = '';

  for (const block of blocks) {
    markdown += blockToMarkdown(block);
  }

  return markdown.trim();
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case 'paragraph': {
      return contentToMarkdown(block.content) + '\n\n';
    }

    case 'heading': {
      const level = Number(block.props?.level) || 1;
      const prefix = '#'.repeat(level);
      return `${prefix} ${contentToMarkdown(block.content)}\n\n`;
    }

    case 'bulletListItem': {
      return `- ${contentToMarkdown(block.content)}\n`;
    }

    case 'numberedListItem': {
      return `1. ${contentToMarkdown(block.content)}\n`;
    }

    case 'checkListItem': {
      const checked = block.props?.checked ? 'x' : ' ';
      return `- [${checked}] ${contentToMarkdown(block.content)}\n`;
    }

    case 'codeBlock': {
      const lang = block.props?.language || '';
      return `\`\`\`${lang}\n${contentToMarkdown(block.content)}\n\`\`\`\n\n`;
    }

    case 'image': {
      const alt = block.props?.caption || 'image';
      const url = block.props?.url || '';
      return `![${alt}](${url})\n\n`;
    }

    case 'video': {
      return `[Video](${block.props?.url})\n\n`;
    }

    case 'audio': {
      return `[Audio](${block.props?.url})\n\n`;
    }

    case 'file': {
      return `[${block.props?.name || 'File'}](${block.props?.url})\n\n`;
    }

    case 'callout': {
      const icon = block.props?.icon || '💡';
      return `> ${icon} ${contentToMarkdown(block.content)}\n\n`;
    }

    case 'quote': {
      return `> ${contentToMarkdown(block.content)}\n\n`;
    }

    case 'divider': {
      return '---\n\n';
    }

    case 'table': {
      return tableToMarkdown(block as unknown as CustomTableBlock) + '\n\n';
    }

    case 'toggle': {
      return `<details>\n<summary>${contentToMarkdown(block.content)}</summary>\n\n${block.children?.map(blockToMarkdown).join('') || ''}\n</details>\n\n`;
    }

    case 'pageMention': {
      return `[[Page: ${block.props?.pageId}]]\n`;
    }

    default: {
      return contentToMarkdown(block.content) + '\n\n';
    }
  }
}

function contentToMarkdown(content: unknown): string {
  if (!content || content === 'none') return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return (content as InlineContentItem[])
    .map((item) => {
      if (item.type === 'text') {
        let text = item.text || '';
        const styles = item.styles || {};

        if (styles.bold) text = `**${text}**`;
        if (styles.italic) text = `*${text}*`;
        if (styles.strike) text = `~~${text}~~`;
        if (styles.code) text = `\`${text}\``;

        return text;
      }
      if (item.type === 'link') {
        return `[${item.content?.[0]?.text || item.href}](${item.href})`;
      }
      return '';
    })
    .join('');
}

function tableToMarkdown(block: CustomTableBlock): string {
  const rows = block.content?.rows || [];
  if (rows.length === 0) return '';

  let md = '';

  const headerCells = rows[0]?.cells || [];
  md +=
    '| ' +
    headerCells.map((c: unknown) => contentToMarkdown(c)).join(' | ') +
    ' |\n';
  md += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';

  for (let index = 1; index < rows.length; index++) {
    const cells = rows[index]?.cells || [];
    md +=
      '| ' +
      cells.map((c: unknown) => contentToMarkdown(c)).join(' | ') +
      ' |\n';
  }

  return md;
}

export function blocksToHTML(blocks: unknown[], title: string): string {
  const bodyContent = (blocks as Block[]).map(blockToHTML).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin: 1em 0; }
    img { max-width: 100%; height: auto; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; border-radius: 4px; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
    blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 1rem; color: #666; }
    .callout { background: #f8f9fa; border-radius: 4px; padding: 1rem; margin: 1em 0; display: flex; gap: 0.5rem; }
    .callout-icon { font-size: 1.2em; }
    .toggle { margin: 1em 0; }
    .toggle summary { cursor: pointer; font-weight: 500; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f4f4f4; }
    ul, ol { padding-left: 1.5rem; }
    .checkbox { margin-right: 0.5rem; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${bodyContent}
</body>
</html>`;
}

function blockToHTML(block: Block): string {
  switch (block.type) {
    case 'paragraph': {
      return `<p>${contentToHTML(block.content)}</p>`;
    }

    case 'heading': {
      const level = block.props?.level || 1;
      return `<h${level}>${contentToHTML(block.content)}</h${level}>`;
    }

    case 'bulletListItem': {
      return `<ul><li>${contentToHTML(block.content)}</li></ul>`;
    }

    case 'numberedListItem': {
      return `<ol><li>${contentToHTML(block.content)}</li></ol>`;
    }

    case 'checkListItem': {
      const checked = block.props?.checked ? 'checked' : '';
      return `<div><input type="checkbox" class="checkbox" ${checked} disabled>${contentToHTML(block.content)}</div>`;
    }

    case 'codeBlock': {
      return `<pre><code>${escapeHtml(contentToHTML(block.content))}</code></pre>`;
    }

    case 'image': {
      const imgCaption = block.props?.caption
        ? `<figcaption>${escapeHtml(String(block.props.caption))}</figcaption>`
        : '';
      return `<figure><img src="${block.props?.url || ''}" alt="${escapeHtml(String(block.props?.caption || ''))}">${imgCaption}</figure>`;
    }

    case 'video': {
      return `<video controls src="${block.props?.url || ''}"></video>`;
    }

    case 'audio': {
      return `<audio controls src="${block.props?.url || ''}"></audio>`;
    }

    case 'file': {
      return `<a href="${block.props?.url || ''}" download>${escapeHtml(String(block.props?.name || 'Download'))}</a>`;
    }

    case 'callout': {
      return `<div class="callout"><span class="callout-icon">${block.props?.icon || '💡'}</span><div>${contentToHTML(block.content)}</div></div>`;
    }

    case 'quote': {
      return `<blockquote>${contentToHTML(block.content)}</blockquote>`;
    }

    case 'divider': {
      return `<hr>`;
    }

    case 'table': {
      return tableToHTML(block as unknown as CustomTableBlock);
    }

    case 'toggle': {
      const toggleContent = block.children?.map(blockToHTML).join('') || '';
      return `<details class="toggle"><summary>${contentToHTML(block.content)}</summary>${toggleContent}</details>`;
    }

    case 'embed': {
      return `<iframe src="${block.props?.url || ''}" width="100%" height="400" frameborder="0"></iframe>`;
    }

    default: {
      return `<div>${contentToHTML(block.content)}</div>`;
    }
  }
}

function contentToHTML(content: unknown): string {
  if (!content || content === 'none') return '';
  if (typeof content === 'string') return escapeHtml(content);
  if (!Array.isArray(content)) return '';

  return (content as InlineContentItem[])
    .map((item) => {
      if (item.type === 'text') {
        let text = escapeHtml(item.text || '');
        const styles = item.styles || {};

        if (styles.bold) text = `<strong>${text}</strong>`;
        if (styles.italic) text = `<em>${text}</em>`;
        if (styles.underline) text = `<u>${text}</u>`;
        if (styles.strike) text = `<s>${text}</s>`;
        if (styles.code) text = `<code>${text}</code>`;
        if (styles.textColor && styles.textColor !== 'default') {
          text = `<span style="color:${styles.textColor}">${text}</span>`;
        }
        if (styles.backgroundColor && styles.backgroundColor !== 'default') {
          text = `<span style="background-color:${styles.backgroundColor}">${text}</span>`;
        }

        return text;
      }
      if (item.type === 'link') {
        return `<a href="${escapeHtml(item.href)}">${escapeHtml(item.content?.[0]?.text || item.href)}</a>`;
      }
      return '';
    })
    .join('');
}

function tableToHTML(block: CustomTableBlock): string {
  const rows = block.content?.rows || [];
  if (rows.length === 0) return '';

  let html = '<table>';

  if (rows[0]) {
    html += '<thead><tr>';
    rows[0].cells?.forEach((cell: unknown) => {
      html += `<th>${contentToHTML(cell)}</th>`;
    });
    html += '</tr></thead>';
  }

  html += '<tbody>';
  for (let index = 1; index < rows.length; index++) {
    html += '<tr>';
    rows[index].cells?.forEach((cell: unknown) => {
      html += `<td>${contentToHTML(cell)}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table>';

  return html;
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replaceAll(/[&<>"']/g, (char) => htmlEscapes[char]);
}

export interface DatabaseExportData {
  headers: string[];
  rows: string[][];
}

export function formatCellValueForCSV(
  value: unknown,
  propertyType: string
): string {
  if (value === null || value === undefined) return '';

  const actualValue = (value as { value: unknown })?.value ?? value;

  switch (propertyType) {
    case 'TITLE':
    case 'TEXT':
    case 'URL':
    case 'EMAIL':
    case 'PHONE': {
      return String(actualValue || '');
    }

    case 'NUMBER': {
      return String(actualValue ?? '');
    }

    case 'CHECKBOX': {
      return actualValue ? 'Yes' : 'No';
    }

    case 'DATE': {
      if (!actualValue) return '';
      try {
        return new Date(actualValue as string | number).toLocaleDateString();
      } catch {
        return String(actualValue);
      }
    }

    case 'SELECT': {
      return String(actualValue || '');
    }

    case 'MULTI_SELECT': {
      if (Array.isArray(actualValue)) {
        return actualValue.join(', ');
      }
      return String(actualValue || '');
    }

    case 'CREATED_TIME':
    case 'UPDATED_TIME': {
      if (!actualValue) return '';
      try {
        return new Date(actualValue as string | number).toLocaleString();
      } catch {
        return String(actualValue);
      }
    }

    case 'RELATION': {
      const relValue = actualValue as { linkedRowIds?: string[] } | undefined;
      if (relValue?.linkedRowIds) {
        return relValue.linkedRowIds.join(', ');
      }
      return '';
    }

    case 'ROLLUP':
    case 'FORMULA': {
      if (Array.isArray(actualValue)) {
        return actualValue.join(', ');
      }
      return String(actualValue ?? '');
    }

    default: {
      return String(actualValue || '');
    }
  }
}
