import { PartialBlock } from '@blocknote/core';
import { useSyncExternalStore } from 'react';

import { schema } from '../editor/schema';

import { CoverImageMenu } from './menus/cover-image-menu';
import { DatabaseCellMenu } from './menus/database-cell-menu';
import { DatabaseRowMenu } from './menus/database-row-menu';
import { EditorBlockMenu } from './menus/editor-block-menu';
import { IconMenu } from './menus/icon-menu';
import { InterfaceElementMenu } from './menus/interface-element-menu';
import { SidebarPageMenu } from './menus/sidebar-page-menu';
import { TrashItemMenu } from './menus/trash-item-menu';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useContextMenuStore } from '@/store/use-context-menu-store';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

type SidebarPageMenuData = {
  id: string;
  title: string;
  icon?: string;
  parentId?: string;
};

type TrashItemMenuData = {
  id: string;
  title: string;
};

type EditorBlockMenuData = {
  editor: any;
  block: PartialBlock;
};

type IconMenuData = {
  id: string;
  onRemoveIcon?: () => void;
};

type CoverImageMenuData = {
  id: string;
  url?: string;
  onChangeCover?: () => void;
  onReposition?: () => void;
};

type InterfaceElementMenuData = {
  type: 'favorite' | 'breadcrumb';
  id?: string;
  url?: string;
};

type DatabaseCellMenuData = {
  rowId: string;
  pageId?: string;
  propertyId: string;
  value: unknown;
};

type DatabaseRowMenuData = {
  id: string;
};

export const GlobalContextMenu = () => {
  const { isOpen, position, type, closeContextMenu, data } =
    useContextMenuStore();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!mounted) return null;

  if (!isOpen) return null;

  const renderMenuContent = () => {
    switch (type) {
      case 'sidebar-page': {
        return <SidebarPageMenu data={data as SidebarPageMenuData} />;
      }
      case 'trash-item': {
        return <TrashItemMenu data={data as TrashItemMenuData} />;
      }
      case 'editor-block': {
        return <EditorBlockMenu data={data as EditorBlockMenuData} />;
      }
      case 'icon': {
        return <IconMenu data={data as IconMenuData} />;
      }
      case 'cover-image': {
        return <CoverImageMenu data={data as CoverImageMenuData} />;
      }
      case 'interface-element': {
        return <InterfaceElementMenu data={data as InterfaceElementMenuData} />;
      }
      case 'database-cell': {
        return <DatabaseCellMenu data={data as DatabaseCellMenuData} />;
      }
      case 'database-row': {
        return <DatabaseRowMenu data={data as DatabaseRowMenuData} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => !open && closeContextMenu()}
    >
      <DropdownMenuTrigger
        className="fixed w-0 h-0 p-0 m-0 opacity-0 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
        }}
      />
      <DropdownMenuContent
        className="w-64"
        align="start"
        side="bottom"
        sideOffset={0}
        alignOffset={0}
      >
        {renderMenuContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
