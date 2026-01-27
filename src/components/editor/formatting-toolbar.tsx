'use client';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Palette,
  Highlighter,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

import { schema } from './schema';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FormattingToolbarProperties {
  editor: typeof schema.BlockNoteEditor | null;
}

const TEXT_COLORS = [
  { name: 'Default', value: 'default', color: 'currentColor' },
  { name: 'Gray', value: 'gray', color: 'rgb(120, 119, 116)' },
  { name: 'Brown', value: 'brown', color: 'rgb(159, 107, 83)' },
  { name: 'Orange', value: 'orange', color: 'rgb(217, 115, 13)' },
  { name: 'Yellow', value: 'yellow', color: 'rgb(203, 145, 47)' },
  { name: 'Green', value: 'green', color: 'rgb(68, 131, 97)' },
  { name: 'Blue', value: 'blue', color: 'rgb(51, 126, 169)' },
  { name: 'Purple', value: 'purple', color: 'rgb(144, 101, 176)' },
  { name: 'Pink', value: 'pink', color: 'rgb(193, 76, 138)' },
  { name: 'Red', value: 'red', color: 'rgb(212, 76, 71)' },
];

const BACKGROUND_COLORS = [
  { name: 'Default', value: 'default', color: 'transparent' },
  {
    name: 'Gray',
    value: 'gray',
    lightColor: 'rgb(241, 241, 239)',
    darkColor: 'rgb(71, 76, 80)',
  },
  {
    name: 'Brown',
    value: 'brown',
    lightColor: 'rgb(244, 238, 234)',
    darkColor: 'rgb(67, 64, 64)',
  },
  {
    name: 'Orange',
    value: 'orange',
    lightColor: 'rgb(251, 236, 221)',
    darkColor: 'rgb(89, 74, 58)',
  },
  {
    name: 'Yellow',
    value: 'yellow',
    lightColor: 'rgb(251, 243, 219)',
    darkColor: 'rgb(89, 86, 59)',
  },
  {
    name: 'Green',
    value: 'green',
    lightColor: 'rgb(237, 243, 236)',
    darkColor: 'rgb(53, 76, 75)',
  },
  {
    name: 'Blue',
    value: 'blue',
    lightColor: 'rgb(231, 243, 248)',
    darkColor: 'rgb(45, 66, 86)',
  },
  {
    name: 'Purple',
    value: 'purple',
    lightColor: 'rgb(244, 240, 247)',
    darkColor: 'rgb(73, 47, 100)',
  },
  {
    name: 'Pink',
    value: 'pink',
    lightColor: 'rgb(249, 238, 243)',
    darkColor: 'rgb(83, 59, 76)',
  },
  {
    name: 'Red',
    value: 'red',
    lightColor: 'rgb(253, 235, 236)',
    darkColor: 'rgb(89, 65, 65)',
  },
];

export function FormattingToolbar({ editor }: FormattingToolbarProperties) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString();

    if (!text || text.trim().length === 0) {
      setIsVisible(false);
      return;
    }

    const container = range.commonAncestorContainer;
    const editorElement =
      container.nodeType === Node.ELEMENT_NODE
        ? (container as Element).closest('.bn-editor')
        : container.parentElement?.closest('.bn-editor');

    if (!editorElement) {
      setIsVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    const toolbarWidth = 400;
    const toolbarHeight = 40;

    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - toolbarHeight - 8;

    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }
    if (top < 10) {
      top = rect.bottom + 8;
    }

    setPosition({ top, left });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      updatePosition();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [updatePosition]);

  const toggleStyle = (style: string) => {
    if (!editor) return;

    try {
      editor.toggleStyles({ [style]: true });
    } catch (error) {
      console.error('Error toggling style:', error);
    }
  };

  const setTextColor = (color: string) => {
    if (!editor) return;

    try {
      if (color === 'default') {
        editor.removeStyles({ textColor: true });
      } else {
        editor.addStyles({ textColor: color });
      }
    } catch (error) {
      console.error('Error setting text color:', error);
    }
  };

  const setBackgroundColor = (color: string) => {
    if (!editor) return;

    try {
      if (color === 'default') {
        editor.removeStyles({ backgroundColor: true });
      } else {
        editor.addStyles({ backgroundColor: color });
      }
    } catch (error) {
      console.error('Error setting background color:', error);
    }
  };

  if (!isVisible || !editor) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-1 bg-popover border rounded-lg shadow-lg p-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {}
      <button
        onClick={() => {
          toggleStyle('bold');
        }}
        className={cn(
          'p-2 rounded hover:bg-accent transition-colors',
          editor.getActiveStyles()?.bold && 'bg-accent'
        )}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          toggleStyle('italic');
        }}
        className={cn(
          'p-2 rounded hover:bg-accent transition-colors',
          editor.getActiveStyles()?.italic && 'bg-accent'
        )}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          toggleStyle('underline');
        }}
        className={cn(
          'p-2 rounded hover:bg-accent transition-colors',
          editor.getActiveStyles()?.underline && 'bg-accent'
        )}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          toggleStyle('strike');
        }}
        className={cn(
          'p-2 rounded hover:bg-accent transition-colors',
          editor.getActiveStyles()?.strike && 'bg-accent'
        )}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          toggleStyle('code');
        }}
        className={cn(
          'p-2 rounded hover:bg-accent transition-colors',
          editor.getActiveStyles()?.code && 'bg-accent'
        )}
        title="Inline Code (Ctrl+E)"
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="text-xs font-medium mb-2 text-muted-foreground">
            Text Color
          </div>
          <div className="grid grid-cols-5 gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setTextColor(color.value);
                }}
                className="h-8 w-8 rounded border hover:border-primary transition-colors flex items-center justify-center"
                style={{ color: color.color }}
                title={color.name}
              >
                <div className="text-lg font-bold">A</div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Highlight Color"
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="text-xs font-medium mb-2 text-muted-foreground">
            Highlight Color
          </div>
          <div className="grid grid-cols-5 gap-1">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setBackgroundColor(color.value);
                }}
                className="h-8 w-8 rounded border hover:border-primary transition-colors"
                style={{
                  backgroundColor:
                    color.value === 'default'
                      ? 'transparent'
                      : color.lightColor,
                }}
                title={color.name}
              >
                {color.value === 'default' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-red-500 rotate-45" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
