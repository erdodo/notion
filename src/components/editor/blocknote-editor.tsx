'use client';

import { PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNote,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState, useRef } from 'react';
import '@blocknote/mantine/style.css';

import { FormattingToolbar } from './formatting-toolbar';
import { PageMentionPicker } from './page-mention-picker';
import { schema } from './schema';
import { SlashMenu } from './slash-menu';

import { useOptionalCollaboration } from '@/components/providers/collaboration-provider';
import { useEdgeStore } from '@/lib/edgestore';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface SlashMenuItem {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  group?: string;
  icon?: React.ReactNode | string;
  subtext?: string;
}

interface BlockNoteEditorProperties {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  documentId?: string;
  disableCollaboration?: boolean;
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

export const BlockNoteEditorComponent = ({
  initialContent,
  onChange,
  editable = true,
  documentId,
  disableCollaboration = false,
}: BlockNoteEditorProperties) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [mounted, setMounted] = useState(false);

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

  const parsedContent = useMemo(() => {
    if (!initialContent) return;
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch (error) {
      console.error('Error parsing initial content:', error);
      return;
    }
  }, [initialContent]);

  const collaboration = useOptionalCollaboration();

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    uploadFile: async (file: File) => {
      const res = await edgestore.editorMedia.upload({ file });
      return res.url;
    },
    collaboration:
      !disableCollaboration && collaboration
        ? {
            provider: collaboration.provider,
            fragment: collaboration.yDoc.getXmlFragment('document-store'),
            user: {
              name: collaboration.user?.name || 'Anonymous',
              color: collaboration.user?.color || '#505050',
            },
          }
        : undefined,
  });

  useEffect(() => {
    if (!editor || !parsedContent) return;

    const syncContent = async () => {
      const currentBlocks = editor.document;
      const currentJson = JSON.stringify(currentBlocks);
      const newJson = JSON.stringify(parsedContent);

      if (currentJson !== newJson) {
        const isEditorEmpty =
          currentBlocks.length === 0 ||
          (currentBlocks.length === 1 &&
            currentBlocks[0].content === undefined);

        console.log(`[Editor] Syncing content. Empty? ${isEditorEmpty}`, {
          currentLen: currentBlocks.length,
          newLen: parsedContent.length,
        });

        try {
          editor.replaceBlocks(editor.document, parsedContent);
        } catch (error) {
          console.error('Content sync failed', error);
        }
      }
    };

    const timer = setTimeout(syncContent, 10);
    return () => {
      clearTimeout(timer);
    };
  }, [editor, parsedContent]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (
        editorWrapperReference.current &&
        !editorWrapperReference.current.contains(e.target as Node)
      ) {
        return;
      }

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const text = clipboardData.getData('text/plain');
      if (!text) return;

      if (
        text.trim().startsWith('{') &&
        text.includes('sourcePageId') &&
        text.includes('sourceBlockId')
      ) {
        console.log(
          '[Editor] Detected Synced Block Paste Candidate',
          text.slice(0, 50)
        );
        try {
          const properties = JSON.parse(text) as {
            sourcePageId: string;
            sourceBlockId: string;
          };
          if (properties.sourcePageId && properties.sourceBlockId) {
            e.preventDefault();
            e.stopPropagation();

            console.log(
              '[Editor] Inserting Synced Block Mirror with props:',
              properties
            );

            let currentBlock: (typeof editor.document)[number] | undefined =
              undefined;
            try {
              currentBlock = editor.getTextCursorPosition().block;
            } catch {
              const document_ = editor.document;
              const lastBlock = document_.at(-1);
              if (lastBlock) {
                currentBlock = lastBlock;
              }
            }

            if (currentBlock) {
              editor.insertBlocks(
                [
                  {
                    type: 'syncedBlock',
                    props: properties,
                  } as PartialBlock,
                ],
                currentBlock,
                'after'
              );
            }
          }
        } catch (error) {
          console.error('Failed to paste Synced Block', error);
        }
      }
    };

    document.addEventListener('paste', handlePaste, { capture: true });
    return () => {
      document.removeEventListener('paste', handlePaste, { capture: true });
    };
  }, [editor]);

  const draggedBlockIdReference = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const blockElement = target.closest('[data-id]') as HTMLElement;
    if (blockElement) {
      draggedBlockIdReference.current = blockElement.dataset.id || null;
    }
  };

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    x: number;
    y: number;
    height: number;
  } | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingFile(false);
    }
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingFile(true);
      return;
    }

    const targetElement = (e.target as HTMLElement).closest(
      '[data-id]'
    ) as HTMLElement;
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;

      const isRightSide = offsetX > rect.width * 0.7;

      const targetId = targetElement.dataset.id;
      if (targetId && draggedBlockIdReference.current === targetId) {
        setDropIndicator(null);
        return;
      }

      if (isRightSide) {
        e.preventDefault();

        const containerRect =
          editorWrapperReference.current?.getBoundingClientRect();
        if (containerRect) {
          setDropIndicator({
            x: rect.right - containerRect.left - 4,
            y: rect.top - containerRect.top,
            height: rect.height,
          });
          return;
        }
      }
    }
    setDropIndicator(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    setIsDraggingFile(false);
    setDropIndicator(null);

    if (e.dataTransfer.files.length > 0) {
      e.preventDefault();

      for (const file of e.dataTransfer.files) {
        try {
          let bucket = edgestore.editorMedia;
          let blockType = 'file';
          let properties: Record<string, string | number> = {
            title: file.name,
          };

          if (file.type.startsWith('image/')) {
            blockType = 'image';
            properties = { caption: '' };
          } else if (file.type.startsWith('video/')) {
            blockType = 'video';
            properties = { caption: '' };
          } else if (file.type.startsWith('audio/')) {
            blockType = 'audio';
            properties = { title: file.name, caption: '' };
          } else {
            bucket = edgestore.documentFiles;
            properties = { name: file.name, size: file.size, type: file.type };
          }

          const res = await bucket.upload({ file });
          const currentBlock = editor.getTextCursorPosition().block;

          editor.insertBlocks(
            [
              {
                type: blockType,
                props: {
                  url: res.url,
                  ...properties,
                },
              } as PartialBlock,
            ],
            currentBlock,
            'after'
          );
        } catch (error) {
          console.error('Drop upload failed', error);
        }
      }
      return;
    }

    let targetElement = e.target as HTMLElement;
    while (targetElement && !targetElement.dataset.id) {
      targetElement = targetElement.parentElement!;
    }

    if (!targetElement) return;

    const targetId = targetElement.dataset.id;
    if (!targetId) return;

    const targetBlock = editor.getBlock(targetId);
    if (!targetBlock) return;

    const rect = targetElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const isRightSide = offsetX > rect.width * 0.5;

    if (isRightSide) {
      e.preventDefault();
      e.stopPropagation();

      let sourceBlockId = draggedBlockIdReference.current;

      if (!sourceBlockId) {
        const selection = editor.getSelection();
        if (selection?.blocks && selection.blocks.length > 0) {
          sourceBlockId = selection.blocks[0].id;
        }
      }

      if (!sourceBlockId) return;

      const sourceBlock = await editor.getBlock(sourceBlockId);
      if (!sourceBlock) return;

      if (sourceBlock.id === targetBlock.id) return;

      editor.removeBlocks([sourceBlock]);

      if (targetBlock.type === 'grid') {
        const currentCols = targetBlock.props.columns;
        if (currentCols < 6) {
          const newCols = currentCols + 1;
          const propertyKey = `col${newCols}`;

          editor.updateBlock(targetBlock, {
            props: {
              columns: newCols,
              [propertyKey]: JSON.stringify([sourceBlock]),
            },
          });
        }
      } else {
        const newGrid = {
          type: 'grid',
          props: {
            columns: 2,
            col1: JSON.stringify([targetBlock]),
            col2: JSON.stringify([sourceBlock]),
          },
        };

        editor.replaceBlocks([targetBlock], [newGrid as PartialBlock]);
      }
    }
  };

  const insertOrUpdateBlock = (
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
        [{ type, props: properties } as PartialBlock]
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
        [{ type, props: properties } as PartialBlock],
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
      [{ type, props: properties } as PartialBlock],
      currentBlock,
      'after'
    );
  };

  const cleanupSlashCommand = () => {
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
  };

  const getCustomSlashMenuItems = (editor: typeof schema.BlockNoteEditor) => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    const wrappedDefaultItems = defaultItems.map((item) => ({
      ...item,
      onItemClick: () => {
        cleanupSlashCommand();
        item.onItemClick();
      },
    }));

    const customItems = [
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
        title: 'Ask AI',
        onItemClick: () => {
          cleanupSlashCommand();

          const currentBlock = editor.getTextCursorPosition().block;
          editor.insertBlocks(
            [
              {
                type: 'callout',
                props: { type: 'info' },
                content: '✨ AI is thinking... (Mock Feature)',
              } as PartialBlock,
            ],
            currentBlock,
            'after'
          );
        },
        aliases: ['ai', 'ask', 'magic'],
        group: 'AI',
        icon: <div className="text-xl">✨</div>,
        subtext: 'Generate or edit content with AI',
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
        title: 'Embed',
        onItemClick: () => {
          insertOrUpdateBlock('embed');
        },
        aliases: ['embed', 'iframe'],
        group: 'Media',
        icon: <div className="text-xl">🔗</div>,
        subtext: 'Embed from another site',
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
            type: 'pageMention',
            props: { pageId: document_.id },
          } as PartialBlock;

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
        title: 'Database - Full Page',
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

          const { createDatabase } =
            await import('@/app/(main)/_actions/database');
          const { page: _page } = await createDatabase(documentId);
          const newBlock = {
            type: 'paragraph',
            content: [
              {
                type: 'link',
                href: `/documents/${_page.id}`,
                content: 'Untitled Database',
              },
            ],
          } as PartialBlock;

          if (insertMode === 'replace') {
            editor.replaceBlocks([currentBlock], [newBlock]);
          } else {
            editor.insertBlocks([newBlock], currentBlock, 'after');
          }
        },
        aliases: ['database', 'table', 'db', 'full page database'],
        group: 'Basic',
        icon: <div className="text-xl">🗄️</div>,
        subtext: 'Create a full page database',
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
            type: 'inlineDatabase',
            props: { linkedDatabaseId: linkedDatabase.id },
          } as PartialBlock;

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
        title: 'Synced Block',
        onItemClick: async () => {
          insertOrUpdateBlock('syncedBlock');
        },
        aliases: ['synced', 'sync', 'mirror', 'copy block'],
        group: 'Advanced',
        icon: <div className="text-xl">🔄</div>,
        subtext: 'Sync content across pages',
      },
      {
        title: 'Paste Synced Block',
        onItemClick: async () => {
          const input = prompt('Enter Synced Block ID (JSON format or ID):');
          if (!input) return;

          try {
            let properties = {};
            try {
              properties = JSON.parse(input);
            } catch {
              alert('Please paste the full Sync JSON from the original block.');
              return;
            }

            insertOrUpdateBlock('syncedBlock', properties);
          } catch (error) {
            console.error(error);
          }
        },
        aliases: ['paste sync', 'link sync'],
        group: 'Advanced',
        icon: <div className="text-xl">🔗</div>,
        subtext: 'Paste a synced block from clipboard',
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

    const customTitles = new Set(customItems.map((index) => index.title));
    const filteredDefaultItems = wrappedDefaultItems.filter(
      (index) => !customTitles.has(index.title) && index.title !== 'Image'
    );
    const combinedItems = [...filteredDefaultItems, ...customItems];

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
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (slashMenuOpen) {
      const allItems = getCustomSlashMenuItems(editor);
      const filtered = filterSuggestionItems(allItems, slashMenuQuery);
      setFilteredItems(filtered);
      setSlashMenuIndex(0);
    }
  }, [slashMenuOpen, slashMenuQuery, editor]);

  const editorWrapperReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTrigger = () => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      if (
        editorWrapperReference.current &&
        !editorWrapperReference.current.contains(selection.anchorNode)
      ) {
        return;
      }

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
        // No default
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [slashMenuOpen, slashMenuIndex, filteredItems, editor]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!editorWrapperReference.current?.contains(e.target as Node)) {
        return;
      }

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

  const handleEditorChange = () => {
    const blocks = editor.document;
    const jsonContent = JSON.stringify(blocks);
    onChange(jsonContent);
  };

  const handleMentionSelect = (pageId: string) => {
    const currentBlock = editor.getTextCursorPosition().block;

    editor.replaceBlocks(
      [currentBlock],
      [
        {
          type: 'pageMention',
          props: { pageId },
        } as PartialBlock,
      ]
    );
  };

  useEffect(() => {
    const styleId = 'blocknote-background-colors';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.append(styleElement);
    }

    const isDark = resolvedTheme === 'dark';
    const colors = [
      { name: 'default', light: 'transparent', dark: 'transparent' },
      { name: 'gray', light: 'rgb(241, 241, 239)', dark: 'rgb(71, 76, 80)' },
      { name: 'brown', light: 'rgb(244, 238, 234)', dark: 'rgb(67, 64, 64)' },
      { name: 'orange', light: 'rgb(251, 236, 221)', dark: 'rgb(89, 74, 58)' },
      { name: 'yellow', light: 'rgb(251, 243, 219)', dark: 'rgb(89, 86, 59)' },
      { name: 'green', light: 'rgb(237, 243, 236)', dark: 'rgb(53, 76, 75)' },
      { name: 'blue', light: 'rgb(231, 243, 248)', dark: 'rgb(45, 66, 86)' },
      { name: 'purple', light: 'rgb(244, 240, 247)', dark: 'rgb(73, 47, 100)' },
      { name: 'pink', light: 'rgb(249, 238, 243)', dark: 'rgb(83, 59, 76)' },
      { name: 'red', light: 'rgb(253, 235, 236)', dark: 'rgb(89, 65, 65)' },
    ];

    const css = colors
      .map((color) => {
        const bgColor = isDark ? color.dark : color.light;
        return `.bn-block-outer[data-background-color="${color.name}"] { background-color: ${bgColor}; border-radius: 3px; }`;
      })
      .join('\n');

    styleElement.textContent = css;
  }, [resolvedTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={editorWrapperReference}
      className={`blocknote-editor relative rounded-md transition-colors ${isDraggingFile ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
      onDragEnter={handleDragEnter}
      onDropCapture={handleDrop}
      onDragOverCapture={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragStart={handleDragStart}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        onChange={handleEditorChange}
        slashMenu={false}
        formattingToolbar={false}
        data-background-color-support="true"
      >
        {}
      </BlockNoteView>

      {}
      {dropIndicator && (
        <div
          className="absolute z-50 pointer-events-none bg-primary w-1 rounded-full shadow-lg transition-all duration-150"
          style={{
            top: dropIndicator.y,
            left: dropIndicator.x,
            height: dropIndicator.height,
          }}
        />
      )}

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
        onSelect={handleMentionSelect}
        position={mentionPosition}
        currentPageId={documentId}
      />

      <FormattingToolbar editor={editor} />

      {isDraggingFile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md pointer-events-none">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-lg">
            Drop files to upload
          </div>
        </div>
      )}
    </div>
  );
};
