export interface TemplateContext {
  userId: string;
  parentId?: string;

  targetPageId?: string;
}

export interface Template {
  id: string;
  label: string;
  icon: string;
  description?: string;

  content?: unknown[];

  factory?: (context: TemplateContext) => Promise<string>;
}
