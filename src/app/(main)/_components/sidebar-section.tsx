'use client';

import { ChevronDown, ChevronRight, FileText, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  icon?: string | null;
}

interface SidebarSectionProperties {
  label: string;
  icon?: LucideIcon;
  data?: Document[];
}

export const SidebarSection = ({
  label,
  icon: Icon,
  data,
}: SidebarSectionProperties) => {
  const parameters = useParams();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      {Icon ? (
        <div
          role="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center w-full px-2 py-1 text-sm text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-sm mb-1 group"
        >
          <div className="h-4 w-4 mr-1 flex items-center justify-center transition">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
            )}
          </div>
          <Icon className="h-4 w-4 mr-2" />
          <span className="font-medium text-xs">{label}</span>
        </div>
      ) : (
        <div className="text-xs font-semibold text-muted-foreground px-4 mb-2 pt-4 uppercase">
          {label}
        </div>
      )}

      {isExpanded && (
        <div className={cn(Icon ? 'ml-4' : '')}>
          {data.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className={cn(
                'group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium',
                parameters.documentId === document.id &&
                  'bg-primary/5 text-primary'
              )}
            >
              {document.icon ? (
                <span className="shrink-0 mr-2 text-[18px]">
                  {document.icon}
                </span>
              ) : (
                <FileText className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
              )}
              <span className="truncate">{document.title || 'Untitled'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
