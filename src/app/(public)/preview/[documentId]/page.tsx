import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getPublicDatabase } from '@/app/(main)/_actions/database';
import {
  getPublicDocument,
  getDocument,
} from '@/app/(main)/_actions/documents';
import { Cover } from '@/components/cover';
import { DatabaseView } from '@/components/database/database-view';
import DocumentEditor from '@/components/editor/document-editor';
import { auth } from '@/lib/auth';

interface PreviewPageProperties {
  params: Promise<{
    documentId: string;
  }>;
}

interface BlockNoteBlock {
  type?: string;
  content?: {
    type?: string;
    text?: string;
  }[];
}

function extractDescription(content: string | null): string {
  if (!content) return 'Shared document';

  const HTML_TAG_REGEX = /<[^>]*>/g;
  const MAX_DESCRIPTION_LENGTH = 155;

  try {
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      const blocks = parsed as BlockNoteBlock[];

      const text = blocks
        .slice(0, 3)
        .map((block) => {
          if (block.content && Array.isArray(block.content)) {
            return block.content.map((item) => item.text || '').join(' ');
          }
          return '';
        })
        .filter(Boolean)
        .join(' ')
        .trim();

      return (
        text.slice(0, Math.max(0, MAX_DESCRIPTION_LENGTH)) || 'Shared document'
      );
    }
  } catch {
    const plainText = content.replaceAll(HTML_TAG_REGEX, '').trim();
    return (
      plainText.slice(0, Math.max(0, MAX_DESCRIPTION_LENGTH)) ||
      'Shared document'
    );
  }

  return 'Shared document';
}

export async function generateMetadata({
  params,
}: PreviewPageProperties): Promise<Metadata> {
  const { documentId } = await params;
  const document = await getPublicDocument(documentId);

  if (!document) {
    return {
      title: 'Not Found',
    };
  }

  const description = extractDescription(document.content);
  const title = document.title || 'Untitled';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: document.coverImage ? [document.coverImage] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: document.coverImage ? [document.coverImage] : [],
    },
  };
}

export default async function PreviewPage({ params }: PreviewPageProperties) {
  const { documentId } = await params;
  const session = await auth();

  let document = await getPublicDocument(documentId);

  if (!document && session?.user) {
    document = await getDocument(documentId);
  }

  if (!document) {
    return redirect('/');
  }

  let database = null;
  if (document.isDatabase) {
    database = await getPublicDatabase(documentId);
  }

  return (
    <div
      className={`pb-40 bg-background ${document.fontStyle === 'mono' ? 'font-mono' : document.fontStyle === 'serif' ? 'font-serif' : 'font-sans'}`}
    >
      <Cover url={document.coverImage || undefined} preview />
      <div
        className={`mx-auto ${document.isFullWidth ? 'px-4 w-full' : 'md:w-3xl lg:w-4xl'}`}
      >
        <div
          className={`pl-[54px] pt-6 ${document.isSmallText ? 'text-sm' : ''}`}
        >
          <div className="flex items-center gap-x-2 text-6xl">
            {document.icon && <span>{document.icon}</span>}
            <h1 className="font-bold break-words">{document.title}</h1>
          </div>
        </div>

        {database ? (
          <div className="mt-4">
            <DatabaseView database={database} />
          </div>
        ) : (
          <div className={document.isSmallText ? 'text-sm' : ''}>
            <DocumentEditor
              documentId={document.id}
              initialContent={document.content}
              editable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
