import { Template } from "./types";
import { goalSettingTemplate } from "./definitions/goal-setting.factory";
import { nofiBudgetTemplate } from "./definitions/nofi-budget.factory";

const SERVER_TEMPLATES: Template[] = [
    goalSettingTemplate,
    nofiBudgetTemplate
];

export function getFactoryById(id: string) {
    const template = SERVER_TEMPLATES.find(t => t.id === id);
    return template?.factory;
}
