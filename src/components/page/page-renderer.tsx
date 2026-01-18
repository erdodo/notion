"use client"

import { Page, DatabaseRow, Cell, Database, Property } from "@prisma/client"
import { DocumentHeader } from "@/components/editor/document-header"
import { PageProperties } from "@/components/database/page-properties"
import DocumentEditor from "@/components/editor/document-editor"

interface PageRendererProps {
    page: Page
    row?: DatabaseRow & { cells: Cell[]; database: Database & { properties: Property[] } }
    isPreview?: boolean
}

export function PageRenderer({ page, row, isPreview }: PageRendererProps) {
    return (
        <div className="flex flex-col h-full bg-background relative group">
            <DocumentHeader page={page} preview={isPreview} />

            {row && (
                <div className="px-12 md:max-w-3xl md:mx-auto lg:max-w-4xl">
                    <PageProperties row={row} />
                </div>
            )}

            <div className="pb-40">
                <DocumentEditor
                    documentId={page.id}
                    initialContent={page.content}
                    editable={!isPreview && !page.isArchived}
                />
            </div>
        </div>
    )
}
