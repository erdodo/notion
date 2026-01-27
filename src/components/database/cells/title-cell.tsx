import { FileText, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { CellProps as CellProperties } from './types';

import { usePageNavigation } from '@/hooks/use-page-navigation';

export function TitleCell({
  getValue,
  rowId,
  column: _column,
  updateValue,
  isEditing,
  startEditing,
  stopEditing,
  row,
}: CellProperties) {
  const initialValue = getValue() as string | { value: string } | null;
  const value_ =
    typeof initialValue === 'object' && initialValue !== null
      ? initialValue.value
      : (initialValue as string);
  const [value, setValue] = useState(value_ || '');
  const { navigateToPage, pageOpenMode } = usePageNavigation();

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

  const rowOriginal = row?.original as
    | { originalRow?: { pageId: string } }
    | undefined;
  const pageId = rowOriginal?.originalRow?.pageId || rowId;

  const handleClick = (e: React.MouseEvent) => {
    console.log('TitleCell clicked', {
      isEditing,
      target: (e.target as HTMLElement).tagName,
      pageOpenMode,
      pageId,
    });

    if (isEditing) {
      console.log('Skipping navigation - editing');
      return;
    }

    if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
      console.log('Skipping navigation - textarea clicked');
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    console.log('Calling navigateToPage with:', pageId);
    navigateToPage(pageId);
  };

  return (
    <div
      className="flex items-center group relative h-full w-full min-h-[32px] cursor-pointer"
      onClick={handleClick}
    >
      <button
        onClick={handleClick}
        className="absolute left-[-20px] opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
      >
        <Maximize2 className="h-3 w-3 text-muted-foreground" />
      </button>

      {}
      <div className="mr-2 flex items-center justify-center">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>

      <TextareaAutosize
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onBlur={onBlur}
        onFocus={startEditing}
        className="w-full resize-none bg-transparent outline-none text-sm font-medium"
        minRows={1}
      />
    </div>
  );
}
