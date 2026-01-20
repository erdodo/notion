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
        <div className={`flex flex-col h-full bg-background relative group ${page.fontStyle === 'mono' ? 'font-mono' : page.fontStyle === 'serif' ? 'font-serif' : 'font-sans'}`}>
            <DocumentHeader page={page} preview={isPreview} />

            {row && (
                <div className={`${page.isFullWidth ? 'px-4 w-full' : 'px-12 md:w-[50vw] md:mx-auto lg:w-[60vw]'} `}>
                    <PageProperties row={row} />
                </div>
            )}

            <div className={`pb-40 ${page.isFullWidth ? 'px-4 w-full' : 'px-12 md:w-[50vw] md:mx-auto lg:w-[60vw]'} ${page.isSmallText ? 'text-sm' : ''}`}>
                <DocumentEditor
                    documentId={page.id}
                    initialContent={page.content}
                    editable={!isPreview && !page.isArchived && !page.isLocked}
                />
            </div>
        </div>
    )
}
