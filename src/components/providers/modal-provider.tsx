'use client';

import { useSyncExternalStore } from 'react';

import { HistoryModal } from '@/components/modals/history-modal';
import { MovePageModal } from '@/components/modals/move-page-modal';
import { RenameModal } from '@/components/modals/rename-modal';
import { SettingsModal } from '@/components/modals/settings-modal';
import { TemplateModal } from '@/components/modals/template-modal';
import { SearchCommand } from '@/components/search-command';

// Client-side only check için useSyncExternalStore kullanıyoruz
// Bu, hydration mismatch'i önler ve performanslıdır
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export const ModalProvider = () => {
  const isMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SearchCommand />
      <SettingsModal />
      <MovePageModal />
      <RenameModal />
      <HistoryModal />
      <TemplateModal />
    </>
  );
};
