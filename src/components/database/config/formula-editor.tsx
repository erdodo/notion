'use client';

import { Property } from '@prisma/client';
import { Check, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateFormula, availableFunctions } from '@/lib/formula-engine';

export interface FormulaConfig {
  expression: string;
  resultType: string;
}

interface FormulaEditorProperties {
  expression: string;
  properties: Property[];
  onChange: (expression: string) => void;
  onResultTypeChange: (type: string) => void;
  onCancel?: () => void;
}

export function FormulaEditor({
  expression,
  properties,
  onChange,
  onResultTypeChange,
  onCancel,
}: FormulaEditorProperties) {
  const [localExpression, setLocalExpression] = useState(expression);
  const [validation, setValidation] = useState<{
    valid: boolean;
    error?: string;
  }>({ valid: true });
  const [resultType, setResultType] = useState('string');
  const textareaReference = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValidation(validateFormula(localExpression));
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [localExpression]);

  const insertAtCursor = (text: string) => {
    const textarea = textareaReference.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newExpression =
      localExpression.slice(0, start) + text + localExpression.slice(end);

    setLocalExpression(newExpression);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleSave = () => {
    if (validation.valid) {
      onChange(localExpression);
    }
  };

  const handleResultTypeChange = (type: string) => {
    setResultType(type);
    onResultTypeChange(type);
  };

  return (
    <div className="space-y-4">
      {}
      <div className="space-y-2">
        <label className="text-sm font-medium">Formula</label>
        <div className="relative">
          <textarea
            ref={textareaReference}
            value={localExpression}
            onChange={(e) => {
              setLocalExpression(e.target.value);
            }}
            placeholder="Enter formula... e.g. prop('Price') * prop('Quantity')"
            className="w-full h-24 p-3 font-mono text-sm bg-muted rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {}
          <div className="absolute bottom-2 right-2">
            {validation.valid ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validation.error}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {}
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="properties" className="flex-1">
            Properties
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex-1">
            Functions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <ScrollArea className="h-32">
            <div className="flex flex-wrap gap-1 p-2">
              {properties
                .filter((p) => p.type !== 'FORMULA' && p.type !== 'ROLLUP')
                .map((property) => (
                  <Button
                    key={property.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      insertAtCursor(`prop("${property.name}")`);
                    }}
                  >
                    {property.name}
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="functions">
          <ScrollArea className="h-32">
            <div className="space-y-1 p-2">
              {availableFunctions.map((function_) => (
                <button
                  key={function_.name}
                  onClick={() => {
                    insertAtCursor(function_.syntax);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                >
                  <div>
                    <code className="text-sm font-medium">
                      {function_.name}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      {function_.description}
                    </p>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    {function_.syntax}
                  </code>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {}
      <div className="space-y-2">
        <Label>Result Type</Label>
        <Select value={resultType} onValueChange={handleResultTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Checkbox</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!validation.valid}>
          Save Formula
        </Button>
      </div>
    </div>
  );
}
