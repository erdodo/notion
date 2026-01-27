'use client';
import { useCallback } from 'react';

import { BlockMenu } from './block-menu';

import {
  convertBlockType,
  duplicateBlock,
  BlockColor,
} from '@/lib/block-utils';

interface BlockSideMenuProperties {
  // BlockNote editor ve block tipleri karmaşık generic yapıya sahip
  block: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  editor: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function BlockSideMenu({ block, editor }: BlockSideMenuProperties) {
  const handleConvert = useCallback(
    (newType: string) => {
      const converted = convertBlockType(block, newType);
      editor.updateBlock(block.id, converted);
    },
    [block, editor]
  );

  const handleDuplicate = useCallback(() => {
    const duplicate = duplicateBlock(block);
    editor.insertBlocks([duplicate], block.id, 'after');
  }, [block, editor]);

  const handleDelete = useCallback(() => {
    editor.removeBlocks([block.id]);
  }, [block, editor]);

  const handleColorChange = useCallback(
    (color: BlockColor) => {
      editor.updateBlock(block.id, {
        props: { ...block.props, backgroundColor: color },
      });
    },
    [block, editor]
  );

  return (
    <BlockMenu
      blockId={block.id}
      blockType={block.type}
      backgroundColor={block.props?.backgroundColor || 'default'}
      onConvert={handleConvert}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onColorChange={handleColorChange}
    />
  );
}
