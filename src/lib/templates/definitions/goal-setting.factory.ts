
import path from "path";
import { Template, TemplateContext } from "../types";
import { db } from "../../db";
import { processTemplatePage, getTemplateBlocks } from "../utils";

const TEMPLATE_DIR = path.join(process.cwd(), "public", "templates", "Goal Setting and Vision Board Template");
const MAIN_FILE = "Goal Setting and Vision Board Template 2f46d7d7e05f80809fc8ccbd9545dafe.md";

export const goalSettingTemplate: Template = {
    id: "goal-setting-vision-board",
    label: "Goal Setting & Vision Board",
    icon: "🎯",
    description: "Plan your life with clarity using this comprehensive template.",
    factory: async (ctx: TemplateContext): Promise<string> => {
        let pageId = ctx.targetPageId;

        const pageData = {
            title: "Goal Setting & Vision Board",
            icon: "🎯",
            coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3",
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

        // Get processed blocks but don't save yet
        const blocks = await getTemplateBlocks(TEMPLATE_DIR, MAIN_FILE, pageId, ctx.userId);

        // --- Layout Transformation Strategy ---
        // 1. Group "Databases" (inline dbs) into a 2-column grid if they appear consecutively.
        // 2. Group the "Vision Board" (callouts/images at the end) into a 3-column masonry/grid.

        const newBlocks: any[] = [];
        let i = 0;

        while (i < blocks.length) {
            const block = blocks[i];

            // 1. Database Grid Detection (2 consecutive inlineDatabase blocks)
            if (block.type === "inlineDatabase") {
                const buffer = [block];
                let next = blocks[i + 1];
                if (next && next.type === "inlineDatabase") {
                    buffer.push(next);
                    i += 2; // Skip both

                    // Create 2-Col Grid
                    newBlocks.push({
                        type: "grid",
                        props: {
                            columns: 2,
                            col1: JSON.stringify([buffer[0]]),
                            col2: JSON.stringify([buffer[1]])
                        }
                    });
                    continue;
                }
            }

            // 2. Vision Board / Callout Grid Detection
            // If we hit the Vision Board section (e.g. lots of callouts or images/paragraphs)
            // Heuristic: If we see > 2 consecutive callouts or mixed images/callouts
            if (block.type === "callout" || (block.type === "image" && !block.props.url.includes("gumroad"))) {
                // Check ahead
                const buffer = [block];
                let lookahead = 1;
                while (i + lookahead < blocks.length) {
                    const next = blocks[i + lookahead];
                    if (next.type === "callout" || next.type === "image" || next.type === "quote" || (next.type === "paragraph" && next.content.length === 0)) {
                        // Include empty paragraphs often found between elements
                        buffer.push(next);
                        lookahead++;
                    } else {
                        break;
                    }
                }

                // If we found a chunk of > 2 items suitable for grid
                if (buffer.length > 2) {
                    i += lookahead;

                    // Distribute into 3 columns
                    const col1: any[] = [];
                    const col2: any[] = [];
                    const col3: any[] = [];

                    buffer.forEach((b, idx) => {
                        const colIndex = idx % 3;
                        if (colIndex === 0) col1.push(b);
                        else if (colIndex === 1) col2.push(b);
                        else col3.push(b);
                    });

                    newBlocks.push({
                        type: "grid",
                        props: {
                            columns: 3,
                            col1: JSON.stringify(col1),
                            col2: JSON.stringify(col2),
                            col3: JSON.stringify(col3)
                        }
                    });
                    continue;
                }
            }

            newBlocks.push(block);
            i++;
        }

        // Save
        await db.page.update({
            where: { id: pageId },
            data: {
                content: JSON.stringify(newBlocks)
            }
        });

        return pageId;
    }
};
