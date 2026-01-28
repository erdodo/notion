'use client';

import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEdgeStore } from '@/lib/edgestore';

interface IconPickerProperties {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker = ({
  onChange,
  children,
  asChild,
}: IconPickerProperties) => {
  const { resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme || 'light') as keyof typeof themeMap;
  const { edgestore } = useEdgeStore();
  const [isUploading, setIsUploading] = useState(false);

  const themeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };

  const theme = themeMap[currentTheme];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await edgestore.coverImages.upload({ file });
      onChange(res.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="p-0 w-full border-none shadow-none">
        <div className="flex flex-col">
          <div className="p-2 border-b">
            <label
              htmlFor="icon-upload"
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted rounded transition"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload custom icon'}
              <input
                id="icon-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <EmojiPicker
            height={350}
            theme={theme}
            onEmojiClick={(data) => {
              onChange(data.emoji);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
