'use client';

import { ArrowUpRight, Link2, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getBacklinks } from '@/app/(main)/_actions/navigation';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface BacklinksPanelProperties {
  pageId: string;
}

interface BacklinkItem {
  pageId: string;
  title: string;
  icon: string | null;
  context?: string;
}

export function BacklinksPanel({ pageId }: BacklinksPanelProperties) {
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    getBacklinks(pageId)
      .then(setBacklinks)
      .finally(() => {
        setLoading(false);
      });
  }, [pageId]);

  if (loading) {
    return (
      <div className="p-4 border-t">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (backlinks.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>
              {backlinks.length} Backlink{backlinks.length !== 1 && 's'}
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-1">
          {backlinks.map((link) => (
            <Link
              key={link.pageId}
              href={`/documents/${link.pageId}`}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted group"
            >
              <span className="text-lg">{link.icon || '📄'}</span>
              <span className="flex-1 text-sm truncate">
                {link.title || 'Untitled'}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
