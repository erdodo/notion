'use client';

import { Check, Copy, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { togglePublish } from '@/app/(main)/_actions/documents';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PublishProperties {
  initialData: {
    id: string;
    isPublished: boolean;
  };
}

export const Publish = ({ initialData }: PublishProperties) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(initialData.isPublished);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${globalThis.location.origin}/preview/${initialData.id}`);
  }, [initialData.id, initialData.isPublished]);

  const onPublish = async () => {
    setIsSubmitting(true);

    try {
      const result = await togglePublish(initialData.id);
      setIsPublished(result.isPublished);

      if (result.isPublished) {
        toast.success('Page published');
      } else {
        toast.success('Page unpublished');
      }
    } catch {
      toast.error('Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <Globe
            className={cn(
              'h-4 w-4 text-muted-foreground',
              isPublished && 'text-sky-500 animate-pulse'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <Globe className="text-sky-500 animate-pulse h-4 w-4" />
              <p className="text-xs font-medium text-sky-500">
                This page is live on web.
              </p>
            </div>
            <div className="flex items-center">
              <input
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                value={url}
                disabled
              />
              <Button
                onClick={onCopy}
                disabled={copied}
                className="h-8 rounded-l-none"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onPublish}
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Publish this note</p>
            <span className="text-xs text-muted-foreground mb-4">
              Share your work with others.
            </span>
            <Button
              disabled={isSubmitting}
              onClick={onPublish}
              className="w-full text-xs"
              size="sm"
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
