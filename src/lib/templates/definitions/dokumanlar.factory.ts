
import path from "path";
import fs from "fs/promises";
import { Template, TemplateContext } from "../types";
import { db } from "../../db";

// Exact folder name from ls output (likely NFD on Mac, checking validity)
const TEMPLATE_ROOT_NAME = "Dökümanlar";

export const dokumanlarTemplate: Template = {
    id: "dokumanlar-template",
    label: "Dökümanlar",
    icon: "📚",
    description: "HTML export tabanlı dökümanlar şablonu.",
    factory: async (ctx: TemplateContext): Promise<string> => {
        // Find the actual directory path (handling NFC/NFD issues)
        const templatesDir = path.join(process.cwd(), "public", "templates");
        const entries = await fs.readdir(templatesDir);
        // Find folder that looks like Dökümanlar
        const targetDirName = entries.find(e => e.normalize('NFC') === "Dökümanlar");

        if (!targetDirName) {
            throw new Error("Dökümanlar template folder not found");
        }

        const baseDir = path.join(templatesDir, targetDirName);

        // Find main HTML file (Dökümanlar Sitesi...)
        const files = await fs.readdir(baseDir);
        const mainFile = files.find(f => f.endsWith(".html") && f.includes("Dökümanlar Sitesi"));

        if (!mainFile) {
            throw new Error("Main HTML file for Dökümanlar template not found");
        }

        let pageId = ctx.targetPageId;
        const pageTitle = "Dökümanlar Sitesi"; // Or extract from file

        if (pageId) {
            await db.page.update({
                where: { id: pageId },
                data: {
                    title: pageTitle,
                    icon: "📚",
                    coverImage: null
                }
            });
        } else {
            const page = await db.page.create({
                data: {
                    title: pageTitle,
                    icon: "📚",
                    userId: ctx.userId,
                    parentId: ctx.parentId || null,
                }
            });
            pageId = page.id;
        }

        // Process recursively
        await processHtmlPage(baseDir, mainFile, pageId, ctx.userId);

        return pageId;
    }
};

async function processHtmlPage(
    baseDir: string,
    relativeFilePath: string,
    pageId: string,
    userId: string
) {
    const fullPath = path.join(baseDir, relativeFilePath);
    let content = "";
    try {
        content = await fs.readFile(fullPath, "utf-8");
    } catch {
        console.warn(`Could not read file: ${fullPath}`);
        return;
    }

    const blocks = await parseHtmlToBlocks(content, baseDir, relativeFilePath, pageId, userId);

    await db.page.update({
        where: { id: pageId },
        data: {
            content: JSON.stringify(blocks)
        }
    });
}

// Simple HTML Entity Decoder
function decodeHtml(html: string) {
    return html.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x27;/g, "'");
}

async function parseHtmlToBlocks(html: string, baseDir: string, currentFileRelative: string, currentPageId: string, userId: string): Promise<any[]> {
    const blocks: any[] = [];

    // Extract .page-body content
    const bodyStartTag = '<div class="page-body">';
    const bodyStart = html.indexOf(bodyStartTag);
    if (bodyStart === -1) {
        console.warn("Could not find .page-body in HTML. Using fallback.");
        return [{ type: "paragraph", content: [{ type: "text", text: "Error: Template format not recognized.", styles: { color: "red" } }] }];
    }

    // Find the matching closing div for page-body
    const contentStart = bodyStart + bodyStartTag.length;
    const bodyContent = html.substring(contentStart);

    // Split into top-level blocks.
    const chunks = extractTopLevelDivs(bodyContent);

    console.log(`[Dökümanlar Template] Parsed ${chunks.length} chunks from ${currentFileRelative}`);

    for (const chunk of chunks) {
        // Now identify what is inside the chunk.
        // It is <div ...> INNER_CONTENT </div>
        // We want INNER_CONTENT
        const innerContentMatch = chunk.match(/<div[^>]*>(.*)<\/div>/s);
        if (!innerContentMatch) continue;

        let inner = innerContentMatch[1].trim();

        // 1. Heading
        const hMatch = inner.match(/^<h([1-3])\b[^>]*>(.*?)<\/h\1>/s);
        if (hMatch) {
            const level = parseInt(hMatch[1]);
            const text = stripTags(hMatch[2]);
            blocks.push({
                type: "heading",
                props: { level: level as any },
                content: [{ type: "text", text: decodeHtml(text), styles: {} }]
            });
            continue;
        }

        // 2. Sub-page Link (<figure class="link-to-page">)
        if (inner.includes('class="link-to-page"')) {
            const aMatch = inner.match(/<a href="(.*?)"[^>]*>(.*?)<\/a>/s);
            if (aMatch) {
                const href = aMatch[1]; // URL encoded
                const text = stripTags(aMatch[2]); // Title

                if (href.endsWith(".html")) {
                    // It is a sub-page.
                    // Calculate relative path.
                    const dirOfCurrent = path.dirname(currentFileRelative);
                    const subPageRelative = path.join(dirOfCurrent, decodeURIComponent(href));

                    // Create Page
                    const subPage = await db.page.create({
                        data: {
                            title: decodeHtml(text),
                            userId: userId,
                            parentId: currentPageId,
                            icon: "📄"
                        }
                    });

                    // Recurse
                    await processHtmlPage(baseDir, subPageRelative, subPage.id, userId);

                    // Add Link Block
                    blocks.push({
                        type: "paragraph",
                        content: [{
                            type: "link",
                            href: `/documents/${subPage.id}`,
                            content: [{ type: "text", text: decodeHtml(text), styles: {} }]
                        }]
                    });
                }
                continue;
            }
        }

        // 3. Toggle (<ul class="toggle">)
        if (inner.includes('class="toggle"')) {
            // Extract summary
            const summaryMatch = inner.match(/<summary[^>]*>(.*?)<\/summary>/s);
            const summaryText = summaryMatch ? stripTags(summaryMatch[1]) : "Toggle";

            // Extract content inside details
            // It's usually nested <div style="display:contents"> inside details
            // This is getting recursive.
            // For now, I will just extract code blocks if they exist inside, otherwise empty.
            // The example had a Code Block inside.

            // Check for code block
            let children: any[] = [];
            if (inner.includes('<code')) {
                const codeBlock = extractCodeBlock(inner);
                if (codeBlock) children.push(codeBlock);
            }

            // If no code block, maybe text?
            // Simplification: Not full recursion for now.

            blocks.push({
                type: "paragraph", // Using paragraph to represent the toggle header
                content: [{ type: "text", text: decodeHtml(summaryText), styles: {} }],
                children: children
            });
            continue;
        }

        // 4. Code Block
        const codeB = extractCodeBlock(inner);
        if (codeB) {
            blocks.push(codeB);
            continue;
        }

        // 5. Paragraph (fallback)
        // Just text
        const text = stripTags(inner);
        if (text.trim()) {
            blocks.push({
                type: "paragraph",
                content: [{ type: "text", text: decodeHtml(text), styles: {} }]
            });
        }
    }

    // Fallback if empty to catch "initialContent must be a non-empty array"
    if (blocks.length === 0) {
        console.warn(`[Dökümanlar Template] No valid blocks found in ${currentFileRelative}. Using fallback.`);
        blocks.push({ type: "paragraph", content: [{ type: "text", text: " ", styles: {} }] });
    }

    return blocks;
}

function extractCodeBlock(html: string) {
    if (html.includes('<code')) {
        const match = html.match(/<code class="language-(.*?)"[^>]*>(.*?)<\/code>/s);
        if (match) {
            const lang = match[1];
            const code = decodeHtml(match[2]);
            return {
                type: "codeBlock",
                props: { language: lang.toLowerCase() },
                content: [{ type: "text", text: code, styles: {} }]
            };
        }
    }
    return null;
}

// Helper to strip HTML tags
function stripTags(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Stack based splitter for <div style="display:contents">...</div>
function extractTopLevelDivs(html: string): string[] {
    const chunks: string[] = [];
    let depth = 0;
    let start = -1;
    let i = 0;

    while (i < html.length) {
        if (html.substring(i).startsWith("<div")) {
            // Check if it is the specific display:contents div and we are at depth 0
            // Robust check against optional spaces or attributes
            const isTarget = html.substring(i).startsWith('<div style="display:contents"');

            if (depth === 0 && isTarget) {
                start = i;
            }
            depth++;
            // Advance past <div
            i += 4;
        } else if (html.substring(i).startsWith("</div>")) {
            depth--;
            if (depth === 0 && start !== -1) {
                // Found the end of the block
                const end = i + 6; // </div>
                chunks.push(html.substring(start, end));
                start = -1;
            }
            i += 6;
        } else {
            i++;
        }
    }

    return chunks;
}
