"use server"

import { auth } from "@/lib/auth"
import { getTemplateById } from "@/lib/templates/registry"
import { getFactoryById } from "@/lib/templates/server-registry"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function applyTemplate(documentId: string, templateId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // 1. Check Server Factories first
    const factory = getFactoryById(templateId)
    if (factory) {
        await factory({
            userId: session.user.id,
            targetPageId: documentId,
            parentId: undefined
        })
    } else {
        // 2. Fallback to Static/Legacy Templates
        const template = getTemplateById(templateId)
        if (!template) {
            throw new Error("Template not found")
        }

        if (template.content) {
            await db.page.update({
                where: { id: documentId },
                data: {
                    content: JSON.stringify(template.content),
                    icon: template.icon,
                    title: template.label
                }
            })
        }
    }

    revalidatePath(`/documents/${documentId}`)
    revalidatePath("/")
}
