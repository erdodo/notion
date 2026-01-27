'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { computeFormulaValue } from '@/app/(main)/_actions/database';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormulaCellProperties {
  propertyId: string;
  rowId: string;
  config: {
    expression: string;
    resultType: 'string' | 'number' | 'boolean' | 'date';
  };
}

export function FormulaCell({
  propertyId,
  rowId,
  config,
}: FormulaCellProperties) {
  const [result, setResult] = useState<{
    value: string | number | boolean | Date | null;
    error: string | null;
  }>({
    value: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormula = async () => {
      setLoading(true);
      try {
        const res = await computeFormulaValue(rowId, propertyId);
        setResult(res);
      } finally {
        setLoading(false);
      }
    };

    fetchFormula();
  }, [rowId, propertyId]);

  if (loading) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (result.error) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Error</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{result.error}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const formatValue = () => {
    if (result.value === null || result.value === undefined) return '-';

    switch (config.resultType) {
      case 'number': {
        return typeof result.value === 'number'
          ? result.value.toLocaleString()
          : String(result.value);
      }
      case 'boolean': {
        return result.value ? '✓' : '✗';
      }
      case 'date': {
        return new Date(result.value).toLocaleDateString();
      }
      default: {
        return String(result.value);
      }
    }
  };

  return <div className="px-2 py-1 text-sm">{formatValue()}</div>;
}
