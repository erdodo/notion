import { useState, useEffect } from 'react';

import { CellProps as CellProperties } from './types';

export function NumberCell({
  getValue,
  updateValue,
  startEditing,
  stopEditing,
}: CellProperties) {
  const initialValue = getValue();
  const value_ =
    typeof initialValue === 'object' ? initialValue?.value : initialValue;
  const [value, setValue] = useState(value_ || '');

  useEffect(() => {
    const value__ =
      typeof initialValue === 'object' ? initialValue?.value : initialValue;
    queueMicrotask(() => {
      setValue(value__ || '');
    });
  }, [initialValue]);

  const onBlur = () => {
    stopEditing();

    if (value !== value_) {
      updateValue({ value: value === '' ? null : Number(value) });
    }
  };

  return (
    <div className="h-full w-full py-1.5 px-2">
      <input
        type="number"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onBlur={onBlur}
        onFocus={startEditing}
        className="w-full bg-transparent outline-none text-sm"
        placeholder="Empty"
      />
    </div>
  );
}
