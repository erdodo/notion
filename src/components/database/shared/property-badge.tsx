'use client';

import { Property } from '@prisma/client';

import { PropertyValue } from './property-value';

import { PropertyTypeIcon } from '@/components/database/property-type-icon';

interface PropertyBadgeProperties {
  property: Property;
  value: unknown;
  showIcon?: boolean;
}

export function PropertyBadge({
  property,
  value,
  showIcon = true,
}: PropertyBadgeProperties) {
  if (
    (value === null || value === undefined || value === '') &&
    property.type !== 'CHECKBOX'
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {showIcon && (
        <PropertyTypeIcon type={property.type} className="h-3 w-3 shrink-0" />
      )}
      <span className="text-xs text-muted-foreground/70 w-20 shrink-0 truncate">
        {property.name}
      </span>
      <div className="flex-1 min-w-0 text-foreground text-xs">
        <PropertyValue property={property} value={value as any} />
      </div>
    </div>
  );
}
