
import path from "path";
import fs from "fs/promises";
import { db } from "../db";
import { parseMarkdownToBlocks, Block } from "../import/markdown-parser";
import { importCsvAsDatabase } from "../import/csv-importer";

export async function getTemplateBlocks(
    baseDir: string,
    relativeFilePath: string,
    pageId: string,
    userId: string
) {
    const fullPath = path.join(baseDir, relativeFilePath);
    const markdownContent = await fs.readFile(fullPath, "utf-8");
    const blocks = parseMarkdownToBlocks(markdownContent);
    const processedBlocks: any[] = [];

    let lastHeading = "";

    // Logic to strip first H1 if it matches page title (or is just duplicate)
    // We don't have access to page title here easily unless passed.
    // But typically the first block <h1>Title</h1> is redundant if Notion sets Title.
    if (blocks.length > 0 && blocks[0].type === "heading" && blocks[0].props?.level === 1) {
        // Remove it for cleaner import
        blocks.shift();
    }

    for (const block of blocks) {
        // Track Headings for Context
        if (block.type === "heading" && block.content?.[0]?.text) {
            lastHeading = block.content[0].text;
        }

        // Fix Image Paths
        if (block.type === "image" && block.props?.url) {
            let url = block.props.url;
            if (!url.startsWith("http")) {
                // Assuming public/templates structure
                // We need to find the "templates" part in the path or prepend it.
                // The baseDir is /.../public/templates/TemplateName
                // The relativeFilePath is "Main.md" or "Sub/Sub.md"
                // The url is "Sub/Image.png"

                // We want the final URL to be /templates/TemplateName/Sub/Image.png

                // Let's derive the Template Root Folder Name from baseDir
                const parts = baseDir.split(path.sep);
                const templateRootName = parts[parts.length - 1]; // e.g. "Goal Setting..."

                // If the relativeFilePath has subdirs, we need to respect that?
                // Actually, the markdown links are usually relative to the markdown file.
                // If we are processing "Sub/Page.md", and it links "Image.png", it means "Sub/Image.png".
                const dirOfCurrentFile = path.dirname(relativeFilePath);
                const fullRelativePath = path.join(dirOfCurrentFile, decodeURIComponent(url));

                // Final URL: /templates/TemplateName/ + fullRelativePath
                // Handle duplicate slashes
                const webPath = `/templates/${templateRootName}/${fullRelativePath}`.replace(/\\/g, "/").replace(/\/\//g, "/");

                block.props.url = webPath;
            }
        }

        // Detect Links (CSV or Markdown)
        if (block.content && Array.isArray(block.content)) {
            const newContent = [];
            for (const contentItem of block.content) {
                if (contentItem.type === "text") {
                    const text = contentItem.text;
                    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
                    let match;
                    let lastIndex = 0;

                    while ((match = linkRegex.exec(text)) !== null) {
                        const label = match[1];
                        const linkPath = match[2];
                        const EXT = path.extname(linkPath).toLowerCase();

                        // Handle "Untitled" label using lastHeading
                        const finalLabel = (label === "Untitled" && lastHeading) ? lastHeading : label;

                        // Pre-push text before link
                        if (match.index > lastIndex) {
                            newContent.push({ type: "text", text: text.substring(lastIndex, match.index), styles: {} });
                        }

                        if (EXT === ".csv") {
                            // Import CSV
                            try {
                                const dirOfCurrentFile = path.dirname(relativeFilePath);
                                const csvRelativePath = path.join(dirOfCurrentFile, decodeURIComponent(linkPath));
                                const fullCsvPath = path.join(baseDir, csvRelativePath);

                                try {
                                    await fs.access(fullCsvPath);
                                } catch (e) {
                                    console.warn(`Template Warning: Missing CSV file ${csvRelativePath}. Skipping.`);
                                    newContent.push({ type: "text", text: `[${label}]`, styles: {} });
                                    continue;
                                }

                                const csvContent = await fs.readFile(fullCsvPath, "utf-8");

                                const result = await importCsvAsDatabase(
                                    csvContent,
                                    finalLabel,
                                    pageId,
                                    userId
                                );

                                // Create a LinkedDatabase record to display this database inline
                                const linkedDb = await db.linkedDatabase.create({
                                    data: {
                                        pageId: pageId,
                                        sourceDatabaseId: result.databaseId,
                                        title: finalLabel,
                                        viewConfig: {
                                            filters: [],
                                            sorts: [],
                                            hiddenProperties: [],
                                            view: 'table'
                                        }
                                    }
                                });

                                // Convert the block to an Inline Database linked to the new record
                                block.type = "inlineDatabase";
                                block.props = {
                                    linkedDatabaseId: linkedDb.id
                                };
                                // We don't add to newContent as this block type uses props, not content.
                                // NOTE: This assumes the CSV link is the only meaningful content in this block.
                            } catch (e) {
                                console.error("CSV Import Failed", e);
                                newContent.push({ type: "text", text: `[${label}]`, styles: {} });
                            }
                        } else if (EXT === ".md") {
                            // Import Sub-Page (Recursive)
                            try {
                                const dirOfCurrentFile = path.dirname(relativeFilePath);
                                const mdRelativePath = path.join(dirOfCurrentFile, decodeURIComponent(linkPath));

                                // Create Sub Page
                                const subPage = await db.page.create({
                                    data: {
                                        title: finalLabel,
                                        userId: userId,
                                        parentId: pageId,
                                        icon: "📄"
                                    }
                                });

                                // Recurse
                                await processTemplatePage(baseDir, mdRelativePath, subPage.id, userId);

                                newContent.push({
                                    type: "link",
                                    href: `/documents/${subPage.id}`,
                                    content: finalLabel
                                });
                            } catch (e) {
                                console.error("Sub-page Import Failed", e);
                                newContent.push({ type: "text", text: `[${label}]`, styles: {} });
                            }
                        } else {
                            // Standard Link
                            newContent.push({
                                type: "link",
                                href: linkPath,
                                content: label
                            });
                        }

                        lastIndex = linkRegex.lastIndex;
                    }

                    if (lastIndex < text.length) {
                        newContent.push({ type: "text", text: text.substring(lastIndex), styles: {} });
                    }
                } else {
                    newContent.push(contentItem);
                }
            }
            block.content = newContent;
        }

        processedBlocks.push(block);
    }

    return processedBlocks;
}

export async function processTemplatePage(
    baseDir: string,
    relativeFilePath: string,
    pageId: string,
    userId: string
) {
    const processedBlocks = await getTemplateBlocks(baseDir, relativeFilePath, pageId, userId);

    // Update Page Content
    await db.page.update({
        where: { id: pageId },
        data: {
            content: JSON.stringify(processedBlocks)
        }
    });
}
