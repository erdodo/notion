import type { Block } from '@blocknote/core';

export const BLOCK_COLORS = {
  default: { bg: 'transparent', label: 'Default' },
  gray: { bg: 'rgb(241, 241, 239)', label: 'Gray' },
  brown: { bg: 'rgb(244, 238, 234)', label: 'Brown' },
  orange: { bg: 'rgb(251, 236, 221)', label: 'Orange' },
  yellow: { bg: 'rgb(251, 243, 219)', label: 'Yellow' },
  green: { bg: 'rgb(237, 243, 236)', label: 'Green' },
  blue: { bg: 'rgb(231, 243, 248)', label: 'Blue' },
  purple: { bg: 'rgb(244, 240, 247)', label: 'Purple' },
  pink: { bg: 'rgb(249, 238, 243)', label: 'Pink' },
  red: { bg: 'rgb(253, 235, 236)', label: 'Red' },
} as const;

export const BLOCK_COLORS_DARK = {
  default: { bg: 'transparent', label: 'Default' },
  gray: { bg: 'rgb(71, 76, 80)', label: 'Gray' },
  brown: { bg: 'rgb(67, 64, 64)', label: 'Brown' },
  orange: { bg: 'rgb(89, 74, 58)', label: 'Orange' },
  yellow: { bg: 'rgb(89, 86, 59)', label: 'Yellow' },
  green: { bg: 'rgb(53, 76, 75)', label: 'Green' },
  blue: { bg: 'rgb(45, 66, 86)', label: 'Blue' },
  purple: { bg: 'rgb(73, 47, 100)', label: 'Purple' },
  pink: { bg: 'rgb(83, 59, 76)', label: 'Pink' },
  red: { bg: 'rgb(89, 65, 65)', label: 'Red' },
} as const;

export type BlockColor = keyof typeof BLOCK_COLORS;

export const BLOCK_CONVERSIONS: Record<string, string[]> = {
  paragraph: [
    'heading',
    'bulletListItem',
    'numberedListItem',
    'checkListItem',
    'quote',
    'callout',
  ],
  heading: ['paragraph', 'bulletListItem', 'numberedListItem', 'checkListItem'],
  bulletListItem: ['paragraph', 'heading', 'numberedListItem', 'checkListItem'],
  numberedListItem: ['paragraph', 'heading', 'bulletListItem', 'checkListItem'],
  checkListItem: ['paragraph', 'heading', 'bulletListItem', 'numberedListItem'],
  quote: ['paragraph', 'callout'],
  callout: ['paragraph', 'quote'],
};

export function getAvailableConversions(blockType: string): string[] {
  return BLOCK_CONVERSIONS[blockType] || [];
}

export function convertBlockType(
  block: Block,
  newType: string
): Partial<Block> {
  const converted: Partial<Block> = {
    type: newType as Block['type'],
    content: block.content,
    children: block.children,
  };

  switch (newType) {
    case 'heading': {
      converted.props = { level: 1 };

      break;
    }
    case 'checkListItem': {
      converted.props = { checked: false };

      break;
    }
    case 'callout': {
      converted.props = {
        emoji: '💡',
        backgroundColor: 'default',
      };

      break;
    }
    default: {
      converted.props = {};
    }
  }

  return converted;
}

export function duplicateBlock(block: Block): Partial<Block> {
  return {
    type: block.type as Block['type'],
    props: { ...block.props },
    content: block.content,
    children: block.children
      ? (block.children.map(duplicateBlock) as Partial<Block>[])
      : undefined,
  };
}

export function getBlockColorStyle(color: BlockColor, isDark = false): string {
  const colors = isDark ? BLOCK_COLORS_DARK : BLOCK_COLORS;
  return colors[color]?.bg || colors.default.bg;
}

export function formatBlockTypeName(type: string): string {
  const names: Record<string, string> = {
    paragraph: 'Text',
    heading: 'Heading',
    bulletListItem: 'Bulleted list',
    numberedListItem: 'Numbered list',
    checkListItem: 'To-do list',
    quote: 'Quote',
    callout: 'Callout',
    codeBlock: 'Code',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    file: 'File',
    table: 'Table',
    divider: 'Divider',
  };

  return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
}
