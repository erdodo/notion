'use client';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { getSidebarDocuments } from '../_actions/documents';

import { ItemSkeleton } from './item-skeleton';
import { SortableItem } from './sortable-item';

import { reorderPages } from '@/app/(main)/_actions/navigation';
import { cn } from '@/lib/utils';
import { Document } from '@/store/use-documents-store';

interface SortableDocumentListProperties {
  documents?: Document[];
  parentId?: string | null;
  level?: number;
  data?: Document[];
}

export function SortableDocumentList({
  documents: initialDocuments,
  parentId = null,
  level = 0,
  data,
}: SortableDocumentListProperties) {
  const docsToUse = useMemo(
    () => initialDocuments || data || [],
    [initialDocuments, data]
  );

  const [documents, setDocuments] = useState(docsToUse);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(docsToUse);
  }, [docsToUse]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [children, setChildren] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeDocument = activeId
    ? documents.find((d) => d.id === activeId)
    : null;

  const onExpand = async (documentId: string) => {
    const isExpanded = expanded[documentId];

    if (!isExpanded) {
      setLoading((previous) => ({ ...previous, [documentId]: true }));
      try {
        const docs = await getSidebarDocuments(documentId);
        setChildren((previous) => ({ ...previous, [documentId]: docs }));
      } catch (error) {
        console.error('Error loading children:', error);
      } finally {
        setLoading((previous) => ({ ...previous, [documentId]: false }));
      }
    }

    setExpanded((previous) => ({ ...previous, [documentId]: !isExpanded }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = documents.findIndex((d) => d.id === active.id);
    const newIndex = documents.findIndex((d) => d.id === over.id);

    const newDocuments = [...documents];
    const [movedItem] = newDocuments.splice(oldIndex, 1);
    newDocuments.splice(newIndex, 0, movedItem);
    setDocuments(newDocuments);

    try {
      await reorderPages(
        parentId,
        newDocuments.map((d) => d.id)
      );
    } catch {
      setDocuments(documents);
    }
  };

  if (!docsToUse || docsToUse.length === 0) {
    return (
      <div
        className={cn(
          'text-sm text-muted-foreground/80 py-1',
          level === 0 && 'px-2'
        )}
        style={{
          paddingLeft: level > 0 ? `${level * 12 + 12 + 24}px` : undefined,
        }}
      >
        <p className="flex items-center gap-x-2">
          <FileText className="h-4 w-4" />
          <span>No pages inside</span>
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={documents.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5">
          {documents.map((document_) => {
            if (!document_?.id) return null;
            const isExpanded = expanded[document_.id];
            const childDocs = children[document_.id];
            const isLoading = loading[document_.id];

            return (
              <SortableItem
                key={document_.id}
                document={document_}
                level={level}
                isOver={overId === document_.id}
                onExpand={() => onExpand(document_.id)}
                expanded={!!isExpanded}
              >
                {}
                {isLoading && (
                  <div className="pl-4">
                    <ItemSkeleton level={level + 1} />
                  </div>
                )}
                {!isLoading && childDocs && (
                  <SortableDocumentList
                    documents={childDocs}
                    parentId={document_.id}
                    level={level + 1}
                  />
                )}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>

      {}
      {createPortal(
        <DragOverlay>
          {activeDocument && (
            <div className="bg-background border rounded-md shadow-lg p-2 flex items-center gap-2 w-auto min-w-[150px]">
              <span className="text-[18px]">
                {activeDocument.icon || (
                  <FileText className="h-[18px] w-[18px]" />
                )}
              </span>
              <span className="text-sm font-medium">
                {activeDocument.title || 'Untitled'}
              </span>
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
