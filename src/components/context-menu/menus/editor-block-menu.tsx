'use client';

import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash,
  Copy,
  MessageSquare,
  Palette,
  Repeat,
  Type,
  List,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useOrigin } from '@/hooks/use-origin';
import { useContextMenuStore } from '@/store/use-context-menu-store';

interface EditorBlockMenuProperties {
  data: {
    editor: BlockNoteEditor;
    block: PartialBlock;
  };
}

export const EditorBlockMenu = ({ data }: EditorBlockMenuProperties) => {
  const { closeContextMenu } = useContextMenuStore();
  const origin = useOrigin();
  const { editor, block } = data;

  if (!editor || !block) return null;

  const onTurnInto = (
    type: string,
    properties: Record<string, unknown> = {}
  ) => {
    if (!block.id) return;
    editor.updateBlock(block.id, { type: type as any, props: properties });
    closeContextMenu();
  };

  const onColorChange = (color: string) => {
    if (!block.id) return;
    editor.updateBlock(block.id, { props: { backgroundColor: color } });
    closeContextMenu();
  };

  const onTextColorChange = (color: string) => {
    if (!block.id) return;
    editor.updateBlock(block.id, { props: { textColor: color } });
    closeContextMenu();
  };

  const onAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!block.id) return;
    editor.updateBlock(block.id, { props: { textAlignment: alignment } });
    closeContextMenu();
  };

  const onDelete = () => {
    if (!block.id) return;
    editor.removeBlocks([block.id]);
    closeContextMenu();
  };

  const onCopyLink = () => {
    const url = `${origin}${globalThis.location.pathname}#${block.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link to block copied');
    closeContextMenu();
  };

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Repeat className="h-4 w-4 mr-2" />
          Turn into
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-48">
          <DropdownMenuLabel>Basic blocks</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('paragraph');
            }}
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('heading', { level: 1 });
            }}
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('heading', { level: 2 });
            }}
          >
            <Heading2 className="h-4 w-4 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('heading', { level: 3 });
            }}
          >
            <Heading3 className="h-4 w-4 mr-2" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Lists</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('bulletListItem');
            }}
          >
            <List className="h-4 w-4 mr-2" />
            Bulleted list
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('numberedListItem');
            }}
          >
            <List className="h-4 w-4 mr-2" />
            Numbered list
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('checkListItem');
            }}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            To-do list
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('toggle');
            }}
          >
            <div className="h-4 w-4 mr-2 flex items-center justify-center font-bold">
              {'>'}
            </div>
            Toggle list
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('quote');
            }}
          >
            <Quote className="h-4 w-4 mr-2" />
            Quote
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onTurnInto('codeBlock');
            }}
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Palette className="h-4 w-4 mr-2" />
          Colors
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-48 h-64 overflow-y-auto">
          <DropdownMenuLabel>Text Color</DropdownMenuLabel>
          {[
            'default',
            'gray',
            'brown',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple',
            'pink',
            'red',
          ].map((c) => (
            <DropdownMenuItem
              key={'text-' + c}
              onClick={() => {
                onTextColorChange(c);
              }}
            >
              <div
                className={`w-4 h-4 mr-2 rounded-sm border`}
                style={{ background: c === 'default' ? 'transparent' : c }}
              />
              <span className="capitalize">{c}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Background</DropdownMenuLabel>
          {[
            'default',
            'gray',
            'brown',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple',
            'pink',
            'red',
          ].map((c) => (
            <DropdownMenuItem
              key={'bg-' + c}
              onClick={() => {
                onColorChange(c);
              }}
            >
              <div
                className={`w-4 h-4 mr-2 rounded-sm border`}
                style={{ background: c === 'default' ? 'transparent' : c }}
              />
              <span className="capitalize">{c} background</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuItem onClick={onCopyLink}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Link to Block
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => {
          toast.info('Comments not implemented yet');
          closeContextMenu();
        }}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Comment
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuLabel>Align</DropdownMenuLabel>
      <div className="flex p-2 gap-1 justify-between">
        <div
          className="p-1 hover:bg-muted rounded cursor-pointer"
          onClick={() => {
            onAlign('left');
          }}
        >
          <AlignLeft className="h-4 w-4" />
        </div>
        <div
          className="p-1 hover:bg-muted rounded cursor-pointer"
          onClick={() => {
            onAlign('center');
          }}
        >
          <AlignCenter className="h-4 w-4" />
        </div>
        <div
          className="p-1 hover:bg-muted rounded cursor-pointer"
          onClick={() => {
            onAlign('right');
          }}
        >
          <AlignRight className="h-4 w-4" />
        </div>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={onDelete}
        className="text-red-600 focus:text-red-600"
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete Block
        <DropdownMenuShortcut>Del</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
};
