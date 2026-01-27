'use client';

import { createReactBlockSpec } from '@blocknote/react';
import {
  FileText,
  ExternalLink,
  PanelRight,
  Maximize2,
  MousePointerClick,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { getDocument } from '@/app/(main)/_actions/documents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePreview } from '@/hooks/use-preview';

const PageMention = ({ pageId }: { pageId: string }) => {
  const { onOpen } = usePreview();
  const router = useRouter();
  const [page, setPage] = useState<{
    title: string;
    icon: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = () => {
      if (pageId) {
        getDocument(pageId)
          .then((p) =>
            setPage(p ? { title: p.title, icon: p.icon || null } : null)
          )
          .catch(() => setPage(null))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    fetchPage();

    const handleUpdate = () => {
      fetchPage();
    };

    globalThis.addEventListener('notion-document-update', handleUpdate);
    return () =>
      globalThis.removeEventListener('notion-document-update', handleUpdate);
  }, [pageId]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-sm align-middle">
        <div className="h-4 w-4 bg-muted-foreground/20 animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted-foreground/20 animate-pulse rounded" />
      </span>
    );
  }

  if (!page) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-sm align-middle">
        <FileText className="h-4 w-4" />
        <span>Page not found</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center align-middle mx-1"
      contentEditable={false}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-sm group transition-colors">
            <span>{page.icon || <FileText className="h-4 w-4" />}</span>
            <span className="underline-offset-2 group-hover:underline">
              {page.title || 'Untitled'}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              router.push(`/documents/${pageId}`);
            }}
          >
            <MousePointerClick className="h-4 w-4 mr-2" />
            Open Page
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onOpen(pageId, 'side');
            }}
          >
            <PanelRight className="h-4 w-4 mr-2" />
            Open in Side Peek
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onOpen(pageId, 'center');
            }}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Open in Center Peek
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => window.open(`/documents/${pageId}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
};

export const PageMentionBlock = createReactBlockSpec(
  {
    type: 'pageMention',
    propSchema: {
      pageId: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block }) => {
      return <PageMention pageId={block.props.pageId} />;
    },
  }
);
