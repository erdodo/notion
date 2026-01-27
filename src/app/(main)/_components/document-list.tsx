'use client';

import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getSidebarDocuments, createDocument } from '../_actions/documents';

import { Item } from './item';
import { ItemSkeleton } from './item-skeleton';

import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  icon?: string | null;
  parentId?: string | null;
  _count: {
    children: number;
  };
}

interface DocumentListProperties {
  parentDocumentId?: string;
  level?: number;
  data?: Document[];
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
  data,
}: DocumentListProperties) => {
  const _parentDocumentId = parentDocumentId;
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [children, setChildren] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState<Record<string, boolean>>({});

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

  const onCreate = async (parentId?: string) => {
    setCreating((previous) => ({ ...previous, [parentId || 'root']: true }));

    try {
      const document = await createDocument('Untitled', parentId);

      if (parentId) {
        const docs = await getSidebarDocuments(parentId);
        setChildren((previous) => ({ ...previous, [parentId]: docs }));
        setExpanded((previous) => ({ ...previous, [parentId]: true }));
      }

      router.push(`/documents/${document.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setCreating((previous) => ({ ...previous, [parentId || 'root']: false }));
    }
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'text-xs text-muted-foreground/60 py-1 font-medium select-none',
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
    <>
      {data.map((document) => {
        const isExpanded = expanded[document.id];
        const childDocs = children[document.id];
        const isLoading = loading[document.id];
        const isCreating = creating[document.id];

        return (
          <div key={document.id}>
            <Item
              id={document.id}
              title={document.title}
              icon={document.icon || undefined}
              parentId={document.parentId}
              level={level}
              expanded={isExpanded}
              onExpand={() => onExpand(document.id)}
              onCreate={() => onCreate(document.id)}
              hasChildren={document._count.children > 0}
              isCreating={isCreating}
            />

            {isExpanded && (
              <>
                {isLoading && (
                  <>
                    <ItemSkeleton level={level + 1} />
                    <ItemSkeleton level={level + 1} />
                  </>
                )}

                {!isLoading && childDocs && (
                  <DocumentList
                    parentDocumentId={document.id}
                    level={level + 1}
                    data={childDocs}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
};
