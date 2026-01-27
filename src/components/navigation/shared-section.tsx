'use client';

import { Page } from '@prisma/client';
import { Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { getSharedDocuments } from '@/app/(main)/_actions/documents';
import { Item } from '@/app/(main)/_components/item';
import { Skeleton } from '@/components/ui/skeleton';

interface SharedSectionProperties {
  label?: string;
}

export function SharedSection({ label = 'Public' }: SharedSectionProperties) {
  const parameters = useParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSharedDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getSharedDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to list shared documents', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSharedDocuments();

    const onUpdate = () => {
      loadSharedDocuments();
    };

    globalThis.addEventListener('notion-document-update', onUpdate);
    return () => {
      globalThis.removeEventListener('notion-document-update', onUpdate);
    };
  }, []);

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if (isLoading) {
    return (
      <div className="mb-2">
        <div className="text-xs text-muted-foreground px-2 mb-2 pt-4">
          <span className="truncate">{label}</span>
        </div>
        <div className="px-3">
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <div className="text-xs text-muted-foreground px-2 mb-2 pt-4">
        <span className="truncate">{label}</span>
      </div>
      {documents.map((document) => (
        <Item
          key={document.id}
          id={document.id}
          title={document.title}
          icon={document.icon}
          fallbackIcon={Users}
          active={parameters.documentId === document.id}
          level={0}
          onExpand={() => {}}
          expanded={false}
          onClick={() => {
            onRedirect(document.id);
          }}
        />
      ))}
    </div>
  );
}
