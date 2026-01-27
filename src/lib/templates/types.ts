export interface TemplateContext {
    userId: string;
    parentId?: string;
    /**
     * If provided, the template will be applied to this existing page.
     * Otherwise, a new page will be created.
     */
    targetPageId?: string;
}

export interface Template {
    id: string;
    label: string;
    icon: string;
    description?: string;
    /**
     * For simple templates that are just a list of blocks.
     * These can be applied optimistically on the client or server.
     */
    content?: any[];
    /**
     * For complex templates that require server-side execution 
     * (e.g., creating multiple pages, databases, importing files).
     * Returns the ID of the created/updated page.
     */
    factory?: (ctx: TemplateContext) => Promise<string>;
}
