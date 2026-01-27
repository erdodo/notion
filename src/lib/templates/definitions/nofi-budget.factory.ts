import path from 'node:path';

import { db as database } from '../../db';
import { Template, TemplateContext } from '../types';
import { processTemplatePage } from '../utils';

const TEMPLATE_DIR = path.join(
  process.cwd(),
  'public',
  'templates',
  'NoFi Budget'
);
const MAIN_FILE = 'NoFi Budget 2f46d7d7e05f80b38581eb86921ca04d.md';

export const nofiBudgetTemplate: Template = {
  id: 'nofi-budget',
  label: 'NoFi Budget',
  icon: '💰',
  description:
    'Track your income, expenses, and savings with this budget planner.',
  factory: async (context: TemplateContext): Promise<string> => {
    let pageId = context.targetPageId;

    const pageData = {
      title: 'NoFi Budget',
      icon: '📊',
      coverImage:
        'https://www.notion.so/images/page-cover/met_william_morris_1876.jpg',
    };

    if (pageId) {
      await database.page.update({
        where: { id: pageId },
        data: pageData,
      });
    } else {
      const page = await database.page.create({
        data: {
          ...pageData,
          userId: context.userId,
          parentId: context.parentId || null,
        },
      });
      pageId = page.id;
    }

    await processTemplatePage(TEMPLATE_DIR, MAIN_FILE, pageId, context.userId);

    return pageId;
  },
};
