'use client';

import { BlockNoteEditor } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { Link as LinkIcon, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const BookmarkBlock = createReactBlockSpec(
  {
    type: 'bookmark',
    content: 'none',
    propSchema: {
      url: { default: '' },
    },
  },
  {
    render: (properties) => <BookmarkBlockContent {...properties} />,
  }
);

interface BookmarkBlockProps {
  block: {
    id: string;
    type: 'bookmark';
    props: {
      url: string;
    };
  };
  editor: BlockNoteEditor;
}

const BookmarkBlockContent = (properties: BookmarkBlockProps) => {
  const { block, editor } = properties;
  const url = block.props.url;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [metadata, setMetadata] = useState<{
    title?: string;
    description?: string;
    image?: { url: string };
    icon?: string;
  } | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/url-metadata?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMetadata(data.meta);
      } catch (error_) {
        console.error(error_);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const handleSetUrl = () => {
    if (!inputUrl) return;
    try {
      new URL(inputUrl);
      editor.updateBlock(block, { props: { url: inputUrl } });
    } catch {
      alert('Invalid URL');
    }
  };

  const clearUrl = () => {
    editor.updateBlock(block, { props: { url: '' } });
    setMetadata(null);
  };

  if (!url) {
    return (
      <div
        className="p-3 bg-muted/20 border rounded flex gap-2 items-center my-2"
        contentEditable={false}
      >
        <LinkIcon className="text-muted-foreground h-4 w-4" />
        <input
          className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground/50"
          placeholder="Paste a URL to create a bookmark..."
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSetUrl();
          }}
        />
        <button
          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 transition-opacity"
          onClick={handleSetUrl}
        >
          Bookmark
        </button>
      </div>
    );
  }

  return (
    <div className="my-2 group relative" contentEditable={false}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={clearUrl}
          className="bg-background/80 p-1 rounded-full border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors no-underline"
      >
        {loading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
            <Loader2 className="animate-spin h-5 w-5" />
            <span className="text-sm">Loading preview...</span>
          </div>
        ) : error ? (
          <div className="flex items-center p-4 gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Failed to load preview for {url}</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full">
            <div className="flex-1 p-3 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold truncate mb-1 text-foreground">
                  {metadata?.title || url}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2">
                  {metadata?.description || 'No description available'}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                {/* Favicon */}
                {metadata?.icon && (
                  <img
                    src={metadata.icon}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {new URL(url).hostname}
                </span>
              </div>
            </div>
            {metadata?.image?.url && (
              <div className="w-full md:w-1/3 h-32 md:h-28 overflow-hidden bg-muted relative border-l">
                {/* Preview Image */}
                <img
                  src={metadata.image.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </a>
    </div>
  );
};
