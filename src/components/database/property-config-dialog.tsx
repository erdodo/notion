'use client';

import { Property } from '@prisma/client';

import type { SelectOption } from './config/select-config';

import { updateProperty } from '@/app/(main)/_actions/database';
import { FormulaEditor } from '@/components/database/config/formula-editor';
import { RelationConfig } from '@/components/database/config/relation-config';
import { RollupConfig } from '@/components/database/config/rollup-config';
import { SelectConfig } from '@/components/database/config/select-config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RelationConfig as RelationConfigType } from '@/lib/relation-service';
import { RollupConfig as RollupConfigType } from '@/lib/rollup-service';

interface PropertyConfigDialogProperties {
  databaseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  configType: 'relation' | 'rollup' | 'formula' | 'select' | null;
  property: Property | undefined;
  allProperties: Property[];
  onPropertyUpdate?: (propertyId: string, data: Partial<Property>) => void;
}

export function PropertyConfigDialog({
  databaseId,
  isOpen,
  onOpenChange,
  configType,
  property,
  allProperties,
  onPropertyUpdate,
}: PropertyConfigDialogProperties) {
  if (!property) return null;

  const handleUpdateConfig = async (config: RelationConfigType) => {
    await updateProperty(property.id, {
      relationConfig: config as any,
    });
    onOpenChange(false);
  };

  const handleUpdateRollupConfig = async (config: RollupConfigType) => {
    await updateProperty(property.id, {
      rollupConfig: config as any,
    });
    onOpenChange(false);
  };

  const handleUpdateFormulaConfig = async (
    expression: string,
    resultType?: string
  ) => {
    const formulaConfig = {
      expression,
      resultType: resultType || 'string',
    };

    onPropertyUpdate?.(property.id, { formulaConfig });
    await updateProperty(property.id, { formulaConfig });
    onOpenChange(false);
  };

  const handleUpdateOptions = async (options: SelectOption[]) => {
    onPropertyUpdate?.(property.id, { options: options as any });
    await updateProperty(property.id, { options: options as any });
  };

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
            options={(property.options as any as SelectOption[]) || []}
            onChange={handleUpdateOptions}
          />
        )}
        {configType === 'relation' && (
          <RelationConfig
            config={property.relationConfig as any as RelationConfigType}
            currentDatabaseId={databaseId}
            onChange={handleUpdateConfig}
          />
        )}
        {configType === 'rollup' && (
          <RollupConfig
            config={property.rollupConfig as any as RollupConfigType}
            properties={allProperties}
            onChange={handleUpdateRollupConfig}
            onCancel={() => {
              onOpenChange(false);
            }}
          />
        )}

        {configType === 'formula' && (
          <FormulaEditor
            expression={
              ((property.formulaConfig as any)?.expression as string) || ''
            }
            properties={allProperties}
            onChange={(expr) => handleUpdateFormulaConfig(expr)}
            onResultTypeChange={(type) =>
              handleUpdateFormulaConfig(
                ((property.formulaConfig as any)?.expression as string) || '',
                type
              )
            }
            onCancel={() => {
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
