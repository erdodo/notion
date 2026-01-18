"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, HelpCircle } from "lucide-react"
import { validateFormula, availableFunctions } from "@/lib/formula-engine"
import { Property } from "@prisma/client"

interface FormulaEditorProps {
    expression: string
    properties: Property[]
    onChange: (expression: string) => void
    onResultTypeChange: (type: string) => void
}

export function FormulaEditor({
    expression,
    properties,
    onChange,
    onResultTypeChange
}: FormulaEditorProps) {
    const [localExpression, setLocalExpression] = useState(expression)
    const [validation, setValidation] = useState<{ valid: boolean, error?: string }>({ valid: true })
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Validation
    useEffect(() => {
        const timer = setTimeout(() => {
            setValidation(validateFormula(localExpression))
        }, 300)
        return () => clearTimeout(timer)
    }, [localExpression])

    const insertAtCursor = (text: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newExpression =
            localExpression.slice(0, start) + text + localExpression.slice(end)

        setLocalExpression(newExpression)

        // Cursor'ı text'in sonuna taşı
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + text.length, start + text.length)
        }, 0)
    }

    const handleSave = () => {
        if (validation.valid) {
            onChange(localExpression)
        }
    }

    return (
        <div className="space-y-4">
            {/* Expression Editor */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Formula</label>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={localExpression}
                        onChange={(e) => setLocalExpression(e.target.value)}
                        placeholder="Enter formula... e.g. prop('Price') * prop('Quantity')"
                        className="w-full h-24 p-3 font-mono text-sm bg-muted rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    {/* Validation indicator */}
                    <div className="absolute bottom-2 right-2">
                        {validation.valid ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                <Check className="h-3 w-3 mr-1" />
                                Valid
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {validation.error}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Insert Helpers */}
            <Tabs defaultValue="properties" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                    <TabsTrigger value="functions" className="flex-1">Functions</TabsTrigger>
                </TabsList>

                <TabsContent value="properties">
                    <ScrollArea className="h-32">
                        <div className="flex flex-wrap gap-1 p-2">
                            {properties
                                .filter(p => p.type !== 'FORMULA' && p.type !== 'ROLLUP')
                                .map(prop => (
                                    <Button
                                        key={prop.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertAtCursor(`prop("${prop.name}")`)}
                                    >
                                        {prop.name}
                                    </Button>
                                ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="functions">
                    <ScrollArea className="h-32">
                        <div className="space-y-1 p-2">
                            {availableFunctions.map(fn => (
                                <button
                                    key={fn.name}
                                    onClick={() => insertAtCursor(fn.syntax)}
                                    className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                                >
                                    <div>
                                        <code className="text-sm font-medium">{fn.name}</code>
                                        <p className="text-xs text-muted-foreground">{fn.description}</p>
                                    </div>
                                    <code className="text-xs text-muted-foreground">{fn.syntax}</code>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Result Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Result type</label>
                <div className="flex gap-2">
                    {['string', 'number', 'boolean', 'date'].map(type => (
                        <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => onResultTypeChange(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Save */}
            <Button onClick={handleSave} disabled={!validation.valid} className="w-full">
                Save Formula
            </Button>
        </div>
    )
}
