import { useState, useEffect } from 'react';

import { CellProps as CellProperties } from './types';

import { Checkbox } from '@/components/ui/checkbox';

export function CheckboxCell({ getValue, updateValue }: CellProperties) {
  const initialValue = getValue();
  const value =
    typeof initialValue === 'object'
      ? initialValue?.value
      : initialValue === true;

  const [checked, setChecked] = useState(!!value);

  useEffect(() => {
    const value =
      typeof initialValue === 'object'
        ? initialValue?.value
        : initialValue === true;
    queueMicrotask(() => {
      setChecked(!!value);
    });
  }, [initialValue]);

  const onChange = (v: boolean) => {
    setChecked(v);
    updateValue({ value: v });
  };

  return (
    <div className="flex h-full w-full items-center justify-center py-1.5">
      <Checkbox checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
