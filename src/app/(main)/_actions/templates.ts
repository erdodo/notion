'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getTemplateById } from '@/lib/templates/registry';
import { getFactoryById } from '@/lib/templates/server-registry';

export async function applyTemplate(documentId: string, templateId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const factory = getFactoryById(templateId);
  if (factory) {
    await factory({
      userId: session.user.id,
      targetPageId: documentId,
      parentId: undefined,
    });
  } else {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.content) {
      await db.page.update({
        where: { id: documentId },
        data: {
          content: JSON.stringify(template.content),
          icon: template.icon,
          title: template.label,
        },
      });
    }
  }

  revalidatePath(`/documents/${documentId}`);
  revalidatePath('/');
}
