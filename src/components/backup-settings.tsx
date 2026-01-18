"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Download,
    Upload,
    Archive,
    Loader2,
    Calendar
} from "lucide-react"
import { toast } from "sonner"
import { ImportModal } from "@/components/modals/import-modal"

export function BackupSettings() {
    const [format, setFormat] = useState("markdown")
    const [exporting, setExporting] = useState(false)
    const [showImport, setShowImport] = useState(false)

    const handleBackup = async () => {
        setExporting(true)

        try {
            const response = await fetch(`/api/export/backup?format=${format}`)

            if (!response.ok) throw new Error("Backup failed")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `notion-backup-${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success("Backup created successfully")
        } catch (error) {
            console.error("Backup error:", error)
            toast.error("Backup failed")
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Workspace Backup
                    </CardTitle>
                    <CardDescription>
                        Export or restore your entire workspace
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Export */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Export format</label>
                        <div className="flex gap-2">
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="html">HTML</SelectItem>
                                    <SelectItem value="json">JSON (Full)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleBackup} disabled={exporting}>
                                {exporting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export Backup
                            </Button>
                        </div>
                    </div>

                    {/* Import */}
                    <div className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowImport(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Restore from Backup
                        </Button>
                    </div>

                    {/* Last backup info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Calendar className="h-4 w-4" />
                        <span>Last backup: Never</span>
                    </div>
                </CardContent>
            </Card>

            <ImportModal
                isOpen={showImport}
                onClose={() => setShowImport(false)}
            />
        </>
    )
}
