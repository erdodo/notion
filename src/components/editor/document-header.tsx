import { useState, useEffect, useRef } from 'react';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { Cover } from '@/components/cover';
import { useSocket } from '@/components/providers/socket-provider';
import { Toolbar } from '@/components/toolbar';

interface DocumentHeaderProperties {
  page: {
    id: string;
    title: string;
    icon?: string | null;
    coverImage?: string | null;
    coverImagePosition?: number;
  };
  preview?: boolean;
}

export const DocumentHeader = ({ page, preview }: DocumentHeaderProperties) => {
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [coverImage, setCoverImage] = useState(page.coverImage);
  const [coverImagePosition, setCoverImagePosition] = useState(
    page.coverImagePosition
  );

  const { socket } = useSocket();

  const isEditingReference = useRef(false);
  const previousTitleReference = useRef(page.title);

  useEffect(() => {
    if (!socket) return;

    const onUpdate = (payload: {
      id?: string;
      updates?: Partial<DocumentHeaderProperties['page']>;
    }) => {
      if (payload?.id === page.id && payload?.updates) {
        const updates = payload.updates;
        if (updates.title !== undefined && !isEditingReference.current)
          setTitle(updates.title);
        if (updates.icon !== undefined) setIcon(updates.icon);
        if (updates.coverImage !== undefined) setCoverImage(updates.coverImage);
        if (updates.coverImagePosition !== undefined)
          setCoverImagePosition(updates.coverImagePosition);
      }
    };

    socket.on('doc:update', onUpdate);
    return () => {
      socket.off('doc:update', onUpdate);
    };
  }, [socket, page.id]);

  const debounceTimerReference = useRef<NodeJS.Timeout | null>(null);

  const saveTitle = async (newTitle: string) => {
    if (newTitle === previousTitleReference.current) return;
    previousTitleReference.current = newTitle;

    globalThis.dispatchEvent(
      new CustomEvent('notion-document-update', {
        detail: { id: page.id, title: newTitle },
      })
    );

    await updateDocument(page.id, { title: newTitle });
  };

  const handleInput = (value: string) => {
    setTitle(value);
    isEditingReference.current = true;

    if (debounceTimerReference.current) {
      clearTimeout(debounceTimerReference.current);
    }

    debounceTimerReference.current = setTimeout(() => {
      saveTitle(value);
      isEditingReference.current = false;
    }, 500);
  };

  const handleTitleBlur = () => {
    if (debounceTimerReference.current) {
      clearTimeout(debounceTimerReference.current);
      saveTitle(title);
      isEditingReference.current = false;
    }
  };

  const pageIdReference = useRef(page.id);

  useEffect(() => {
    if (pageIdReference.current !== page.id) {
      // Props değişikliğine tepki olarak state güncelliyoruz
      queueMicrotask(() => {
        setTitle(page.title);
        setIcon(page.icon);
        setCoverImage(page.coverImage);
        setCoverImagePosition(page.coverImagePosition);
        previousTitleReference.current = page.title;
        pageIdReference.current = page.id;
      });
    }
  }, [
    page.id,
    page.title,
    page.icon,
    page.coverImage,
    page.coverImagePosition,
  ]);

  const pageData = { ...page, title, icon, coverImage, coverImagePosition };

  return (
    <div className="pb-10 group/header relative">
      <Cover
        url={coverImage}
        pageId={page.id}
        preview={preview}
        position={coverImagePosition}
      />

      <div className="px-12 pt-12 md:max-w-3xl md:mx-auto lg:max-w-4xl">
        <div className={coverImage ? '-mt-24' : ''}>
          <Toolbar page={pageData} preview={preview} />
        </div>

        <div className="mt-8">
          <textarea
            value={title}
            onChange={(e) => {
              handleInput(e.target.value);
            }}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const editor = document.querySelector('.bn-editor')!;
                if (editor) {
                  editor.focus();
                }
              }
            }}
            className="text-5xl font-bold outline-none text-[#3F3F3F] dark:text-[#CFCFCF] bg-transparent w-full placeholder:text-muted-foreground/50 mt-4 resize-none h-auto overflow-hidden block"
            placeholder="Untitled"
            disabled={preview}
            rows={1}
            style={{ height: 'auto' }}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
