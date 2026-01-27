'use client';

import { ImageIcon, X, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { CoverImageModal } from '@/components/modals/cover-image-modal';
import { useContextMenu } from '@/hooks/use-context-menu';
import { useEdgeStore } from '@/lib/edgestore';
import { cn } from '@/lib/utils';

interface CoverProperties {
  url?: string;
  pageId?: string;
  preview?: boolean;
  position?: number;
}

export const Cover = ({
  url,
  pageId,
  preview,
  position = 0.5,
}: CoverProperties) => {
  const { edgestore } = useEdgeStore();
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [coverPosition, setCoverPosition] = useState(position);
  const [startPos, setStartPos] = useState(0);

  const [previousUrl, setPreviousUrl] = useState(url);
  if (url !== previousUrl) {
    setPreviousUrl(url);
    setCoverPosition(position);
  }

  const onRemove = async () => {
    if (url?.includes('files.edgestore.dev')) {
      try {
        await edgestore.coverImages.delete({
          url: url,
        });
      } catch (error) {
        console.error('Failed to delete from edgestore:', error);
      }
    }
    await updateDocument(pageId!, {
      coverImage: '',
      coverImagePosition: 0.5,
    });
  };

  const { onContextMenu } = useContextMenu({
    type: 'cover-image',
    data: {
      id: pageId,
      url,
      onReposition: () => {
        setIsRepositioning(true);
      },
      onChangeCover: () => {
        setCoverModalOpen(true);
      },
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    setStartPos(coverPosition);

    const handleMouseMove = (mm: MouseEvent) => {
      const calculatedWithClosure = Math.max(
        0,
        Math.min(1, startPos - (mm.clientY - e.clientY) / 500)
      );
      setCoverPosition(calculatedWithClosure);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const onSavePosition = async () => {
    setIsRepositioning(false);
    await updateDocument(pageId!, {
      coverImagePosition: coverPosition,
    });
  };

  const onCancelPosition = () => {
    setIsRepositioning(false);
    setCoverPosition(position);
  };

  if (!url) {
    return null;
  }

  return (
    <>
      <div
        onContextMenu={onContextMenu}
        className={cn(
          'relative w-full h-[35vh] group',
          !url && 'h-[12vh]',
          url && 'bg-muted',
          isRepositioning && 'cursor-move'
        )}
        onMouseDown={handleMouseDown}
      >
        {!!url && (
          <Image
            src={url}
            fill
            alt="Cover"
            className="object-cover transition-all duration-0"
            style={{
              objectPosition: `center ${coverPosition * 100}%`,
            }}
            priority
          />
        )}

        {url && !preview && !isRepositioning && (
          <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
            <button
              onClick={() => {
                setCoverModalOpen(true);
              }}
              className="text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 cursor-pointer text-muted-foreground flex items-center shadow-sm"
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Change
            </button>

            <button
              onClick={() => {
                setIsRepositioning(true);
              }}
              className="text-muted-foreground text-xs bg-white dark:bg-neutral-800 rounded-md px-3 py-1 hover:opacity-75 flex items-center shadow-sm"
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Reposition
            </button>

            <button
              onClick={onRemove}
              className="text-muted-foreground text-xs bg-white dark:bg-neutral-800 rounded-md px-2 py-1 hover:opacity-75 flex items-center shadow-sm"
              title="Remove cover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isRepositioning && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
              Drag image to reposition
            </div>
            <div className="absolute bottom-5 right-5 flex items-center gap-x-2">
              <button
                onClick={onSavePosition}
                className="text-xs bg-blue-500 text-white rounded-md px-4 py-1.5 hover:bg-blue-600 font-medium shadow-sm transition"
              >
                Save position
              </button>
              <button
                onClick={onCancelPosition}
                className="text-xs bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-md px-4 py-1.5 hover:bg-white/20 font-medium shadow-sm transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <CoverImageModal
        isOpen={coverModalOpen}
        onClose={() => {
          setCoverModalOpen(false);
        }}
      />
    </>
  );
};
