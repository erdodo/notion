export interface InlineContent {
  type: string;
  text?: string;
  styles?: Record<string, boolean | string>;
  href?: string;
  content?: string | InlineContent[];
}

export interface Block {
  type: string;
  props?: Record<string, unknown>;
  content?: InlineContent[];
  children?: Block[];
}

export function parseMarkdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];

  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  const processInline = (text: string) => {
    return [{ type: 'text', text: text, styles: {} }];
  };

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
        content: processInline(trimmed.slice(2)),
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        props: { level: 2 },
        content: processInline(trimmed.slice(3)),
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'heading',
        props: { level: 3 },
        content: processInline(trimmed.slice(4)),
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        type: 'bulletListItem',
        content: processInline(trimmed.slice(2)),
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({
        type: 'numberedListItem',
        content: processInline(trimmed.replace(/^\d+\.\s/, '')),
      });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({
        type: 'quote',
        content: processInline(trimmed.slice(2)),
      });
    } else if (trimmed.startsWith('<aside>')) {
      blocks.push({
        type: 'callout',
        props: { type: 'info' },
        content: [],
      });
    } else if (trimmed.startsWith('</aside>')) {
      // End of aside, no action needed
    } else if (/^!\[(.*?)\]\((.*?)\)$/.test(trimmed)) {
      const match = /^!\[(.*?)\]\((.*?)\)$/.exec(trimmed);
      if (match) {
        blocks.push({
          type: 'image',
          props: {
            url: match[2],
            caption: match[1],
            previewWidth: 512,
          },
          children: [],
        });
      }
    } else {
      const lastBlock = blocks.at(-1);
      if (lastBlock?.type === 'callout' && !trimmed.includes('</aside>')) {
        if (trimmed.startsWith('<img')) {
          const sourceMatch = /src="(.*?)"/.exec(trimmed);
          if (sourceMatch) {
            lastBlock.props = { ...lastBlock.props, icon: sourceMatch[1] };
          }
        } else {
          if (!lastBlock.content) lastBlock.content = [];

          lastBlock.content.push(...processInline(trimmed + ' '));
        }
      } else {
        if (!trimmed.includes('<aside') && !trimmed.includes('</aside>')) {
          blocks.push({ type: 'paragraph', content: processInline(trimmed) });
        }
      }
    }
  }

  return blocks;
}
