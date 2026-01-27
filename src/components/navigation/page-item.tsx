'use client';

import { ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createPage } from '@/actions/page';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  icon?: string | null;
  title: string;
  children?: Page[];
}

interface PageItemProperties {
  page: Page;
  level?: number;
  onRefresh: () => void;
}

export const PageItem = ({
  page,
  level = 0,
  onRefresh,
}: PageItemProperties) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCreateChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreating(true);

    try {
      const childPage = await createPage(page.id);
      setExpanded(true);
      onRefresh();
      router.push(`/documents/${childPage.id}`);
    } catch (error) {
      console.error('Error creating child page:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClick = () => {
    router.push(`/documents/${page.id}`);
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium cursor-pointer',
          level > 0 && 'pl-9'
        )}
        style={{
          paddingLeft: level > 0 ? `${level * 12 + 12}px` : '12px',
        }}
      >
        {page.children?.length > 0 && (
          <div
            role="button"
            onClick={handleExpand}
            className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          >
            <ChevronIcon className="h-4 w-4 shrink-0" />
          </div>
        )}

        <div className="flex items-center gap-x-2 flex-1 truncate">
          {page.icon ? (
            <span className="shrink-0 text-[18px]">{page.icon}</span>
          ) : (
            <FileText className="shrink-0 h-[18px] w-[18px]" />
          )}
          <span className="truncate">{page.title}</span>
        </div>

        <div className="flex items-center gap-x-2 ml-auto">
          <button
            onClick={handleCreateChild}
            disabled={isCreating}
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && page.children?.length > 0 && (
        <div>
          {page.children.map((child: Page) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};
