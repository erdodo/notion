import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDocument } from "@/app/(main)/_actions/documents"
import { DocumentHeader } from "@/components/editor/document-header"
import DocumentEditor from "@/components/editor/document-editor"
import { Banner } from "@/components/banner"

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

  return (
    <div className="h-full">
      {page.isArchived && (
        <Banner documentId={documentId} />
      )}
      <DocumentHeader page={page} />
      <DocumentEditor
        documentId={page.id}
        initialContent={page.content}
        editable={true}
      />
    </div>
  )
}
