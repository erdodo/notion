import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDocument } from "@/app/(main)/_actions/documents"
import { DocumentHeader } from "@/components/editor/document-header"
import DocumentEditor from "@/components/editor/document-editor"
import { Banner } from "@/components/banner"
import { getDatabase } from "@/app/(main)/_actions/database"
import { DatabaseView } from "@/components/database/database-view"

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

  return (
    <div className="h-full flex flex-col">
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
    </div>
  )
}
