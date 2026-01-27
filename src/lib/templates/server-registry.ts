import { dokumanlarTemplate } from './definitions/dokumanlar.factory';
import { goalSettingTemplate } from './definitions/goal-setting.factory';
import { nofiBudgetTemplate } from './definitions/nofi-budget.factory';
import { Template } from './types';

const SERVER_TEMPLATES: Template[] = [
  goalSettingTemplate,
  nofiBudgetTemplate,
  dokumanlarTemplate,
];

export function getFactoryById(id: string) {
  const template = SERVER_TEMPLATES.find((t) => t.id === id);
  return template?.factory;
}
