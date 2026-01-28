'use client';

import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { FormattingToolbar } from './formatting-toolbar';
import { PageMentionPicker } from './page-mention-picker';
import { schema } from './schema';
import { SlashMenu } from './slash-menu';

import { useContextMenuStore } from '@/store/use-context-menu-store';

interface SlashMenuItem {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  group?: string;
  icon?: React.ReactNode | string;
  subtext?: string;
}

interface SlashCommandManagerProperties {
  editor: typeof schema.BlockNoteEditor;
  documentId?: string;
  onMentionSelect: (pageId: string) => void;
}

const filterSuggestionItems = (items: SlashMenuItem[], query: string) => {
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.aliases?.some((alias: string) =>
        alias.toLowerCase().includes(query.toLowerCase())
      )
  );
};

export const SlashCommandManager = ({
  editor,
  documentId,
  onMentionSelect,
}: SlashCommandManagerProperties) => {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [slashMenuQuery, setSlashMenuQuery] = useState('');
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<SlashMenuItem[]>([]);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionPosition, setMentionPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const insertOrUpdateBlock = useCallback((
    type: string,
    properties: Record<string, unknown> = {}
  ) => {
    const currentBlock = editor.getTextCursorPosition().block;
    const content = currentBlock.content;
    const text =
      Array.isArray(content) && content.length > 0
        ? (content as { text: string }[]).map((c) => c.text).join('')
        : '';
    const command = `/${slashMenuQuery}`;

    if (text === command || text === '/' || text === '') {
      editor.replaceBlocks(
        [currentBlock],
        [{ type: type as any, props: properties }]
      );
      setTimeout(() => {
        const newBlock = editor.getTextCursorPosition().block;
        if (newBlock) editor.setTextCursorPosition(newBlock, 'end');
      }, 0);
      return;
    }

    if (text.endsWith(command)) {
      const newText = text.slice(0, -command.length);
      editor.updateBlock(currentBlock, {
        content: [{ type: 'text', text: newText, styles: {} }],
      });
      editor.insertBlocks(
        [{ type: type as any, props: properties }],
        currentBlock,
        'after'
      );
      setTimeout(() => {
        const nextBlock = editor.getTextCursorPosition().nextBlock;
        if (nextBlock) editor.setTextCursorPosition(nextBlock, 'end');
      }, 0);
      return;
    }

    editor.insertBlocks(
      [{ type: type as any, props: properties }],
      currentBlock,
      'after'
    );
  }, [editor, slashMenuQuery]);

  const cleanupSlashCommand = useCallback(() => {
    const currentBlock = editor.getTextCursorPosition().block;
    const content = currentBlock.content;
    const text =
      Array.isArray(content) && content.length > 0
        ? (content as { text: string }[]).map((c) => c.text).join('')
        : '';
    const command = `/${slashMenuQuery}`;

    if (text.endsWith(command)) {
      const newText = text.slice(0, -command.length);
      editor.updateBlock(currentBlock, {
        content: [{ type: 'text', text: newText, styles: {} }],
      });
    } else if (text === command || text === '/') {
      editor.updateBlock(currentBlock, { content: '' });
    }
  }, [editor, slashMenuQuery]);

  const getCustomSlashMenuItems = useCallback(
    (editor: typeof schema.BlockNoteEditor) => {
      const defaultItems = [
        {
          title: 'Paragraph',
          onItemClick: () => {
            insertOrUpdateBlock('paragraph');
          },
          aliases: ['p', 'paragraph'],
          group: 'Basic',
          icon: '¶',
          subtext: 'Plain text paragraph',
        },
        {
          title: 'Heading 1',
          onItemClick: () => {
            insertOrUpdateBlock('heading', { level: 1 });
          },
          aliases: ['h1', 'heading1', 'title'],
          group: 'Basic',
          icon: 'H1',
          subtext: 'Large section heading',
        },
        {
          title: 'Heading 2',
          onItemClick: () => {
            insertOrUpdateBlock('heading', { level: 2 });
          },
          aliases: ['h2', 'heading2', 'subtitle'],
          group: 'Basic',
          icon: 'H2',
          subtext: 'Medium section heading',
        },
        {
          title: 'Heading 3',
          onItemClick: () => {
            insertOrUpdateBlock('heading', { level: 3 });
          },
          aliases: ['h3', 'heading3'],
          group: 'Basic',
          icon: 'H3',
          subtext: 'Small section heading',
        },
        {
          title: 'Bullet List',
          onItemClick: () => {
            insertOrUpdateBlock('bulletListItem');
          },
          aliases: ['ul', 'bullet', 'unordered'],
          group: 'Basic',
          icon: '•',
          subtext: 'Unordered list',
        },
        {
          title: 'Numbered List',
          onItemClick: () => {
            insertOrUpdateBlock('numberedListItem');
          },
          aliases: ['ol', 'numbered', 'ordered'],
          group: 'Basic',
          icon: '1.',
          subtext: 'Ordered list',
        },
        {
          title: 'Check List',
          onItemClick: () => {
            insertOrUpdateBlock('checkListItem');
          },
          aliases: ['todo', 'checkbox', 'task'],
          group: 'Basic',
          icon: '☑',
          subtext: 'To-do list with checkboxes',
        },
        {
          title: 'Table',
          onItemClick: () => {
            const currentBlock = editor.getTextCursorPosition().block;
            const content = currentBlock.content;
            const text =
              Array.isArray(content) && content.length > 0
                ? (content as { text: string }[]).map((c) => c.text).join('')
                : '';
            const command = `/${slashMenuQuery}`;

            if (text === command || text === '/' || text === '') {
              editor.replaceBlocks([currentBlock], [
                {
                  type: 'table' as any,
                  content: {
                    type: 'tableContent',
                    rows: [
                      {
                        cells: [[''], [''], ['']],
                      },
                      {
                        cells: [[''], [''], ['']],
                      },
                    ],
                  },
                },
              ]);
            } else {
              editor.insertBlocks(
                [
                  {
                    type: 'table' as any,
                    content: {
                      type: 'tableContent',
                      rows: [
                        {
                          cells: [[''], [''], ['']],
                        },
                        {
                          cells: [[''], [''], ['']],
                        },
                      ],
                    },
                  },
                ],
                currentBlock,
                'after'
              );
            }
          },
          aliases: ['table', 'grid'],
          group: 'Advanced',
          icon: '⊞',
          subtext: 'Insert a table',
        },
        {
          title: 'Code Block',
          onItemClick: () => {
            insertOrUpdateBlock('codeBlock');
          },
          aliases: ['code', 'codeblock'],
          group: 'Advanced',
          icon: '</>',
          subtext: 'Code with syntax highlighting',
        },
        {
          title: 'Page Mention',
          onItemClick: () => {
            cleanupSlashCommand();
            setMentionOpen(true);
            setSlashMenuOpen(false);
            setMentionPosition({
              top: slashMenuPosition.y,
              left: slashMenuPosition.x,
            });
          },
          aliases: ['mention', 'page mention', 'link page'],
          group: 'Basic',
          icon: <div className="text-xl">↗️</div>,
          subtext: 'Link to an existing page',
        },
        {
          title: 'Image',
          onItemClick: () => {
            insertOrUpdateBlock('image');
          },
          aliases: ['image', 'img', 'picture'],
          group: 'Media',
          icon: <div className="text-xl">🖼️</div>,
          subtext: 'Upload or embed an image',
        },
        {
          title: 'Video',
          onItemClick: () => {
            insertOrUpdateBlock('video');
          },
          aliases: ['video', 'movie', 'film'],
          group: 'Media',
          icon: <div className="text-xl">🎥</div>,
          subtext: 'Embed or upload a video',
        },
        {
          title: 'Audio',
          onItemClick: () => {
            insertOrUpdateBlock('audio');
          },
          aliases: ['audio', 'music', 'sound'],
          group: 'Media',
          icon: <div className="text-xl">🎵</div>,
          subtext: 'Embed or upload audio',
        },
        {
          title: 'File',
          onItemClick: () => {
            insertOrUpdateBlock('file');
          },
          aliases: ['file', 'attachment', 'document'],
          group: 'Media',
          icon: <div className="text-xl">📄</div>,
          subtext: 'Upload a file attachment',
        },
        {
          title: 'Toggle List',
          onItemClick: () => {
            insertOrUpdateBlock('toggle');
          },
          aliases: ['toggle', 'collapse'],
          group: 'Advanced',
          icon: (
            <div className="text-xl">
              <ChevronRight size={18} />
            </div>
          ),
          subtext: 'Toggleable list item',
        },
        {
          title: 'Callout',
          onItemClick: () => {
            insertOrUpdateBlock('callout');
          },
          aliases: ['callout', 'attention', 'alert'],
          group: 'Advanced',
          icon: '💡',
          subtext: 'Highlight important information',
        },
        {
          title: 'Quote',
          onItemClick: () => {
            insertOrUpdateBlock('quote');
          },
          aliases: ['quote', 'citation'],
          group: 'Basic',
          icon: '❝',
          subtext: 'Capture a quote',
        },
        {
          title: 'Divider',
          onItemClick: () => {
            insertOrUpdateBlock('divider');
          },
          aliases: ['divider', 'hr', 'separator'],
          group: 'Basic',
          icon: '―',
          subtext: 'Visually separate content',
        },
        {
          title: 'Table of Contents',
          onItemClick: () => {
            insertOrUpdateBlock('toc');
          },
          aliases: ['toc', 'outline'],
          group: 'Advanced',
          icon: '📑',
          subtext: 'Overview of page headings',
        },
        {
          title: 'Bookmark',
          onItemClick: () => {
            insertOrUpdateBlock('bookmark');
          },
          aliases: ['bookmark', 'link', 'embed'],
          group: 'Media',
          icon: '🔗',
          subtext: 'Link with preview',
        },
        {
          title: 'Page',
          onItemClick: async () => {
            const currentBlock = editor.getTextCursorPosition().block;
            const text = Array.isArray(currentBlock.content)
              ? (currentBlock.content as { text: string }[])
                  .map((c) => c.text)
                  .join('')
              : '';
            const command = `/${slashMenuQuery}`;
            let insertMode: 'replace' | 'after' = 'after';
            if (text === command || text === '/' || text === '') {
              insertMode = 'replace';
            } else if (text.endsWith(command)) {
              editor.updateBlock(currentBlock, {
                content: [
                  {
                    type: 'text',
                    text: text.slice(0, -command.length),
                    styles: {},
                  },
                ],
              });
            }

            const { createDocument } =
              await import('@/app/(main)/_actions/documents');
            const document_ = await createDocument('Untitled', documentId);
            const newBlock = {
              type: 'pageMention' as const,
              props: { pageId: document_.id },
            };

            if (insertMode === 'replace') {
              editor.replaceBlocks([currentBlock], [newBlock]);
            } else {
              editor.insertBlocks([newBlock], currentBlock, 'after');
            }
          },
          aliases: ['page', 'new page'],
          group: 'Basic',
          icon: <div className="text-xl">📄</div>,
          subtext: 'Embed a sub-page',
        },
        {
          title: 'Database - Inline',
          onItemClick: async () => {
            const currentBlock = editor.getTextCursorPosition().block;
            const text = Array.isArray(currentBlock.content)
              ? (currentBlock.content as { text: string }[])
                  .map((c) => c.text)
                  .join('')
              : '';
            const command = `/${slashMenuQuery}`;
            let insertMode: 'replace' | 'after' = 'after';
            if (text === command || text === '/' || text === '') {
              insertMode = 'replace';
            } else if (text.endsWith(command)) {
              editor.updateBlock(currentBlock, {
                content: [
                  {
                    type: 'text',
                    text: text.slice(0, -command.length),
                    styles: {},
                  },
                ],
              });
            }

            const { createDatabase, createLinkedDatabase } =
              await import('@/app/(main)/_actions/database');
            const { database } = await createDatabase(documentId);
            const linkedDatabase = await createLinkedDatabase(
              documentId!,
              database.id,
              'Untitled Database'
            );
            const newBlock = {
              type: 'inlineDatabase' as const,
              props: { linkedDatabaseId: linkedDatabase.id },
            };

            if (insertMode === 'replace') {
              editor.replaceBlocks([currentBlock], [newBlock]);
            } else {
              editor.insertBlocks([newBlock], currentBlock, 'after');
            }

            setTimeout(() => {
              const next =
                editor.getTextCursorPosition().nextBlock ||
                editor.getTextCursorPosition().block;
              if (next) editor.setTextCursorPosition(next);
            }, 0);
          },
          aliases: [
            'inline database',
            'embed database',
            'table inline',
            'database inline',
            'db inline',
          ],
          group: 'Advanced',
          icon: <div className="text-xl">📊</div>,
          subtext: 'Embed a database in this page',
        },
        {
          title: '2 Columns',
          onItemClick: () => {
            insertOrUpdateBlock('grid', { columns: 2 });
          },
          aliases: ['2 cols', 'columns 2', 'grid 2'],
          group: 'Layout',
          icon: <div className="text-xl">❚❚</div>,
          subtext: '2 Column Layout',
        },
        {
          title: '3 Columns',
          onItemClick: () => {
            insertOrUpdateBlock('grid', { columns: 3 });
          },
          aliases: ['3 cols', 'columns 3', 'grid 3'],
          group: 'Layout',
          icon: <div className="text-xl">❚❚❚</div>,
          subtext: '3 Column Layout',
        },
        {
          title: '4 Columns',
          onItemClick: () => {
            insertOrUpdateBlock('grid', { columns: 4 });
          },
          aliases: ['4 cols', 'columns 4', 'grid 4'],
          group: 'Layout',
          icon: <div className="text-xl">::::</div>,
          subtext: '4 Column Layout',
        },
        {
          title: '5 Columns',
          onItemClick: () => {
            insertOrUpdateBlock('grid', { columns: 5 });
          },
          aliases: ['5 cols', 'columns 5', 'grid 5'],
          group: 'Layout',
          icon: <div className="text-xl">:::::</div>,
          subtext: '5 Column Layout',
        },
        {
          title: '6 Columns',
          onItemClick: () => {
            insertOrUpdateBlock('grid', { columns: 6 });
          },
          aliases: ['6 cols', 'columns 6', 'grid 6'],
          group: 'Layout',
          icon: <div className="text-xl">::::::</div>,
          subtext: '6 Column Layout',
        },
      ];

      const combinedItems = [...defaultItems];

      const uniqueItemsMap = new Map();
      for (const item of combinedItems) {
        if (!uniqueItemsMap.has(item.title)) {
          uniqueItemsMap.set(item.title, item);
        }
      }
      const allItems = [...uniqueItemsMap.values()];

      const groupedItems: Record<string, (typeof allItems)[number][]> = {};
      const groupOrder: string[] = [];

      for (const item of allItems) {
        const group = item.group || 'Other';
        if (!groupedItems[group]) {
          groupedItems[group] = [];
          groupOrder.push(group);
        }
        groupedItems[group].push(item);
      }

      return groupOrder.flatMap((group) => groupedItems[group]);
    },
    [
      slashMenuPosition,
      slashMenuQuery,
      insertOrUpdateBlock,
      cleanupSlashCommand,
      documentId,
    ]
  );

  useEffect(() => {
    if (slashMenuOpen) {
      const allItems = getCustomSlashMenuItems(editor);
      const filtered = filterSuggestionItems(allItems, slashMenuQuery);
      setFilteredItems(filtered);
      setSlashMenuIndex(0);
    }
  }, [slashMenuOpen, slashMenuQuery, editor, getCustomSlashMenuItems]);

  useEffect(() => {
    const checkTrigger = () => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchorNode = selection.anchorNode;
      if (
        (anchorNode && anchorNode instanceof Element) ||
        anchorNode?.parentElement
      ) {
        const element = (
          anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement
        ) as HTMLElement;
        if (element.closest('.synced-block')) {
          return;
        }
      }

      const range = selection.getRangeAt(0);
      const text = range.startContainer.textContent || '';
      const offset = range.startOffset;

      const textBefore = text.slice(0, offset);

      const slashMatch = /(?:^|\s)\/([a-zA-Z0-9]*)$/.exec(textBefore);
      if (slashMatch) {
        setSlashMenuQuery(slashMatch[1]);
        setSlashMenuOpen(true);

        const rect = range.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom });
        setMentionOpen(false);
        return;
      }
      setSlashMenuOpen(false);

      const mentionMatch = /(?:^|\s)@([a-zA-Z0-9\s]*)$/.exec(
        textBefore.replaceAll('\u00A0', ' ')
      );
      if (mentionMatch) {
        setMentionOpen(true);

        const rect = range.getBoundingClientRect();
        setMentionPosition({ top: rect.bottom, left: rect.left });
        return;
      }
      setMentionOpen(false);
    };

    document.addEventListener('selectionchange', checkTrigger);
    document.addEventListener('keyup', checkTrigger);
    document.addEventListener('click', checkTrigger);

    return () => {
      document.removeEventListener('selectionchange', checkTrigger);
      document.removeEventListener('keyup', checkTrigger);
      document.removeEventListener('click', checkTrigger);
    };
  }, [editor]);

  useEffect(() => {
    if (!slashMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          setSlashMenuIndex(
            (previous) => (previous + 1) % filteredItems.length
          );
          break;
        }
        case 'ArrowUp': {
          setSlashMenuIndex(
            (previous) =>
              (previous - 1 + filteredItems.length) % filteredItems.length
          );
          break;
        }
        case 'Enter': {
          const item = filteredItems[slashMenuIndex];
          if (item) {
            item.onItemClick();
            setSlashMenuOpen(false);
          }
          break;
        }
        case 'Escape': {
          setSlashMenuOpen(false);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [slashMenuOpen, slashMenuIndex, filteredItems, editor]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const blockElement = target.closest('[data-id]') as HTMLElement;

      if (blockElement) {
        const id = blockElement.dataset.id;
        if (id) {
          const block = editor.getBlock(id);
          if (block) {
            e.preventDefault();
            e.stopPropagation();

            const { openContextMenu } = useContextMenuStore.getState();
            openContextMenu({ x: e.clientX, y: e.clientY }, 'editor-block', {
              editor,
              block,
            });
          }
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, {
      capture: true,
    });
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, {
        capture: true,
      });
    };
  }, [editor]);

  return (
    <>
      {slashMenuOpen && (
        <SlashMenu
          items={filteredItems}
          selectedIndex={slashMenuIndex}
          onItemClick={(item: SlashMenuItem) => {
            item.onItemClick();
            setSlashMenuOpen(false);
          }}
          onClose={() => {
            setSlashMenuOpen(false);
          }}
          position={slashMenuPosition}
        />
      )}

      <PageMentionPicker
        isOpen={mentionOpen}
        onClose={() => {
          const selection = globalThis.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = range.startContainer.textContent || '';
            const offset = range.startOffset;
            const textBefore = text.slice(0, offset);
            const slashMatch = /(?:^|\s)\/([a-zA-Z0-9]*)$/.exec(textBefore);

            if (slashMatch) {
              const slashIndex = textBefore.lastIndexOf('/');
              const newText = text.slice(0, slashIndex) + text.slice(offset);
              if (range.startContainer.nodeType === Node.TEXT_NODE) {
                range.startContainer.textContent = newText;
                range.setStart(range.startContainer, slashIndex);
                range.collapse(true);
              }
            }
          }
          setMentionOpen(false);
        }}
        onSelect={onMentionSelect}
        position={mentionPosition}
        currentPageId={documentId}
      />

      <FormattingToolbar editor={editor} />
    </>
  );
};
