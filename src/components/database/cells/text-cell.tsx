import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { CellProps as CellProperties } from './types';

export function TextCell({
  getValue,
  updateValue,
  startEditing,
  stopEditing,
}: CellProperties) {
  const initialValue = getValue() as string | { value: string } | null;
  const value_ =
    typeof initialValue === 'object' && initialValue !== null
      ? initialValue.value
      : (initialValue as string);

  const [value, setValue] = useState(value_ || '');

  useEffect(() => {
    const value__ =
      typeof initialValue === 'object' && initialValue !== null
        ? initialValue.value
        : (initialValue as string);
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
    <div className="h-full w-full py-1.5 px-2 min-h-[32px]">
      <TextareaAutosize
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onBlur={onBlur}
        onFocus={startEditing}
        className="w-full resize-none bg-transparent outline-none text-sm leading-relaxed"
        minRows={1}
        placeholder="Empty"
      />
    </div>
  );
}
