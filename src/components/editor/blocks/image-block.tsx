'use client';

import { Block, BlockNoteEditor } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import {
  Loader2,
  Link as LinkIcon,
  UploadCloud,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { useEdgeStore } from '@/lib/edgestore';
import { cn } from '@/lib/utils';

interface ImageBlockComponentProps {
  block: any;
  editor: any;
}

const ImageBlockComponent = ({ block, editor }: ImageBlockComponentProps) => {
  const { edgestore } = useEdgeStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'embed'>('upload');

  const fileInputReference = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('File size must be less than 4MB');
      }

      const res = await edgestore.editorMedia.upload({
        file,
        onProgressChange: (value) => {
          setProgress(value);
        },
      });

      editor.updateBlock(block, {
        props: { url: res.url },
      });
    } catch (error_: unknown) {
      setError((error_ as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!inputUrl) return;
    try {
      new URL(inputUrl);
      editor.updateBlock(block, {
        props: { url: inputUrl },
      });
    } catch {
      setError('Invalid URL');
    }
  };

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(block.props.width);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX;

      const newWidth = Math.max(
        100,
        Math.min(
          1200,
          startWidth + diff * (block.props.align === 'center' ? 2 : 1)
        )
      );

      editor.updateBlock(block, {
        props: { width: Math.round(newWidth) },
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, startX, startWidth, block, editor]);

  if (block.props.url) {
    return (
      <div
        className={cn(
          'group flex flex-col my-4 relative',
          block.props.align === 'left' && 'items-start',
          block.props.align === 'center' && 'items-center',
          block.props.align === 'right' && 'items-end',
          block.props.align === 'full' && 'items-center w-full'
        )}
      >
        <div
          className="relative transition-all"
          style={{
            width:
              block.props.align === 'full' ? '100%' : `${block.props.width}px`,
            maxWidth: '100%',
          }}
        >
          {}
          <div className="relative overflow-hidden rounded-md border bg-muted/20">
            {}
            <img
              src={block.props.url}
              alt={block.props.caption || 'Image'}
              className="w-full h-auto object-contain"
            />

            {}
            {block.props.align !== 'full' && (
              <div
                className="absolute right-2 bottom-2 w-4 h-4 bg-white/80 rounded border shadow cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                onMouseDown={onMouseDown}
              >
                <Maximize size={10} className="text-black rotate-90" />
              </div>
            )}
          </div>

          {}
          <div className="absolute top-2 right-2 flex gap-1 bg-black/50 backdrop-blur-sm rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() =>
                editor.updateBlock(block, { props: { align: 'left' } })
              }
              className={cn(
                'p-1 rounded hover:bg-white/20 text-white',
                block.props.align === 'left' && 'bg-white/30'
              )}
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() =>
                editor.updateBlock(block, { props: { align: 'center' } })
              }
              className={cn(
                'p-1 rounded hover:bg-white/20 text-white',
                block.props.align === 'center' && 'bg-white/30'
              )}
            >
              <AlignCenter size={14} />
            </button>
            <button
              onClick={() =>
                editor.updateBlock(block, { props: { align: 'right' } })
              }
              className={cn(
                'p-1 rounded hover:bg-white/20 text-white',
                block.props.align === 'right' && 'bg-white/30'
              )}
            >
              <AlignRight size={14} />
            </button>
            <button
              onClick={() =>
                editor.updateBlock(block, { props: { align: 'full' } })
              }
              className={cn(
                'p-1 rounded hover:bg-white/20 text-white',
                block.props.align === 'full' && 'bg-white/30'
              )}
            >
              <Maximize size={14} />
            </button>
          </div>
        </div>

        {}
        <input
          className="text-center text-sm text-muted-foreground bg-transparent border-none outline-none mt-2 w-full placeholder:text-muted-foreground/50"
          placeholder="Write a caption..."
          value={(block.props as any).caption || ''}
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
      <div className="rounded-md border border-dashed p-8 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-4">
        <div className="flex gap-4 mb-4 border-b w-full justify-center pb-2">
          <button
            onClick={() => {
              setActiveTab('upload');
            }}
            className={cn(
              'text-sm font-medium transition-colors pb-2 -mb-2.5 border-b-2',
              activeTab === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Upload
          </button>
          <button
            onClick={() => {
              setActiveTab('embed');
            }}
            className={cn(
              'text-sm font-medium transition-colors pb-2 -mb-2.5 border-b-2',
              activeTab === 'embed'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Embed Link
          </button>
        </div>

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-2 rounded px-4">
            {error}
          </div>
        )}

        {activeTab === 'upload' ? (
          <>
            <div className="bg-background rounded-full p-4 shadow-sm border">
              {uploading ? (
                <Loader2 className="animate-spin text-muted-foreground" />
              ) : (
                <UploadCloud className="text-muted-foreground" />
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
                  className="text-primary hover:underline font-medium"
                >
                  Choose an image
                </button>
                <span className="text-muted-foreground"> or drag and drop</span>
                <p className="text-xs text-muted-foreground mt-2">Max 5MB</p>
                <input
                  ref={fileInputReference}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleUpload(e.target.files[0])
                  }
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex w-full max-w-sm items-center gap-2">
            <LinkIcon className="text-muted-foreground h-4 w-4" />
            <input
              className="flex-1 bg-transparent border rounded px-2 py-1 text-sm outline-none focus:ring-1 ring-primary"
              placeholder="Paste image URL..."
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:opacity-90"
            >
              Embed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ImageBlock = createReactBlockSpec(
  {
    type: 'image',
    content: 'none',
    propSchema: {
      url: { default: '' },
      caption: { default: '' },
      width: { default: 512 },
      align: { default: 'center', values: ['left', 'center', 'right', 'full'] },
    },
  },
  {
    render: (properties) => {
      const { block, editor } = properties;
      return <ImageBlockComponent block={block as any} editor={editor as any} />;
    },
  }
);
