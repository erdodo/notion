"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { aggregationOptions, RollupConfig as IRollupConfig, AggregationType } from "@/lib/rollup-service"
import { Property } from "@prisma/client"
import { getDatabase } from "@/app/(main)/_actions/database"

interface RollupConfigProps {
    config: IRollupConfig | null
    properties: Property[]  // Mevcut database'in property'leri
    onChange: (config: IRollupConfig) => void
    onCancel?: () => void
}

export function RollupConfig({ config, properties, onChange, onCancel }: RollupConfigProps) {
    const [relationPropertyId, setRelationPropertyId] = useState(config?.relationPropertyId || '')
    const [targetPropertyId, setTargetPropertyId] = useState(config?.targetPropertyId || '')
    const [aggregation, setAggregation] = useState<AggregationType>(config?.aggregation || 'count')

    const [targetProperties, setTargetProperties] = useState<Property[]>([])

    // Sadece RELATION tipi property'leri göster
    const relationProperties = properties.filter(p => p.type === 'RELATION')

    // Relation seçilince target database'in property'lerini yükle
    const handleRelationChange = async (propertyId: string) => {
        setRelationPropertyId(propertyId)

        const relationProp = properties.find(p => p.id === propertyId)
        // @ts-ignore
        if (relationProp?.relationConfig?.targetDatabaseId) {
            // @ts-ignore
            const targetDb = await getDatabase(relationProp.relationConfig.targetDatabaseId)
            if (targetDb) {
                setTargetProperties(targetDb.properties)
            }
        }
    }

    const handleSave = () => {
        onChange({
            relationPropertyId,
            targetPropertyId,
            aggregation
        })
    }

    return (
        <div className="space-y-4 p-4">
            {/* Relation Property */}
            <div className="space-y-2">
                <Label>Relation</Label>
                <Select value={relationPropertyId} onValueChange={handleRelationChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a relation" />
                    </SelectTrigger>
                    <SelectContent>
                        {relationProperties.map(prop => (
                            <SelectItem key={prop.id} value={prop.id}>
                                {prop.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {relationProperties.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Add a Relation property first
                    </p>
                )}
            </div>

            {/* Target Property */}
            {relationPropertyId && (
                <div className="space-y-2">
                    <Label>Property</Label>
                    <Select value={targetPropertyId} onValueChange={setTargetPropertyId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select property to rollup" />
                        </SelectTrigger>
                        <SelectContent>
                            {targetProperties.map(prop => (
                                <SelectItem key={prop.id} value={prop.id}>
                                    {prop.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Aggregation */}
            {targetPropertyId && (
                <div className="space-y-2">
                    <Label>Calculate</Label>
                    <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {aggregationOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex gap-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} className="flex-1">
                        Cancel
                    </Button>
                )}
                <Button onClick={handleSave} className="flex-1" disabled={!targetPropertyId}>
                    Done
                </Button>
            </div>
        </div>
    )
}
