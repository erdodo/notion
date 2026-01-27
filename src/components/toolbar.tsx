'use client';

import { ImageIcon, Smile, X, LayoutTemplate } from 'lucide-react';
import { useState } from 'react';

import { IconPicker } from './icon-picker';
import { CoverImageModal } from './modals/cover-image-modal';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { useContextMenu } from '@/hooks/use-context-menu';
import { useTemplateModal } from '@/hooks/use-template-modal';

interface Page {
  id: string;
  title: string;
  icon?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
}

interface ToolbarProperties {
  page: Page;
  preview?: boolean;
}

export const Toolbar = ({ page, preview }: ToolbarProperties) => {
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const templateModal = useTemplateModal();

  const { onContextMenu } = useContextMenu({
    type: 'icon',
    data: {
      id: page.id,
      icon: page.icon,
      onRemoveIcon: () => handleIconRemove(),
      onChangeIcon: () => {},
    },
  });

  const handleIconSelect = async (icon: string) => {
    globalThis.dispatchEvent(
      new CustomEvent('notion-document-update', {
        detail: { id: page.id, icon },
      })
    );
    await updateDocument(page.id, { icon });
  };

  const handleIconRemove = async () => {
    globalThis.dispatchEvent(
      new CustomEvent('notion-document-update', {
        detail: { id: page.id, icon: null },
      })
    );
    await updateDocument(page.id, { icon: '' });
  };

  return (
    <>
      <div className="group relative w-fit">
        {!!page.icon && !preview && (
          <div
            onContextMenu={onContextMenu}
            className={`flex items-center gap-x-2 group/icon pt-6 ${page.coverImage ? 'absolute -top-[1rem] left-0 z-10' : ''}`}
          >
            <IconPicker onChange={handleIconSelect}>
              <p className="text-6xl hover:opacity-75 transition">
                {page.icon}
              </p>
            </IconPicker>
            <button
              onClick={handleIconRemove}
              className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {!!page.icon && preview && (
          <p
            className={`text-6xl pt-6 ${page.coverImage ? 'absolute -top-[2.5rem] left-0 z-10' : ''}`}
          >
            {page.icon}
          </p>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4 ">
          {!page.icon && !preview && (
            <IconPicker asChild onChange={handleIconSelect}>
              <button className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md">
                <Smile className="h-4 w-4 mr-2 inline" />
                Add icon
              </button>
            </IconPicker>
          )}
          {!page.coverImage && !preview && (
            <button
              onClick={() => {
                setCoverModalOpen(true);
              }}
              className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md"
            >
              <ImageIcon className="h-4 w-4 mr-2 inline" />
              Add cover
            </button>
          )}

          {!preview && (
            <button
              onClick={templateModal.onOpen}
              className="text-muted-foreground text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-md"
            >
              <LayoutTemplate className="h-4 w-4 mr-2 inline" />
              Templates
            </button>
          )}
        </div>

        <CoverImageModal
          isOpen={coverModalOpen}
          onClose={() => {
            setCoverModalOpen(false);
          }}
        />
      </div>
    </>
  );
};
