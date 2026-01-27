'use client';

import { DatabaseRow } from '@prisma/client';

import { cn } from '@/lib/utils';

interface CalendarEventProperties {
  event: DatabaseRow & { title: string };

  onClick?: () => void;
}

export function CalendarEvent({ event, onClick }: CalendarEventProperties) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-colors',
        'bg-primary/10 text-primary hover:bg-primary/20',
        'dark:bg-primary/20 dark:text-primary-foreground/90'
      )}
    >
      {event.title || 'Untitled'}
    </button>
  );
}
