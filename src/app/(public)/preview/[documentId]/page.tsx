import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { getPublicDocument, getDocument } from "@/app/(main)/_actions/documents"
import { getPublicDatabase } from "@/app/(main)/_actions/database"
import { auth } from "@/lib/auth"
import { Cover } from "@/components/cover"
import { DatabaseView } from "@/components/database/database-view"
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
  const session = await auth()

  // 1. Try public access first
  let document = await getPublicDocument(documentId)

  // 2. If not public, check if user is authorized (owner/shared) using getDocument
  if (!document && session?.user) {
    document = await getDocument(documentId)
  }

  if (!document) {
    return redirect("/")
  }

  // Fetch Database if it is a database page
  let database = null;
  if (document.isDatabase) {
    database = await getPublicDatabase(documentId);
    // Fallback to internal getDatabase if public fails (e.g. owner viewing private db)
    if (!database && session?.user) {
      // Note: getPublicDatabase handles owner check too, but assumes standard include structure.
      // If it returned null, it means not published AND not owner.
    }
  }

  return (
    <div className={`pb-40 bg-background ${document.fontStyle === 'mono' ? 'font-mono' : document.fontStyle === 'serif' ? 'font-serif' : 'font-sans'}`}>
      <Cover url={document.coverImage || undefined} preview />
      <div className={`mx-auto ${document.isFullWidth ? 'px-4 w-full' : 'md:w-3xl lg:w-4xl'}`}>
        <div className={`pl-[54px] pt-6 ${document.isSmallText ? 'text-sm' : ''}`}>
          <div className="flex items-center gap-x-2 text-6xl">
            {document.icon && (
              <span>{document.icon}</span>
            )}
            <h1 className="font-bold break-words">
              {document.title}
            </h1>
          </div>
        </div>

        {database ? (
          <div className="mt-4">
            <DatabaseView database={database as any} />
          </div>
        ) : (
          <div className={`${document.isSmallText ? 'text-sm' : ''}`}>
            <DocumentEditor
              documentId={document.id}
              initialContent={document.content}
              editable={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
