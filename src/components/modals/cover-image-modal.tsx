'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { updateDocument } from '@/app/(main)/_actions/documents';
import { SingleImageDropzone } from '@/components/single-image-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEdgeStore } from '@/lib/edgestore';

interface CoverImageModalProperties {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (url: string) => void;
}

export const CoverImageModal = ({
  isOpen,
  onClose,
  onConfirm,
}: CoverImageModalProperties) => {
  const parameters = useParams();
  const { edgestore } = useEdgeStore();
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [linkUrl, setLinkUrl] = useState('');

  const [recentImages, setRecentImages] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('notion-recent-covers');
    if (stored) {
      const parsed = JSON.parse(stored);
      const limited = parsed.slice(0, 9);
      setRecentImages(limited);
      if (parsed.length > 9) {
        localStorage.setItem('notion-recent-covers', JSON.stringify(limited));
      }
    }
  }, []);

  const addToRecent = (url: string) => {
    const updated = [
      url,
      ...recentImages.filter((index) => index !== url),
    ].slice(0, 9);
    setRecentImages(updated);
    localStorage.setItem('notion-recent-covers', JSON.stringify(updated));
  };

  const handleUpload = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);

      try {
        const res = await edgestore.coverImages.upload({
          file,
          options: {
            replaceTargetUrl: undefined,
          },
        });

        addToRecent(res.url);
        await handleSubmit(res.url);
      } catch (error) {
        console.error('Upload error', error);
      } finally {
        setIsSubmitting(false);
        setFile(undefined);
      }
    }
  };

  const handleSubmit = async (url: string) => {
    if (onConfirm) {
      onConfirm(url);
    } else if (parameters?.documentId) {
      await updateDocument(parameters.documentId as string, {
        coverImage: url,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background">
        <DialogHeader className="pt-4 px-4 bg-muted/30 pb-2">
          <DialogTitle className="text-center text-sm font-semibold text-muted-foreground">
            Cover Image
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="upload"
          className="w-[400px] h-[350px] flex flex-col mx-auto w-full"
        >
          <div className="border-b px-4">
            <TabsList className="bg-transparent w-full justify-start h-9 p-0">
              <TabsTrigger
                value="upload"
                className="px-2 pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground bg-transparent h-full mr-4 text-xs"
              >
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="px-2 pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground bg-transparent h-full mr-4 text-xs"
              >
                Link
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="px-2 pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground bg-transparent h-full mr-4 text-xs"
              >
                Recent
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="upload"
            className="flex-1 flex items-center justify-center p-4"
          >
            <SingleImageDropzone
              width={350}
              height={200}
              value={file}
              onChange={handleUpload}
              disabled={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="link" className="flex-1 p-4">
            <div className="flex flex-col gap-2 mt-4">
              <Input
                placeholder="Paste image link..."
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                }}
                className="text-xs h-8"
              />
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  if (linkUrl) {
                    addToRecent(linkUrl);
                    handleSubmit(linkUrl);
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="flex-1 p-4 overflow-y-auto">
            {recentImages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground mt-10">
                No recent images
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {recentImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-md overflow-hidden cursor-pointer hover:opacity-80 border border-border"
                    onClick={() => handleSubmit(img)}
                  >
                    <Image
                      src={img}
                      alt="Recent"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
