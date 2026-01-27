import { Template } from "./types";
import { TEMPLATES as LEGACY_TEMPLATES } from "@/lib/templates";
import { goalSettingMetadata } from "./definitions/goal-setting";
import { nofiBudgetMetadata } from "./definitions/nofi-budget";

export const TEMPLATE_REGISTRY: Template[] = [
    goalSettingMetadata,
    nofiBudgetMetadata,
    ...LEGACY_TEMPLATES,
];

export function getTemplates(): Template[] {
    return TEMPLATE_REGISTRY;
}

export function getTemplateById(id: string): Template | undefined {
    return TEMPLATE_REGISTRY.find(t => t.id === id);
}
