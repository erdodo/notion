import { redirect } from 'next/navigation';

import { getDatabase, getRowDetails } from '@/app/(main)/_actions/database';
import { getDocument } from '@/app/(main)/_actions/documents';
import { recordPageView } from '@/app/(main)/_actions/navigation';
import { BacklinksPanel } from '@/components/backlinks-panel';
import { Banner } from '@/components/banner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DatabaseView } from '@/components/database/database-view';
import { DocumentNavbarActions } from '@/components/document-navbar-actions';
import { ExportMenu } from '@/components/export-menu';
import { FavoriteButton } from '@/components/favorite-button';
import { PageRenderer } from '@/components/page/page-renderer';
import { PageMenu } from '@/components/page-menu';
import { PresenceIndicators } from '@/components/presence-indicators';
import { CollaborationProvider } from '@/components/providers/collaboration-provider';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface DocumentPageProperties {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProperties) {
  const { documentId } = await params;
  const session = await auth();

  if (!session?.user && process.env.TEST_MODE !== 'true') {
    redirect('/sign-in');
  }

  const page = await getDocument(documentId);

  if (!page) {
    redirect('/documents');
  }

  const database = page.isDatabase ? await getDatabase(page.id) : null;
  const row = page.databaseRow
    ? await getRowDetails(page.databaseRow.id)
    : undefined;

  if (session?.user) {
    recordPageView(documentId);
  }

  return (
    <CollaborationProvider documentId={documentId} key={documentId}>
      <div className="h-full flex flex-col">
        {}
        <nav className="flex items-center justify-between px-3 py-2 w-full border-b bg-background z-50">
          <Breadcrumbs pageId={page.id} />
          <div className="flex items-center gap-2">
            <PresenceIndicators />
            <DocumentNavbarActions
              pageId={page.id}
              pageTitle={page.title}
              isPublished={page.isPublished}
            />

            <ExportMenu
              pageId={page.id}
              pageTitle={page.title}
              isDatabase={page.isDatabase}
              databaseId={database?.id}
            />
            {!page.isArchived && <FavoriteButton pageId={page.id} />}
            <PageMenu
              documentId={page.id}
              document={page}
            />
          </div>
        </nav>

        {page.isArchived && <Banner documentId={documentId} />}

        {page.isDatabase && database ? (
          <DatabaseView database={database} page={page} />
        ) : (
          <PageRenderer page={page} row={row} />
        )}

        <div className="pb-40">
          <BacklinksPanel pageId={page.id} />
        </div>
      </div>
    </CollaborationProvider>
  );
}
