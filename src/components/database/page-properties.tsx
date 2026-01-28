'use client';

import {
  DatabaseRow,
  Property,
  Cell,
  PropertyType,
  Database,
} from '@prisma/client';
import { Edit2, Trash, ArrowUp, ArrowDown, Type } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

import { AddPropertyButton } from './add-property-button';
import { CellRenderer } from './cell-renderer';
import { PropertyConfigDialog } from './property-config-dialog';
import { PropertyTypeIcon, propertyTypeIcons } from './property-type-icon';

import {
  updateCellByPosition,
  updateProperty,
  deleteProperty,
  reorderProperties,
} from '@/app/(main)/_actions/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

interface PageProperties_ {
  row: DatabaseRow & {
    cells: Cell[];
    database: Database & { properties: Property[] };
  };
}

export function PageProperties({ row }: PageProperties_) {
  const [properties, setProperties] = useState(row.database.properties);
  const [cells, setCells] = useState(row.cells);

  useEffect(() => {
    setProperties(row.database.properties);
    setCells(row.cells);
  }, [row]);

  const [configDialog, setConfigDialog] = useState<{
    propertyId: string;
    type: 'relation' | 'rollup' | 'formula' | 'select';
  } | null>(null);

  const handleUpdateCell = useCallback(
    async (
      propertyId: string,
      value:
        | string
        | number
        | boolean
        | { linkedRowIds: string[] }
        | null
        | undefined
        | (
            | string
            | {
                value?: string | number | boolean | null;
                name?: string;
                id?: string;
              }
          )[]
    ) => {
      setCells((previous) => {
        const index = previous.findIndex((c) => c.propertyId === propertyId);
        if (index !== -1) {
          const newCells = [...previous];
          newCells[index] = { ...newCells[index], value: value as any };
          return newCells;
        }
        return [
          ...previous,
          {
            id: 'temp',
            propertyId,
            rowId: row.id,
            value,
          } as Cell,
        ];
      });

      await updateCellByPosition(propertyId, row.id, value);
    },
    [row.id]
  );

  const handleDeleteProperty = async (propertyId: string) => {
    setProperties((previous) => previous.filter((p) => p.id !== propertyId));
    await deleteProperty(propertyId);
  };

  const handleUpdateProperty = async (
    propertyId: string,
    data: Partial<Property>
  ) => {
    setProperties((previous) =>
      previous.map((p) => (p.id === propertyId ? { ...p, ...data } : p))
    );
    await updateProperty(propertyId, data as any);
  };

  const moveProperty = async (index: number, direction: 'up' | 'down') => {
    const newHelper = [...properties];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newHelper.length) return;

    const temporary = newHelper[index];
    newHelper[index] = newHelper[targetIndex];
    newHelper[targetIndex] = temporary;

    setProperties(newHelper);

    await reorderProperties(
      row.databaseId,
      newHelper.map((p) => p.id)
    );
  };

  return (
    <div className="py-2 space-y-1 mb-6 border-b border-border/50 pb-4">
      {properties.map((property, index) => {
        const cell = cells.find((c) => c.propertyId === property.id);

        if (property.type === 'TITLE') return null;

        return (
          <div
            key={property.id}
            className="flex items-start group min-h-[34px]"
          >
            <div className="w-[160px] flex items-center pt-1.5 shrink-0">
              <PropertyMenu
                property={property}
                onUpdate={handleUpdateProperty}
                onDelete={() => handleDeleteProperty(property.id)}
                onEditConfig={(
                  type: 'relation' | 'rollup' | 'formula' | 'select'
                ) => {
                  setConfigDialog({ propertyId: property.id, type });
                }}
                onMoveUp={() => moveProperty(index, 'up')}
                onMoveDown={() => moveProperty(index, 'down')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <PagePropertyCell
                property={property}
                cell={cell}
                row={row}
                onUpdate={handleUpdateCell}
                onPropertyUpdate={handleUpdateProperty}
              />
            </div>
          </div>
        );
      })}

      {}
      <div className="flex items-start pt-1.5">
        <div className="w-[160px]">
          <AddPropertyButton databaseId={row.databaseId} />
        </div>
      </div>

      <PropertyConfigDialog
        databaseId={row.databaseId}
        isOpen={!!configDialog}
        onOpenChange={(open) => !open && setConfigDialog(null)}
        configType={configDialog?.type || null}
        property={
          configDialog
            ? properties.find((p) => p.id === configDialog.propertyId)
            : undefined
        }
        allProperties={properties}
        onPropertyUpdate={(id, data) => handleUpdateProperty(id, data)}
      />
    </div>
  );
}

interface PropertyMenuProperties {
  property: Property;
  onUpdate: (propertyId: string, data: Partial<Property>) => void;
  onDelete: () => void;
  onEditConfig: (type: 'relation' | 'rollup' | 'formula' | 'select') => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function PropertyMenu({
  property,
  onUpdate,
  onDelete,
  onEditConfig,
  onMoveUp,
  onMoveDown,
}: PropertyMenuProperties) {
  const [temporaryName, setTemporaryName] = useState(property.name);

  const handleRename = () => {
    if (temporaryName !== property.name) {
      onUpdate(property.id, { name: temporaryName });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 rounded px-2 py-1 cursor-pointer select-none transition-colors w-full mr-2">
          <PropertyTypeIcon type={property.type} className="h-4 w-4" />
          <span className="truncate">{property.name}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="p-2">
          <input
            className="text-sm w-full border rounded px-1 py-0.5 bg-background"
            value={temporaryName}
            onChange={(e) => {
              setTemporaryName(e.target.value);
            }}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Type className="mr-2 h-3 w-3" /> Type
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={property.type}
              onValueChange={(value) =>
                onUpdate(property.id, { type: value as PropertyType })
              }
            >
              {Object.keys(propertyTypeIcons).map((key) => {
                const type = key as PropertyType;
                const Icon = propertyTypeIcons[type];
                return (
                  <DropdownMenuRadioItem key={type} value={type}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="capitalize">
                      {type.toLowerCase().replace('_', ' ')}
                    </span>
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {(property.type === 'SELECT' || property.type === 'MULTI_SELECT') && (
          <DropdownMenuItem onClick={() => onEditConfig('select')}>
            <Edit2 className="mr-2 h-3 w-3" /> Edit Options
          </DropdownMenuItem>
        )}

        {property.type === 'RELATION' && (
          <DropdownMenuItem onClick={() => onEditConfig('relation')}>
            <Edit2 className="mr-2 h-3 w-3" /> Edit Relation
          </DropdownMenuItem>
        )}

        {property.type === 'ROLLUP' && (
          <DropdownMenuItem onClick={() => onEditConfig('rollup')}>
            <Edit2 className="mr-2 h-3 w-3" /> Configure Rollup
          </DropdownMenuItem>
        )}

        {property.type === 'FORMULA' && (
          <DropdownMenuItem onClick={() => onEditConfig('formula')}>
            <Edit2 className="mr-2 h-3 w-3" /> Edit Formula
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMoveUp}>
          <ArrowUp className="mr-2 h-3 w-3" /> Move Up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveDown}>
          <ArrowDown className="mr-2 h-3 w-3" /> Move Down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash className="mr-2 h-3 w-3" /> Delete Property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PagePropertyCellProperties {
  property: Property;
  cell: Cell | undefined;
  row: DatabaseRow & {
    cells: Cell[];
    database: Database & { properties: Property[] };
  };
  onUpdate: (
    propertyId: string,
    value:
      | string
      | number
      | boolean
      | { linkedRowIds: string[] }
      | null
      | undefined
      | (
          | string
          | {
              value?: string | number | boolean | null;
              name?: string;
              id?: string;
            }
        )[]
  ) => void;
  onPropertyUpdate: (propertyId: string, data: Partial<Property>) => void;
}

function PagePropertyCell({
  property,
  cell,
  row,
  onUpdate,
  onPropertyUpdate,
}: PagePropertyCellProperties) {
  const [isEditing, setIsEditing] = useState(false);

  const mockColumn = {
    columnDef: {
      meta: {
        property,
      },
    },
  } as any;

  const mockTable = {} as any;

  return (
    <div className="px-2 py-1 -ml-2 rounded hover:bg-muted/50 transition-colors min-h-[28px]">
      <CellRenderer
        getValue={() => cell?.value}
        rowId={row.id}
        propertyId={property.id}
        table={mockTable}
        column={mockColumn}
        cell={(cell || {}) as any}
        isEditing={isEditing}
        startEditing={() => {
          setIsEditing(true);
        }}
        stopEditing={() => {
          setIsEditing(false);
        }}
        updateValue={(value) => onUpdate(property.id, value as any)}
        row={row as any}
        onPropertyUpdate={onPropertyUpdate}
      />
    </div>
  );
}
