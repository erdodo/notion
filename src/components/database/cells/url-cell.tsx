import { useState, useEffect } from 'react';

import { CellProps as CellProperties } from './types';

export function UrlCell({
  getValue,
  updateValue,
  startEditing,
  stopEditing,
  isEditing,
}: CellProperties) {
  const initialValue = getValue();
  const value_ =
    typeof initialValue === 'object' ? (initialValue as any)?.value : initialValue;
  const [value, setValue] = useState(value_ || '');

  useEffect(() => {
    const value__ =
      typeof initialValue === 'object' ? (initialValue as any)?.value : initialValue;
    queueMicrotask(() => {
      setValue(value__ || '');
    });
  }, [initialValue]);

  const onBlur = () => {
    stopEditing();
    if (value !== value_) {
      updateValue({ value: value });
    }
  };

  return (
    <div className="h-full w-full py-1.5 px-2">
      {value && !isEditing ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate block"
        >
          {value}
        </a>
      ) : (
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onBlur={onBlur}
          onFocus={startEditing}
          className="w-full bg-transparent outline-none text-sm"
          placeholder="Empty"
        />
      )}
    </div>
  );
}
