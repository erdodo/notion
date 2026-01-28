'use client';

import { BlockNoteEditor } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { Loader2, Mic, Music } from 'lucide-react';
import { useState, useRef } from 'react';

import { useEdgeStore } from '@/lib/edgestore';

export const AudioBlock = createReactBlockSpec(
  {
    type: 'audio',
    content: 'none',
    propSchema: {
      url: { default: '' },
      title: { default: 'Audio' },
      caption: { default: '' },
    },
  },
  {
    render: (properties) => <AudioBlockContent {...properties as any} />,
  }
);

interface AudioBlockProps {
  block: any;
  editor: any;
}

const AudioBlockContent = (properties: AudioBlockProps) => {
  const { block, editor } = properties;
  const { edgestore } = useEdgeStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const fileInputReference = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('File size must be less than 20MB');
      }

      const res = await edgestore.editorMedia.upload({
        file,
        onProgressChange: (value) => {
          setProgress(value);
        },
      });

      editor.updateBlock(block, {
        props: {
          url: res.url,
          title: file.name,
        },
      });
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (block.props.url) {
    return (
      <div className="my-2 group relative" contentEditable={false}>
        <div className="flex items-center gap-4 p-3 rounded-md border bg-muted/20">
          <div className="bg-muted p-2 rounded">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate mb-1">
              {block.props.title}
            </p>
            {/* Audio player */}
            <audio src={block.props.url} controls className="w-full h-8" />
          </div>
        </div>

        <input
          className="text-center text-sm text-muted-foreground bg-transparent border-none outline-none mt-1 w-full placeholder:text-muted-foreground/50"
          placeholder="Write a caption..."
          value={block.props.caption}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { caption: e.target.value },
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="my-2" contentEditable={false}>
      <div className="rounded-md border border-dashed p-6 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-3">
        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-2 rounded px-4">
            {error}
          </div>
        )}

        <div className="bg-background rounded-full p-3 shadow-sm border">
          {uploading ? (
            <Loader2 className="animate-spin text-muted-foreground" />
          ) : (
            <Mic className="text-muted-foreground" />
          )}
        </div>

        {uploading ? (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <p className="text-sm text-muted-foreground">
              Uploading... {progress}%
            </p>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => fileInputReference.current?.click()}
              className="text-primary hover:underline font-medium text-sm"
            >
              Upload audio
            </button>
            <span className="text-muted-foreground text-sm">
              {' '}
              or drag and drop
            </span>
            <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
            <input
              ref={fileInputReference}
              type="file"
              className="hidden"
              accept="audio/*"
              onChange={(e) =>
                e.target.files?.[0] && handleUpload(e.target.files[0])
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
