"use client"

import { Property } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RelationConfig } from "@/components/database/config/relation-config"
import { FormulaEditor } from "@/components/database/config/formula-editor"
import { RollupConfig } from "@/components/database/config/rollup-config"
import { SelectConfig } from "@/components/database/config/select-config"
import { updateProperty } from "@/app/(main)/_actions/database"

interface PropertyConfigDialogProps {
    databaseId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    configType: 'relation' | 'rollup' | 'formula' | 'select' | null
    property: Property | undefined
    allProperties: Property[]
    onPropertyUpdate?: (propertyId: string, data: any) => void
}

export function PropertyConfigDialog({
    databaseId,
    isOpen,
    onOpenChange,
    configType,
    property,
    allProperties,
    onPropertyUpdate
}: PropertyConfigDialogProps) {
    if (!property) return null

    const handleUpdateConfig = async (config: any) => {
        await updateProperty(property.id, {
            // @ts-ignore
            relationConfig: config
        })
        onOpenChange(false)
    }

    const handleUpdateRollupConfig = async (config: any) => {
        await updateProperty(property.id, {
            rollupConfig: config
        })
        onOpenChange(false)
    }

    const handleUpdateFormulaConfig = async (expression: string, resultType?: string) => {
        const formulaConfig = {
            expression,
            resultType: resultType || 'string'
        }

        onPropertyUpdate?.(property.id, { formulaConfig })
        await updateProperty(property.id, { formulaConfig })
        onOpenChange(false)
    }

    const handleUpdateOptions = async (options: any[]) => {
        onPropertyUpdate?.(property.id, { options })
        await updateProperty(property.id, { options })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {configType === 'relation' && 'Edit Relation'}
                        {configType === 'rollup' && 'Configure Rollup'}
                        {configType === 'formula' && 'Edit Formula'}
                        {configType === 'select' && 'Edit Options'}
                    </DialogTitle>
                </DialogHeader>
                {configType === 'select' && (
                    <SelectConfig
                        // @ts-ignore
                        options={property.options || []}
                        onChange={handleUpdateOptions}
                    />
                )}
                {configType === 'relation' && (
                    <RelationConfig
                        config={property.relationConfig as any}
                        currentDatabaseId={databaseId}
                        onChange={handleUpdateConfig}
                    />
                )}
                {configType === 'rollup' && (
                    <RollupConfig
                        config={property.rollupConfig as any}
                        properties={allProperties}
                        onChange={handleUpdateRollupConfig}
                        onCancel={() => onOpenChange(false)}
                    />
                )}

                {configType === 'formula' && (
                    <FormulaEditor
                        expression={(property.formulaConfig as any)?.expression || ''}
                        properties={allProperties}
                        onChange={(expr) => handleUpdateFormulaConfig(expr)}
                        onResultTypeChange={(type) => handleUpdateFormulaConfig((property.formulaConfig as any)?.expression || '', type)}
                        onCancel={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
