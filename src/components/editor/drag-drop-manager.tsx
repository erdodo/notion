'use client';

import { useEffect, useRef, useState } from 'react';

import { useEdgeStore } from '@/lib/edgestore';

interface DragDropManagerProperties {
  editor: any;
  documentId?: string;
}

export const DragDropManager = ({
  editor,
  documentId,
}: DragDropManagerProperties) => {
  const draggedBlockIdReference = useRef<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    x: number;
    y: number;
    height: number;
  } | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const blockElement = target.closest('[data-id]') as HTMLElement;
    if (blockElement) {
      draggedBlockIdReference.current = blockElement.dataset.id || null;
    }
  };

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

        const containerRect = document
          .querySelector('.blocknote-editor')
          ?.getBoundingClientRect();
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
          const { edgestore } = useEdgeStore();
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
              } as any,
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

        editor.replaceBlocks([targetBlock], [newGrid as any]);
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const text = clipboardData.getData('text/plain');
      if (!text) return;

      if (
        text.trim().startsWith('{') &&
        text.includes('sourcePageId') &&
        text.includes('sourceBlockId')
      ) {
        try {
          const properties = JSON.parse(text) as {
            sourcePageId: string;
            sourceBlockId: string;
          };
          if (properties.sourcePageId && properties.sourceBlockId) {
            e.preventDefault();
            e.stopPropagation();

            let currentBlock: any | undefined = undefined;
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
                  } as any,
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

  return null;
};
