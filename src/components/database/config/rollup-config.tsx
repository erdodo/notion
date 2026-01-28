'use client';

import { Property } from '@prisma/client';
import { useState } from 'react';

import { getDatabase } from '@/app/(main)/_actions/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  aggregationOptions,
  RollupConfig as IRollupConfig,
  AggregationType,
} from '@/lib/rollup-service';

interface RollupConfigProperties {
  config: IRollupConfig | null;
  properties: Property[];
  onChange: (config: IRollupConfig) => void;
  onCancel?: () => void;
}

export function RollupConfig({
  config,
  properties,
  onChange,
  onCancel,
}: RollupConfigProperties) {
  const [relationPropertyId, setRelationPropertyId] = useState(
    config?.relationPropertyId || ''
  );
  const [targetPropertyId, setTargetPropertyId] = useState(
    config?.targetPropertyId || ''
  );
  const [aggregation, setAggregation] = useState<AggregationType>(
    config?.aggregation || 'count'
  );

  const [targetProperties, setTargetProperties] = useState<Property[]>([]);

  const relationProperties = properties.filter((p) => p.type === 'RELATION');

  const handleRelationChange = async (propertyId: string) => {
    setRelationPropertyId(propertyId);

    const relationProperty = properties.find((p) => p.id === propertyId);

    if (relationProperty && (relationProperty.relationConfig as any)?.targetDatabaseId) {
      const targetDatabase = await getDatabase(
        (relationProperty!.relationConfig as any).targetDatabaseId
      );
      if (targetDatabase) {
        setTargetProperties(targetDatabase.properties);
      }
    }
  };

  const handleSave = () => {
    onChange({
      relationPropertyId,
      targetPropertyId,
      aggregation,
    });
  };

  return (
    <div className="space-y-4 p-4">
      {}
      <div className="space-y-2">
        <Label>Relation</Label>
        <Select value={relationPropertyId} onValueChange={handleRelationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a relation" />
          </SelectTrigger>
          <SelectContent>
            {relationProperties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
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

      {}
      {relationPropertyId && (
        <div className="space-y-2">
          <Label>Property</Label>
          <Select value={targetPropertyId} onValueChange={setTargetPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select property to rollup" />
            </SelectTrigger>
            <SelectContent>
              {targetProperties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {}
      {targetPropertyId && (
        <div className="space-y-2">
          <Label>Calculate</Label>
          <Select
            value={aggregation}
            onValueChange={(v) => {
              setAggregation(v as AggregationType);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aggregationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {}
      {(aggregation === 'show_original' || aggregation === 'show_unique') && (
        <div className="space-y-2">
          <Label>Date Format (Optional)</Label>
          <Select
            value={config?.dateFormat || 'default'}
            onValueChange={(v) => {
              onChange({
                ...config!,
                dateFormat: v === 'default' ? undefined : v,
                aggregation,
                relationPropertyId,
                targetPropertyId,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="relative">Relative</SelectItem>
              <SelectItem value="US">US (MM/DD/YYYY)</SelectItem>
              <SelectItem value="ISO">ISO (YYYY-MM-DD)</SelectItem>
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
        <Button
          onClick={handleSave}
          className="flex-1"
          disabled={!targetPropertyId}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
