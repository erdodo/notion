'use client';

import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '@/app/(main)/_actions/navigation';
import { Button } from '@/components/ui/button';
import { useContextMenu } from '@/hooks/use-context-menu';
import { cn } from '@/lib/utils';

interface FavoriteButtonProperties {
  pageId: string;
  className?: string;
}

export function FavoriteButton({
  pageId,
  className,
}: FavoriteButtonProperties) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  const { onContextMenu, onTouchStart, onTouchEnd, onTouchMove } =
    useContextMenu({
      type: 'interface-element',
      data: { type: 'favorite', id: pageId },
    });

  useEffect(() => {
    isFavorite(pageId)
      .then(setFavorited)
      .finally(() => {
        setLoading(false);
      });
  }, [pageId]);

  const handleToggle = async () => {
    const previousState = favorited;
    setFavorited(!favorited);

    try {
      await (previousState
        ? removeFromFavorites(pageId)
        : addToFavorites(pageId));

      document.dispatchEvent(new CustomEvent('favorite-changed'));
    } catch {
      setFavorited(previousState);
    }
  };

  if (loading) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      className={cn('h-8 w-8 px-0', className)}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          'h-4 w-4 transition-colors',
          favorited
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground hover:text-foreground'
        )}
      />
    </Button>
  );
}
