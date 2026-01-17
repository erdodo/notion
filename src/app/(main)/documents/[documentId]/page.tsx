import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getDocument } from "@/app/(main)/_actions/documents"
import { DocumentHeader } from "@/components/editor/document-header"
import { DocumentEditor } from "@/components/editor/document-editor"
import { Banner } from "@/components/banner"

export const dynamic = 'force-dynamic'

interface DocumentPageProps {
  params: {
    documentId: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const page = await getDocument(params.documentId)

  if (!page) {
    redirect("/documents")
  }

  return (
    <div className="h-full">
      {page.isArchived && (
        <Banner documentId={params.documentId} />
      )}
      <DocumentHeader page={page} />
      <DocumentEditor page={page} />
    </div>
  )
}
