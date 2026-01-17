import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { getPublicDocument } from "@/app/(main)/_actions/documents"
import { Cover } from "@/components/cover"
import DocumentEditor from "@/components/editor/document-editor"

interface PreviewPageProps {
  params: Promise<{
    documentId: string
  }>
}

// BlockNote block structure
interface BlockNoteBlock {
  type?: string
  content?: Array<{
    type?: string
    text?: string
  }>
}

// Helper function to extract text from content for description
function extractDescription(content: string | null): string {
  if (!content) return "Shared document"

  const HTML_TAG_REGEX = /<[^>]*>/g
  const MAX_DESCRIPTION_LENGTH = 155

  try {
    // Try to parse as JSON (BlockNote format)
    const parsed = JSON.parse(content)

    if (Array.isArray(parsed)) {
      const blocks = parsed as BlockNoteBlock[]

      // Extract text from first few blocks
      const text = blocks
        .slice(0, 3)
        .map((block) => {
          if (block.content && Array.isArray(block.content)) {
            return block.content
              .map((item) => item.text || "")
              .join(" ")
          }
          return ""
        })
        .filter(Boolean)
        .join(" ")
        .trim()

      // Return first 155 characters for meta description
      return text.substring(0, MAX_DESCRIPTION_LENGTH) || "Shared document"
    }
  } catch (error: unknown) {
    // If parsing fails, try to extract plain text
    const plainText = content.replace(HTML_TAG_REGEX, "").trim()
    return plainText.substring(0, MAX_DESCRIPTION_LENGTH) || "Shared document"
  }

  return "Shared document"
}

export async function generateMetadata({
  params
}: PreviewPageProps): Promise<Metadata> {
  const { documentId } = await params
  const document = await getPublicDocument(documentId)

  if (!document) {
    return {
      title: "Not Found",
    }
  }

  const description = extractDescription(document.content)
  const title = document.title || "Untitled"

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: document.coverImage ? [document.coverImage] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: document.coverImage ? [document.coverImage] : [],
    },
  }
}

export default async function PreviewPage({
  params
}: PreviewPageProps) {
  const { documentId } = await params
  const document = await getPublicDocument(documentId)

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
