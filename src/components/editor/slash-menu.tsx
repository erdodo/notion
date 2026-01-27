'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface SlashMenuItem {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  group?: string;
  icon?: React.ReactNode | string;
  subtext?: string;
}

interface SlashMenuProperties {
  items: SlashMenuItem[];
  selectedIndex: number;
  onItemClick: (item: SlashMenuItem) => void;
  onClose?: () => void;
  position: { x: number; y: number };
}

export const SlashMenu = ({
  items,
  selectedIndex,
  onItemClick,
  position,
}: SlashMenuProperties) => {
  const menuReference = useRef<HTMLDivElement>(null);
  const itemReferences = useRef<(HTMLDivElement | null)[]>([]);
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({
    opacity: 0,
    top: -9999,
    left: -9999,
  });

  useEffect(() => {
    const calculatePosition = () => {
      if (!menuReference.current) return;
      const windowHeight = window.innerHeight;
      const shouldGoUp = position.y > windowHeight / 2;
      let left = position.x;

      const menuWidth = 250;
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 20;
      }

      if (shouldGoUp) {
        setAdjustedStyle({
          position: 'fixed',
          left: left,
          bottom: windowHeight - position.y,
          top: 'auto',
          maxHeight: '300px',
          opacity: 1,
        });
      } else {
        setAdjustedStyle({
          position: 'fixed',
          left: left,
          top: position.y + 24,
          bottom: 'auto',
          maxHeight: '300px',
          opacity: 1,
        });
      }
    };

    calculatePosition();
  }, [position]);

  useEffect(() => {
    const selectedItem = itemReferences.current[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div
      ref={menuReference}
      style={adjustedStyle}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className="z-50 w-64 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
    >
      <div className="flex flex-col overflow-y-auto max-h-[300px]">
        {items.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">No matches</div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              ref={(element) => {
                itemReferences.current[index] = element;
              }}
              className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onItemClick(item);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {item.icon && (
                <span className="w-5 h-5 flex items-center justify-center text-muted-foreground text-xs">
                  {item.icon}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{item.title}</span>
                {item.subtext && (
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {item.subtext}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
