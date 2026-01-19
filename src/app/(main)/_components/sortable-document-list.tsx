"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "./sortable-item"
import { getSidebarDocuments, createDocument } from "../_actions/documents"
import { reorderPages } from "@/app/(main)/_actions/navigation"
import { createPortal } from "react-dom"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemSkeleton } from "./item-skeleton"

interface Document {
    id: string
    title: string
    icon?: string | null
    parentId?: string | null
    _count: {
        children: number
    }
}

interface SortableDocumentListProps {
    documents?: Document[]
    parentId?: string | null
    level?: number
    data?: Document[] // Compatibility with DocumentList props
}

export function SortableDocumentList({
    documents: initialDocuments,
    parentId = null,
    level = 0,
    data
}: SortableDocumentListProps) {
    // Support both prop names for compatibility
    const docsToUse = initialDocuments || data || []

    const router = useRouter()
    const [documents, setDocuments] = useState(docsToUse)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)

    // Sync state with props
    useEffect(() => {
        setDocuments(docsToUse)
    }, [docsToUse])

    // Recursion states
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [children, setChildren] = useState<Record<string, Document[]>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const activeDocument = activeId
        ? documents.find(d => d.id === activeId)
        : null

    const onExpand = async (documentId: string) => {
        const isExpanded = expanded[documentId]

        if (!isExpanded) {
            setLoading(prev => ({ ...prev, [documentId]: true }))
            try {
                const docs = await getSidebarDocuments(documentId)
                setChildren(prev => ({ ...prev, [documentId]: docs }))
            } catch (error) {
                console.error("Error loading children:", error)
            } finally {
                setLoading(prev => ({ ...prev, [documentId]: false }))
            }
        }

        setExpanded(prev => ({ ...prev, [documentId]: !isExpanded }))
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id as string | null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveId(null)
        setOverId(null)

        if (!over || active.id === over.id) return

        const oldIndex = documents.findIndex(d => d.id === active.id)
        const newIndex = documents.findIndex(d => d.id === over.id)

        // Optimistic update
        const newDocuments = [...documents]
        const [movedItem] = newDocuments.splice(oldIndex, 1)
        newDocuments.splice(newIndex, 0, movedItem)
        setDocuments(newDocuments)

        // Server update
        try {
            await reorderPages(parentId, newDocuments.map(d => d.id))
        } catch (error) {
            // Rollback
            setDocuments(documents)
        }
    }

    if (!docsToUse || docsToUse.length === 0) {
        return (
            <div
                className={cn(
                    "text-sm text-muted-foreground/80 py-1",
                    level === 0 && "px-2"
                )}
                style={{
                    paddingLeft: level > 0 ? `${(level * 12) + 12 + 24}px` : undefined
                }}
            >
                <p className="flex items-center gap-x-2">
                    <FileText className="h-4 w-4" />
                    <span>No pages inside</span>
                </p>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={documents.map(d => d.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-0.5">
                    {documents.map(doc => {
                        const isExpanded = expanded[doc.id]
                        const childDocs = children[doc.id]
                        const isLoading = loading[doc.id]

                        return (
                            <SortableItem
                                key={doc.id}
                                document={doc}
                                level={level}
                                isOver={overId === doc.id}
                                onExpand={() => onExpand(doc.id)}
                                expanded={!!isExpanded}
                            >
                                {/* Recursion */}
                                {isLoading && (
                                    <div className="pl-4">
                                        <ItemSkeleton level={level + 1} />
                                    </div>
                                )}
                                {!isLoading && childDocs && (
                                    <SortableDocumentList
                                        documents={childDocs}
                                        parentId={doc.id}
                                        level={level + 1}
                                    />
                                )}
                            </SortableItem>
                        )
                    })}
                </div>
            </SortableContext>

            {/* Drag overlay - portal ile render (Only render at root or handle carefully)
          If we use recursion, multiple DragOverlays might be an issue. 
          But since we use separate DndContexts (so far implied), each handles its own overlay.
          Actually, nested DndContexts? Yes.
          Ideally we only want one Overlay visible.
       */}
            {createPortal(
                <DragOverlay>
                    {activeDocument && (
                        <div className="bg-background border rounded-md shadow-lg p-2 flex items-center gap-2 opacity-90 pl-4 w-60">
                            <span className="text-[18px]">{activeDocument.icon || <FileText className="h-[18px] w-[18px]" />}</span>
                            <span className="text-sm font-medium">{activeDocument.title || 'Untitled'}</span>
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
