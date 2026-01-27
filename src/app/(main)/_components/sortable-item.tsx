'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

import { Item } from './item';

import { cn } from '@/lib/utils';
import { Document } from '@/store/use-documents-store';

interface SortableItemProperties {
  document: Document;
  level: number;
  isOver: boolean;
  onExpand: () => void;
  expanded: boolean;
  children?: ReactNode;
}

export function SortableItem({
  document,
  level,
  isOver,
  onExpand,
  expanded,
  children,
}: SortableItemProperties) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: document.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'opacity-50',
        isOver && 'bg-blue-50 dark:bg-blue-950/20'
      )}
    >
      <Item
        id={document.id}
        title={document.title}
        icon={document.icon || undefined}
        parentId={document.parentId}
        level={level}
        expanded={expanded}
        onExpand={onExpand}
        hasChildren={(document._count?.children || 0) > 0}
      />

      {}
      {expanded && children}
    </div>
  );
}
