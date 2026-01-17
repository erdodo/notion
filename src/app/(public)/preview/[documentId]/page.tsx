import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { getPublicDocument } from "@/app/(main)/_actions/documents"
import { Cover } from "@/components/cover"
import DocumentEditor from "@/components/editor/document-editor"

interface PreviewPageProps {
  params: {
    documentId: string
  }
}

export async function generateMetadata({
  params
}: PreviewPageProps): Promise<Metadata> {
  const document = await getPublicDocument(params.documentId)

  if (!document) {
    return {
      title: "Not Found",
    }
  }

  return {
    title: document.title || "Untitled",
    description: "Shared document",
    openGraph: {
      title: document.title || "Untitled",
      description: "Shared document",
      images: document.coverImage ? [document.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: document.title || "Untitled",
      description: "Shared document",
      images: document.coverImage ? [document.coverImage] : [],
    },
  }
}

export default async function PreviewPage({
  params
}: PreviewPageProps) {
  const document = await getPublicDocument(params.documentId)

  if (!document) {
    return redirect("/")
  }

  if (!document.isPublished) {
    return redirect("/")
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage || undefined} preview />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="pl-[54px] pt-6">
          <div className="flex items-center gap-x-2 text-6xl">
            {document.icon && (
              <span>{document.icon}</span>
            )}
            <h1 className="font-bold break-words">
              {document.title}
            </h1>
          </div>
        </div>
        <DocumentEditor 
          documentId={document.id}
          initialContent={document.content}
          editable={false}
        />
      </div>
    </div>
  )
}
