'use client';

import { useEffect, useState } from 'react';

import { computeRollupValue } from '@/app/(main)/_actions/database';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRollupValue, AggregationType } from '@/lib/rollup-service';

interface RollupCellProperties {
  propertyId: string;
  rowId: string;
  config: {
    relationPropertyId: string;
    targetPropertyId: string;
    aggregation: AggregationType;
    dateFormat?: string;
  };
}

export function RollupCell({
  propertyId,
  rowId,
  config,
}: RollupCellProperties) {
  const [value, setValue] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const fetchValue = async () => {
      try {
        const result = await computeRollupValue(rowId, propertyId);
        setValue(result);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchValue();
  }, [rowId, propertyId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <Skeleton className="h-5 w-16" />;
  }

  const formattedValue = formatRollupValue(
    value,
    config.aggregation,
    config.dateFormat
  );

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1 px-2">
        {value.slice(0, 5).map((v, index) => {
          let content = String(v);
          if (config.dateFormat) {
            const d = new Date(v);
            if (!isNaN(d.getTime())) {
              switch (config.dateFormat) {
                case 'relative': {
                  const diff = (now - d.getTime()) / (1000 * 3600 * 24);
                  if (Math.abs(diff) < 1) content = 'Today';
                  else if (Math.abs(diff) < 2)
                    content = diff > 0 ? 'Yesterday' : 'Tomorrow';
                  else content = d.toLocaleDateString();

                  break;
                }
                case 'US': {
                  content = d.toLocaleDateString('en-US');
                  break;
                }
                case 'ISO': {
                  content = d.toISOString().split('T')[0];
                  break;
                }
                default: {
                  content = d.toLocaleDateString();
                }
              }
            }
          }

          return (
            <span
              key={index}
              className="bg-muted px-1.5 py-0.5 rounded text-xs"
            >
              {content}
            </span>
          );
        })}
        {value.length > 5 && (
          <span className="text-muted-foreground text-xs">
            +{value.length - 5} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="px-2 py-1 text-sm text-muted-foreground">
      {formattedValue}
    </div>
  );
}
