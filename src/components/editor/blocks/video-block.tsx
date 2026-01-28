'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { Loader2, Link as LinkIcon, Film } from 'lucide-react';
import { useState, useRef } from 'react';

import { useEdgeStore } from '@/lib/edgestore';
import { getEmbedUrl } from '@/lib/embed-utilities';
import { cn } from '@/lib/utils';

export const VideoBlock = createReactBlockSpec(
  {
    type: 'video',
    content: 'none',
    propSchema: {
      url: { default: '' },
      caption: { default: '' },
      width: { default: 512 },
    },
  },
  {
    render: (properties) => <VideoBlockContent {...properties} />,
  }
);

const VideoBlockContent = ({
  block,
  editor,
}: {
  block: any;
  editor: any;
}) => {
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
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
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
      const errorMessage =
        error_ instanceof Error ? error_.message : 'Upload failed';
      setError(errorMessage);
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

  if (block.props.url) {
    const embedUrl = getEmbedUrl(block.props.url);
    const isEmbed = !!embedUrl;

    if (isEmbed) {
      return (
        <div className="my-4 relative group w-full" contentEditable={false}>
          <div className="aspect-video w-full rounded-md overflow-hidden bg-black border relative">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video embed"
            />
          </div>
          <input
            className="text-center text-sm text-muted-foreground bg-transparent border-none outline-none mt-2 w-full placeholder:text-muted-foreground/50"
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
      <div className="my-4 relative group" contentEditable={false}>
        <div className="rounded-md overflow-hidden bg-black border relative">
          <video
            src={block.props.url}
            controls
            className="w-full h-auto max-h-[500px]"
          />
        </div>

        <input
          className="text-center text-sm text-muted-foreground bg-transparent border-none outline-none mt-2 w-full placeholder:text-muted-foreground/50"
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
                <Film className="text-muted-foreground" />
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
                  Choose a video
                </button>
                <span className="text-muted-foreground"> or drag and drop</span>
                <p className="text-xs text-muted-foreground mt-2">Max 50MB</p>
                <input
                  ref={fileInputReference}
                  type="file"
                  className="hidden"
                  accept="video/*"
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
              placeholder="YouTube, Vimeo url..."
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
