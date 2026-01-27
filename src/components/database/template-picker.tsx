'use client';

import { DatabaseTemplate } from '@prisma/client';
import { Plus, FileText, Star, Settings } from 'lucide-react';

import { createRowFromTemplate, addRow } from '@/app/(main)/_actions/database';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TemplatePickerProperties {
  databaseId: string;
  templates: DatabaseTemplate[];
  onManageTemplates: () => void;
}

export function TemplatePicker({
  databaseId,
  templates,
  onManageTemplates,
}: TemplatePickerProperties) {
  const defaultTemplate = templates.find((t) => t.isDefault);
  const otherTemplates = templates.filter((t) => !t.isDefault);

  const handleNewBlank = async () => {
    await addRow(databaseId);
  };

  const handleUseTemplate = async (templateId: string) => {
    await createRowFromTemplate(databaseId, templateId);
  };

  if (templates.length === 0) {
    return (
      <Button
        onClick={handleNewBlank}
        variant="ghost"
        className="w-full justify-start"
      >
        <Plus className="h-4 w-4 mr-2" />
        New
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {}
        <DropdownMenuItem onClick={handleNewBlank}>
          <FileText className="h-4 w-4 mr-2" />
          Blank page
        </DropdownMenuItem>

        {}
        {defaultTemplate && (
          <DropdownMenuItem
            onClick={() => handleUseTemplate(defaultTemplate.id)}
          >
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            {defaultTemplate.icon} {defaultTemplate.name}
          </DropdownMenuItem>
        )}

        {}
        {otherTemplates.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {otherTemplates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleUseTemplate(template.id)}
              >
                <span className="mr-2">{template.icon || '📄'}</span>
                {template.name}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onManageTemplates}>
          <Settings className="h-4 w-4 mr-2" />
          Manage templates
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
