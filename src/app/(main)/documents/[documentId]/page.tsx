import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { getPageById } from "@/actions/page"
import { DocumentHeader } from "@/components/editor/document-header"
import { DocumentEditor } from "@/components/editor/document-editor"

interface DocumentPageProps {
  params: {
    documentId: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { userId } = auth()

  if (!userId) {
    redirect("/")
  }

  const page = await getPageById(params.documentId)

  if (!page) {
    redirect("/documents")
  }

  return (
    <div className="h-full">
      <DocumentHeader page={page} />
      <DocumentEditor page={page} />
    </div>
  )
}
