"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Download,
    FileText,
    FileCode,
    FileImage,
    Table,
    Archive,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { exportToPDF } from "@/lib/pdf-export"

interface ExportMenuProps {
    pageId: string
    pageTitle: string
    isDatabase?: boolean
    databaseId?: string | null
}

export function ExportMenu({
    pageId,
    pageTitle,
    isDatabase,
    databaseId
}: ExportMenuProps) {
    const [exporting, setExporting] = useState<string | null>(null)

    const handleExport = async (format: string) => {
        setExporting(format)

        try {
            let url = ""
            let filename = ""

            switch (format) {
                case "markdown":
                    url = `/api/export/markdown?pageId=${pageId}`
                    filename = `${pageTitle}.md`
                    break
                case "html":
                    url = `/api/export/html?pageId=${pageId}`
                    filename = `${pageTitle}.html`
                    break
                case "pdf":
                    // PDF client-side generation
                    await exportToPDF(pageId, pageTitle)
                    toast.success("PDF exported successfully")
                    setExporting(null)
                    return
                case "csv":
                    if (!databaseId) {
                        toast.error("No database to export")
                        return
                    }
                    url = `/api/export/csv?databaseId=${databaseId}`
                    filename = `${pageTitle}.csv`
                    break
            }

            // Download file
            const response = await fetch(url)
            if (!response.ok) throw new Error("Export failed")

            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = downloadUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(downloadUrl)

            toast.success(`Exported as ${format.toUpperCase()}`)
        } catch (error) {
            console.error("Export error:", error)
            toast.error("Export failed")
        } finally {
            setExporting(null)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <Download className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("markdown")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("html")}>
                    <FileCode className="h-4 w-4 mr-2" />
                    HTML (.html)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileImage className="h-4 w-4 mr-2" />
                    PDF (.pdf)
                </DropdownMenuItem>

                {isDatabase && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleExport("csv")}>
                            <Table className="h-4 w-4 mr-2" />
                            CSV (.csv)
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
