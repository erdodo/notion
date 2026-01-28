'use client';

import {
  Database,
  Property,
  DatabaseRow,
  Cell,
  Page,
  ViewType,
  DatabaseView as DatabaseViewModelType,
} from '@prisma/client';
import { useEffect } from 'react';

import { BoardView } from './board-view';
import { CalendarView } from './calendar-view';
import { GalleryView } from './gallery-view';
import { ListView } from './list-view';
import { RowDetailDrawer } from './row-detail-drawer';
import { RowDetailModal } from './row-detail-modal';
import { TableView } from './table-view';
import { TimelineView } from './timeline-view';
import { DatabaseToolbar } from './toolbar/database-toolbar';

import { DocumentHeader } from '@/components/editor/document-header';
import { useDatabase } from '@/hooks/use-database';
import { useViewPersistence } from '@/hooks/use-view-persistence';

interface DatabaseViewProperties {
  database: Database & {
    properties: Property[];
    rows: (DatabaseRow & { cells: Cell[]; page: Page | null })[];
    views: DatabaseViewModelType[];
  };
  page?: Page;
  isLinked?: boolean;
}

export function DatabaseView({ database, page }: DatabaseViewProperties) {
  const {
    currentView,
    selectedRowId,
    setSelectedRowId,
    openMode,
    setFromView,
    currentViewId,
    setCurrentViewId,
  } = useDatabase();

  useViewPersistence(database.properties);

  const shouldInitializeView = database.views && database.views.length > 0 && !currentViewId;

  useEffect(() => {
    if (shouldInitializeView) {
      const defaultView =
        database.views.find((v) => v.isDefault) || database.views[0];
      setCurrentViewId(defaultView.id);
      setFromView(defaultView.type as any);
    }
  }, [database.views, currentViewId, setCurrentViewId, setFromView, shouldInitializeView]);

  if (!database) {
    return <div className="p-4 text-muted-foreground">Database not found</div>;
  }

  const rows = database.rows || [];
  const selectedRow = selectedRowId
    ? rows.find((r) => r.id === selectedRowId)
    : null;

  const renderView = () => {
    switch (currentView) {
      case ViewType.board: {
        return <BoardView database={database} />;
      }
      case ViewType.calendar: {
        return <CalendarView database={database} />;
      }
      case ViewType.gallery: {
        return <GalleryView database={database} />;
      }
      case ViewType.list: {
        return <ListView database={database} />;
      }
      case ViewType.timeline: {
        return <TimelineView database={database} />;
      }
      default: {
        return <TableView database={database} />;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {}
      {page && <DocumentHeader page={page} />}

      <DatabaseToolbar database={database} />

      <div className="flex-1 overflow-auto">{renderView()}</div>

      {selectedRow && openMode === 'center' && (
        <RowDetailModal
          row={selectedRow}
          database={database}
          isOpen={!!selectedRow}
          onClose={() => {
            setSelectedRowId(null);
          }}
        />
      )}

      {selectedRow && openMode === 'side' && (
        <RowDetailDrawer
          row={selectedRow}
          database={database}
          isOpen={!!selectedRow}
          onClose={() => {
            setSelectedRowId(null);
          }}
        />
      )}
    </div>
  );
}
