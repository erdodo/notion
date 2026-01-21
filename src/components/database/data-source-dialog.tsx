import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Database as DatabaseIcon, Plus, Link as LinkIcon } from "lucide-react"
import { Database } from "@prisma/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DataSourceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentDatabaseId: string
}

export function DataSourceDialog({ open, onOpenChange, currentDatabaseId }: DataSourceDialogProps) {
    const [databases, setDatabases] = useState<Database[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            fetchDatabases()
        }
    }, [open])

    const fetchDatabases = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/databases')
            const data = await response.json()
            setDatabases(data)
        } catch (error) {
            console.error('Failed to fetch databases:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectDatabase = (databaseId: string) => {
        // Navigate to the selected database
        router.push(`/documents/${databaseId}`)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage data sources</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Source */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Source</div>
                        {loading ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                        ) : (
                            <div className="space-y-1">
                                {databases.map((db: any) => (
                                    <button
                                        key={db.id}
                                        onClick={() => handleSelectDatabase(db.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors ${db.id === currentDatabaseId ? 'bg-secondary' : ''
                                            }`}
                                    >
                                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1 text-left">{db.title || 'Untitled'}</span>
                                        {db.id === currentDatabaseId && (
                                            <span className="text-xs text-muted-foreground">Current</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-sm"
                            onClick={() => {
                                // TODO: Implement add data source
                                onOpenChange(false)
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add data source
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-sm"
                            onClick={() => {
                                // TODO: Implement link existing data source
                                onOpenChange(false)
                            }}
                        >
                            <LinkIcon className="h-4 w-4" />
                            Link existing data source
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
