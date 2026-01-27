
import path from "path";
import { Template, TemplateContext } from "../types";
import { db } from "../../db";
import { processTemplatePage } from "../utils";

const TEMPLATE_DIR = path.join(process.cwd(), "public", "templates", "NoFi Budget");
const MAIN_FILE = "NoFi Budget 2f46d7d7e05f80b38581eb86921ca04d.md";

export const nofiBudgetTemplate: Template = {
    id: "nofi-budget",
    label: "NoFi Budget",
    icon: "💰",
    description: "Track your income, expenses, and savings with this budget planner.",
    factory: async (ctx: TemplateContext): Promise<string> => {
        let pageId = ctx.targetPageId;

        const pageData = {
            title: "NoFi Budget",
            icon: "📊",
            coverImage: "https://www.notion.so/images/page-cover/met_william_morris_1876.jpg", // Using a standard Notion pattern/texture as fallback
        };

        if (pageId) {
            await db.page.update({
                where: { id: pageId },
                data: pageData
            });
        } else {
            const page = await db.page.create({
                data: {
                    ...pageData,
                    userId: ctx.userId,
                    parentId: ctx.parentId || null,
                }
            });
            pageId = page.id;
        }

        await processTemplatePage(TEMPLATE_DIR, MAIN_FILE, pageId, ctx.userId);

        return pageId;
    }
};
