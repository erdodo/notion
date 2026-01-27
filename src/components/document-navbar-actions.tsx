'use client';

import { Users, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { getCommentCount } from '@/app/(main)/_actions/comments';
import { togglePublish } from '@/app/(main)/_actions/documents';
import { CommentsPanel } from '@/components/comments/comments-panel';
import { PresenceIndicators } from '@/components/presence-indicators';
import { ShareDialog } from '@/components/share-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentNavbarActionsProperties {
  pageId: string;
  pageTitle: string;
  isPublished: boolean;
}

export function DocumentNavbarActions({
  pageId,
  pageTitle,
  isPublished: initialPublished,
}: DocumentNavbarActionsProperties) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [hasComments, setHasComments] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const count = await getCommentCount(pageId);
        setHasComments(count > 0);
      } catch (error) {
        console.error('Failed to fetch comment count', error);
      }
    };
    fetchComments();
  }, [pageId, isCommentsOpen]);

  const handlePublishChange = async (published: boolean) => {
    setIsPublished(published);

    try {
      const result = await togglePublish(pageId);

      if (result.isPublished !== published) {
        setIsPublished(result.isPublished);
      }

      if (result.isPublished) {
        toast.success('Page published to web');
      } else {
        toast.success('Page unpublished');
      }
    } catch {
      setIsPublished(!published);
      toast.error('Failed to update publish status');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <PresenceIndicators pageId={pageId} className="mr-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          setIsShareOpen(true);
        }}
        className={cn(
          'h-8 w-8 px-0',
          isPublished
            ? 'text-sky-500 hover:text-sky-600'
            : 'text-muted-foreground'
        )}
      >
        <Users className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsCommentsOpen(true);
        }}
        className={cn(
          'h-8 w-8 px-0',
          hasComments
            ? 'text-sky-500 hover:text-sky-600'
            : 'text-muted-foreground'
        )}
      >
        <MessageSquare
          className={cn('h-4 w-4', hasComments && 'fill-sky-500/20')}
        />
      </Button>

      <ShareDialog
        pageId={pageId}
        pageTitle={pageTitle}
        isPublished={isPublished}
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
        }}
        onPublishChange={handlePublishChange}
      />

      <CommentsPanel
        pageId={pageId}
        isOpen={isCommentsOpen}
        onClose={() => {
          setIsCommentsOpen(false);
        }}
      />
    </div>
  );
}
