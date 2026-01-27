'use client';

import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { applyTemplate } from '@/app/(main)/_actions/templates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTemplateModal } from '@/hooks/use-template-modal';
import { getTemplates } from '@/lib/templates/registry';
import { Template } from '@/lib/templates/types';
import { cn } from '@/lib/utils';

export const TemplateModal = () => {
  const { isOpen, onClose } = useTemplateModal();
  const parameters = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const templates = getTemplates();

  const onSelect = async (template: Template) => {
    if (!parameters?.documentId) return;

    setIsLoading(true);

    try {
      await applyTemplate(parameters.documentId as string, template.id);

      globalThis.location.reload();
      toast.success('Template applied!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to apply template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-[#F7F7F5] dark:bg-[#191919]">
        <DialogHeader className="p-4 border-b bg-background">
          <DialogTitle>Choose a template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => !isLoading && onSelect(template)}
                className={cn(
                  'group flex flex-col aspect-[3/4] bg-background border rounded-lg hover:shadow-lg transition cursor-pointer overflow-hidden ring-offset-background hover:ring-2 ring-primary/20',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {}
                <div className="p-4 border-b bg-muted/30">
                  <div className="h-10 w-10 flex items-center justify-center bg-background rounded-md border text-2xl shadow-sm mb-3">
                    {template.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{template.label}</h3>
                </div>

                {}
                <div className="p-4 space-y-2 opacity-50 text-[10px] select-none pointer-events-none">
                  <div className="h-2 w-3/4 bg-foreground/20 rounded skeleton-line" />
                  <div className="h-2 w-full bg-foreground/10 rounded skeleton-line" />
                  <div className="h-2 w-5/6 bg-foreground/10 rounded skeleton-line" />
                  <div className="h-2 w-1/2 bg-foreground/10 rounded skeleton-line" />
                </div>

                <div className="mt-auto p-4 pt-0">
                  <button
                    disabled={isLoading}
                    className="w-full py-1.5 text-xs bg-primary text-primary-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Use template'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
