'use client';

import { Database } from '@prisma/client';
import { useState, useEffect } from 'react';

import { getAllDatabases } from '@/app/(main)/_actions/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RelationConfig as IRelationConfig } from '@/lib/relation-service';

interface RelationConfigProperties {
  config: IRelationConfig | null;
  currentDatabaseId: string;
  onChange: (config: IRelationConfig) => void;
}

export function RelationConfig({
  config,
  currentDatabaseId,
  onChange,
}: RelationConfigProperties) {
  const [databases, setDatabases] = useState<Database[]>([]);

  const [targetDatabaseId, setTargetDatabaseId] = useState(
    config?.targetDatabaseId || ''
  );
  const [bidirectional, setBidirectional] = useState(
    config?.bidirectional || false
  );
  const [limitType, setLimitType] = useState<'none' | 'one'>(
    config?.limitType || 'none'
  );

  useEffect(() => {
    getAllDatabases().then((dbs) => {
      setDatabases(dbs.filter((d) => d.id !== currentDatabaseId));
    });
  }, [currentDatabaseId]);

  const handleSave = () => {
    onChange({
      targetDatabaseId,
      bidirectional,
      reversePropertyId: config?.reversePropertyId,
      limitType,
    });
  };

  return (
    <div className="space-y-4 p-4">
      {}
      <div className="space-y-2">
        <Label>Related database</Label>
        <Select value={targetDatabaseId} onValueChange={setTargetDatabaseId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a database" />
          </SelectTrigger>
          <SelectContent>
            {databases.map((database) => (
              <SelectItem key={database.id} value={database.id}>
                {}
                {database.page?.icon} {database.page?.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="space-y-2">
        <Label>Limit</Label>
        <Select
          value={limitType}
          onValueChange={(v) => {
            setLimitType(v as 'none' | 'one');
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No limit (multiple)</SelectItem>
            <SelectItem value="one">1 page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="flex items-center justify-between">
        <div>
          <Label>Show on related database</Label>
          <p className="text-xs text-muted-foreground">
            Create a relation property on the related database
          </p>
        </div>
        <Switch checked={bidirectional} onCheckedChange={setBidirectional} />
      </div>

      <Button
        onClick={handleSave}
        className="w-full"
        disabled={!targetDatabaseId}
      >
        Done
      </Button>
    </div>
  );
}
