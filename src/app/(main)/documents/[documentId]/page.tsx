import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDocument } from "@/app/(main)/_actions/documents"
import { DocumentHeader } from "@/components/editor/document-header"
import DocumentEditor from "@/components/editor/document-editor"
import { Banner } from "@/components/banner"
import { getDatabase } from "@/app/(main)/_actions/database"
import { DatabaseView } from "@/components/database/database-view"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BacklinksPanel } from "@/components/backlinks-panel"
import { FavoriteButton } from "@/components/favorite-button"
import { DocumentNavbarActions } from "@/components/document-navbar-actions"
import { ExportMenu } from "@/components/export-menu"
import { recordPageView } from "@/app/(main)/_actions/navigation"

export const dynamic = 'force-dynamic'

interface DocumentPageProps {
  params: Promise<{
    documentId: string
  }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { documentId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const page = await getDocument(documentId)

  if (!page) {
    redirect("/documents")
  }

  const database = page.isDatabase ? await getDatabase(page.id) : null

  // Record view
  if (session?.user) {
    recordPageView(documentId)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-3 py-2 w-full border-b bg-background z-50">
        <Breadcrumbs pageId={page.id} />
        <div className="flex items-center gap-2">
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
          {!page.isArchived && (
            <FavoriteButton pageId={page.id} />
          )}
        </div>
      </nav >

      <div className="flex-1 overflow-y-auto">
        {page.isArchived && (
          <Banner documentId={documentId} />
        )}
        <DocumentHeader page={page} />
        {page.isDatabase && database ? (
          <DatabaseView database={database as any} />
        ) : (
          <DocumentEditor
            documentId={page.id}
            initialContent={page.content}
            editable={true}
          />
        )}

        <div className="pb-40">
          <BacklinksPanel pageId={page.id} />
        </div>
      </div>
    </div >
  )
}
